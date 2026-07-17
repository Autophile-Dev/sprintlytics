import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../../models/User";
import OTP from "../../models/OTP";
import { checkRateLimit } from "../../utils/rateLimiter";
import { sendMail } from "../../utils/mailer";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
});

export default defineEventHandler(async (event) => {
  // 1. Enforce rate limiting: Max 3 request attempts per IP per 15 minutes
  await checkRateLimit(event, "forgot-password", 3, 900);

  // 2. Validate input
  const body = await readBody(event);
  const parseResult = forgotPasswordSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid email address format.",
    });
  }

  const { email } = parseResult.data;

  // Generic response to prevent email discovery (user enumeration protection)
  const genericResponse = {
    success: true,
    message: "If that email address is registered, a password reset code has been sent.",
  };

  // 3. Look up user
  const user = await User.findOne({ email });

  // If user doesn't exist, return success response immediately without revealing anything
  if (!user) {
    return genericResponse;
  }

  // Ensure user is verified (unverified accounts must verify their email via registration flow first)
  if (!user.isVerified) {
    return genericResponse;
  }

  // 4. Invalidate old reset codes
  await OTP.deleteMany({ email, purpose: "password_reset" });

  // 5. Generate and hash the 6-digit reset OTP
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const hashedCode = await bcrypt.hash(rawOtp, 8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  await OTP.create({
    email,
    codeHash: hashedCode,
    purpose: "password_reset",
    expiresAt,
  });

  // 6. Send the reset OTP email
  await sendMail({
    to: email,
    subject: "Reset Your Password - Sprintlytics",
    text: `Your password reset code is ${rawOtp}. This code expires in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Password Reset Request</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">We received a request to reset your password. Use the following code to proceed:</p>
        <div style="background-color: #f1f5f9; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 6px; margin: 24px 0; color: #dc2626;">
          ${rawOtp}
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 20px;">This code will expire in 5 minutes. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `,
  });

  return genericResponse;
});
