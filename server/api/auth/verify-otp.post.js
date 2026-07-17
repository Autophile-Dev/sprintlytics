import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "../../models/User";
import OTP from "../../models/OTP";
import { checkRateLimit } from "../../utils/rateLimiter";

const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  code: z.string().length(6, "Code must be exactly 6 digits"),
});

export default defineEventHandler(async (event) => {
  // 1. Enforce rate limiting: Max 10 attempts per IP per 5 mins
  await checkRateLimit(event, "verify-otp", 10, 300);

  // 2. Validate input
  const body = await readBody(event);
  const parseResult = verifyOtpSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: parseResult.error.errors.map(e => e.message).join(", "),
    });
  }

  const { email, code } = parseResult.data;

  // 3. Retrieve the OTP document
  const otpRecord = await OTP.findOne({ email, purpose: "email_verification" });
  if (!otpRecord) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Verification code has expired or is invalid.",
    });
  }

  // 4. Check failed verification attempts (max 3 allowed)
  if (otpRecord.attempts >= 3) {
    await OTP.deleteOne({ _id: otpRecord._id });
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Too many failed verification attempts. Please request a new code.",
    });
  }

  // Increment verification attempts atomically
  otpRecord.attempts += 1;
  await otpRecord.save();

  // 5. Compare the hashed OTP code
  const isMatch = await bcrypt.compare(code, otpRecord.codeHash);
  if (!isMatch) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Verification code has expired or is invalid.",
    });
  }

  // 6. Verify and activate the user
  const user = await User.findOne({ email });
  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: "User account not found.",
    });
  }

  user.isVerified = true;
  await user.save();

  // 7. Cleanup used OTP record
  await OTP.deleteMany({ email, purpose: "email_verification" });

  return {
    success: true,
    message: "Email verified successfully! You can now log in.",
  };
});
