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
  try {
    // 1. Enforce rate limiting: Max 5 login attempts per IP per minute
    try {
      await checkRateLimit(event, "login", 5, 60);
    } catch (rateLimitError) {
      // If it's already a H3 error (429 Too Many Requests), re-throw it
      if (rateLimitError.statusCode === 429) throw rateLimitError;
      // Otherwise it's a DB connectivity issue with the rate limiter — skip silently
      console.warn("[Login] Rate limiter DB unavailable, skipping:", rateLimitError.message);
    }

    // 2. Validate input
    const body = await readBody(event);
    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      throw createError({
        statusCode: 400,
        statusMessage: "Bad Request",
        message: "Please enter a valid email address and password.",
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
        message: `Account temporarily locked after too many failed attempts. Try again in ${lockTimeRemaining} minute${lockTimeRemaining !== 1 ? "s" : ""}.`,
      });
    }

    // 5. Verify password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      await user.incLoginAttempts();
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "Invalid email or password.",
      });
    }

    // 6. Successful login: Reset failed attempts counter
    await user.resetLoginAttempts();

    // 7. Generate JWT
    const config = useRuntimeConfig();
    const jwtSecret = process.env.JWT_SECRET || config.jwtSecret;
    if (!jwtSecret) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Authentication configuration error. Please contact support.",
      });
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || config.jwtExpiresIn || "1h";
    const token = jwt.sign(
      { userId: user._id, roles: user.roles },
      jwtSecret,
      { expiresIn }
    );

    // 8. Deliver JWT inside a secure HTTP-Only cookie
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIES === "true" || config.secureCookies,
      sameSite: "strict",
      path: "/",
      maxAge: 3600,
    });

    return {
      success: true,
      user: {
        email: user.email,
        roles: user.roles,
      },
    };

  } catch (error) {
    // Re-throw intentional H3 errors as-is
    if (error.statusCode) throw error;

    // Catch all unexpected errors (DB timeouts, network issues) with a friendly message
    console.error("[Login] Unexpected error:", error.message);
    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
      message: "Unable to connect to the server. Please try again in a moment.",
    });
  }
});
