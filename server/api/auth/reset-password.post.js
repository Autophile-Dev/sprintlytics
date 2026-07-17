import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "../../models/User";
import OTP from "../../models/OTP";
import { checkRateLimit } from "../../utils/rateLimiter";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  code: z.string().length(6, "Code must be exactly 6 digits"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export default defineEventHandler(async (event) => {
  // 1. Enforce rate limiting: Max 5 reset attempts per IP per 5 minutes
  await checkRateLimit(event, "reset-password", 5, 300);

  // 2. Validate input
  const body = await readBody(event);
  const parseResult = resetPasswordSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: parseResult.error.errors.map(e => e.message).join(", "),
    });
  }

  const { email, code, newPassword } = parseResult.data;

  // 3. Retrieve the OTP document
  const otpRecord = await OTP.findOne({ email, purpose: "password_reset" });
  if (!otpRecord) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Reset code has expired or is invalid.",
    });
  }

  // 4. Prevent OTP brute-forcing by checking failed attempts (max 3 allowed)
  if (otpRecord.attempts >= 3) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Too many failed reset attempts. Please request a new password reset code.",
    });
  }

  // Increment verification attempts atomically
  otpRecord.attempts += 1;
  await otpRecord.save();

  // 5. Compare the hashed reset OTP code
  const isMatch = await bcrypt.compare(code, otpRecord.codeHash);
  if (!isMatch) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Reset code has expired or is invalid.",
    });
  }

  // 6. Retrieve and update the user
  const user = await User.findOne({ email });
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User account not found.",
    });
  }

  // Hash new password using 12 rounds
  const hashedNewPassword = await bcrypt.hash(newPassword, 12);
  user.password = hashedNewPassword;
  
  // Clean login lockout states
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // 7. Cleanup used reset OTP record
  await OTP.deleteMany({ email, purpose: "password_reset" });

  return {
    success: true,
    message: "Password reset successful! You can now log in with your new password.",
  };
});
