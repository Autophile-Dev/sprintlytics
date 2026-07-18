import { z } from "zod";
import bcrypt from "bcryptjs";
import User from "../../models/User";
import { checkRateLimit } from "../../utils/rateLimiter";

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
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "Email is already registered.",
    });
  }

  // 4. Create new user (automatically verified)
  const hashedPassword = await bcrypt.hash(password, 12);
  await User.create({
    email,
    password: hashedPassword,
    isVerified: true,
    roles: ["user"],
  });

  return {
    success: true,
    message: "Registration successful! You can now log in with your credentials.",
  };
});
