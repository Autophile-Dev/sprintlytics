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

  // Ensure user is verified
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

  // 6. Send high-grade, styled HTML reset OTP email
  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Sprintlytics</title>
</head>
<body style="margin:0; padding:0; background-color:#F3F4F6; font-family: 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#F3F4F6; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 540px; background-color:#ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #E5E7EB;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #065F46 0%, #059669 100%); padding: 32px 24px; text-align: center;">
              <div style="display: inline-block; background: rgba(255,255,255,0.15); padding: 10px 22px; border-radius: 12px;">
                <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px; font-family: sans-serif;">
                  ⚡ Sprintlytics
                </span>
              </div>
              <p style="margin: 8px 0 0 0; color: #A7F3D0; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">
                Agile Performance & Analytics Platform
              </p>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 10px 0; color: #111827; font-size: 22px; font-weight: 700; text-align: center;">
                Password Reset Verification
              </h2>
              <p style="margin: 0 0 24px 0; color: #4B5563; font-size: 15px; line-height: 1.6; text-align: center;">
                We received a request to reset the password for your account (<strong>${email}</strong>). Use the 6-digit verification code below to authorize your password update:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #ECFDF5; border: 2px dashed #059669; border-radius: 14px; padding: 22px; text-align: center; margin: 24px 0;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; color: #047857; letter-spacing: 10px; display: block; margin-left: 10px;">
                  ${rawOtp}
                </span>
                <div style="margin-top: 12px;">
                  <span style="display: inline-block; background: #D1FAE5; color: #065F46; font-size: 12px; font-weight: 600; padding: 4px 14px; border-radius: 20px;">
                    ⏱️ Expires in 5 Minutes
                  </span>
                </div>
              </div>

              <!-- Security Warning -->
              <div style="background-color: #FFFBEB; border-left: 4px solid #F59E0B; border-radius: 6px; padding: 14px 16px; margin-bottom: 24px;">
                <p style="margin: 0; color: #92400E; font-size: 13px; line-height: 1.5;">
                  <strong>Security Reminder:</strong> If you did not request this password reset, please ignore this email or contact support. Never share this 6-digit code with anyone.
                </p>
              </div>

              <p style="margin: 0; color: #6B7280; font-size: 13px; text-align: center;">
                Need help? Contact <a href="mailto:support@sprintlytics.com" style="color: #059669; text-decoration: none; font-weight: 600;">support@sprintlytics.com</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F9FAFB; padding: 20px 24px; text-align: center; border-top: 1px solid #F3F4F6;">
              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Sprintlytics Analytics Inc. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  await sendMail({
    to: email,
    subject: "Reset Your Password - Sprintlytics Code",
    text: `Your Sprintlytics password reset code is ${rawOtp}. This code expires in 5 minutes.`,
    html: htmlTemplate,
  });

  return genericResponse;
});
