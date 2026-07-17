import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import User from "../../models/User";
import OTP from "../../models/OTP";
import { checkRateLimit } from "../../utils/rateLimiter";
import { sendMail } from "../../utils/mailer";

// Strict validation schema for registration
const registerSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export default defineEventHandler(async (event) => {
  // 1. Enforce rate limiting: Max 5 registration attempts per IP per hour
  await checkRateLimit(event, "register", 5, 3600);

  // 2. Parse and validate body
  const body = await readBody(event);
  const parseResult = registerSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: parseResult.error.errors.map(e => e.message).join(", "),
    });
  }

  const { email, password } = parseResult.data;

  // 3. Check for existing user
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    if (existingUser.isVerified) {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "Email is already registered and verified.",
      });
    }

    // User exists but is unverified; allow updating password and resending OTP
    const hashedPassword = await bcrypt.hash(password, 12);
    existingUser.password = hashedPassword;
    await existingUser.save();

    // Remove any stale verification OTPs
    await OTP.deleteMany({ email, purpose: "email_verification" });

    // Generate new OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const hashedCode = await bcrypt.hash(rawOtp, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await OTP.create({
      email,
      codeHash: hashedCode,
      purpose: "email_verification",
      expiresAt,
    });

    // Send verification email
    await sendMail({
      to: email,
      subject: "Verify Your Email - Sprintlytics",
      text: `Your verification code is ${rawOtp}. This code expires in 5 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px;">
          <h2 style="color: #0f172a; margin-bottom: 16px;">Verify Your Email Address</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">Thank you for signing up! Please verify your email by entering the code below:</p>
          <div style="background-color: #f1f5f9; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 6px; margin: 24px 0; color: #0f172a;">
            ${rawOtp}
          </div>
          <p style="color: #64748b; font-size: 14px; line-height: 20px;">This code will expire in 5 minutes. If you did not make this request, you can safely ignore this email.</p>
        </div>
      `,
    });

    return {
      success: true,
      message: "Account exists but is unverified. A new verification OTP has been sent to your email.",
    };
  }

  // 4. Create new user
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    email,
    password: hashedPassword,
    isVerified: false,
    roles: ["user"],
  });

  // 5. Generate and send verification OTP
  const rawOtp = crypto.randomInt(100000, 999999).toString();
  const hashedCode = await bcrypt.hash(rawOtp, 8);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await OTP.create({
    email,
    codeHash: hashedCode,
    purpose: "email_verification",
    expiresAt,
  });

  await sendMail({
    to: email,
    subject: "Verify Your Email - Sprintlytics",
    text: `Your verification code is ${rawOtp}. This code expires in 5 minutes.`,
    html: `
      <div style="font-family: sans-serif; padding: 25px; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 8px;">
        <h2 style="color: #0f172a; margin-bottom: 16px;">Verify Your Email Address</h2>
        <p style="color: #475569; font-size: 16px; line-height: 24px;">Thank you for signing up! Please verify your email by entering the code below:</p>
        <div style="background-color: #f1f5f9; padding: 20px; font-size: 32px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 6px; margin: 24px 0; color: #0f172a;">
          ${rawOtp}
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 20px;">This code will expire in 5 minutes. If you did not make this request, you can safely ignore this email.</p>
      </div>
    `,
  });

  return {
    success: true,
    message: "Registration successful. Please check your email for the verification code.",
  };
});
