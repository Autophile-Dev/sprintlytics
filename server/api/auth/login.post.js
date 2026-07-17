import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import { checkRateLimit } from "../../utils/rateLimiter";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string(),
});

// Dummy hash used to match the execution time of bcrypt.compare when the user does not exist.
// This prevents timing-based user enumeration.
const DUMMY_HASH = "$2a$12$N9qo8uLOqpGCQHiaLk.IG.3E23337Bf1VpK4b8pI2u/6j6p1e2u/6";

export default defineEventHandler(async (event) => {
  // 1. Enforce rate limiting: Max 5 login attempts per IP per minute
  await checkRateLimit(event, "login", 5, 60);

  // 2. Validate input
  const body = await readBody(event);
  const parseResult = loginSchema.safeParse(body);
  if (!parseResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid email or password structure.",
    });
  }

  const { email, password } = parseResult.data;

  // 3. Retrieve user
  const user = await User.findOne({ email });

  // Timing attack mitigation: if user does not exist, run a comparison anyway
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid email or password.",
    });
  }

  // 4. Verify account lockout status
  if (user.isLocked) {
    const lockTimeRemaining = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
    throw createError({
      statusCode: 423,
      statusMessage: "Locked",
      message: `Account is temporarily locked due to multiple failed attempts. Please try again in ${lockTimeRemaining} minutes.`,
    });
  }

  // 5. Ensure email is verified
  if (!user.isVerified) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Your email address is not verified. Please verify your email first.",
    });
  }

  // 6. Verify password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    // Record failed login attempt and potentially lock the account
    await user.incLoginAttempts();
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid email or password.",
    });
  }

  // 7. Successful login: Reset failed attempts counter
  await user.resetLoginAttempts();

  // 8. Generate JWT
  const config = useRuntimeConfig();
  const jwtSecret = process.env.JWT_SECRET || config.jwtSecret;
  if (!jwtSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
      message: "Authentication server configuration error.",
    });
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || config.jwtExpiresIn || "1h";
  const token = jwt.sign(
    { userId: user._id, roles: user.roles },
    jwtSecret,
    { expiresIn }
  );

  // Determine cookie expiration matching the JWT expiration (1h = 3600 seconds)
  const maxAge = 3600;

  // 9. Deliver JWT inside a secure HTTP-Only cookie
  setCookie(event, "auth_token", token, {
    httpOnly: true,
    secure: process.env.SECURE_COOKIES === "true" || config.secureCookies,
    sameSite: "strict",
    path: "/",
    maxAge,
  });

  return {
    success: true,
    user: {
      email: user.email,
      roles: user.roles,
    },
  };
});
