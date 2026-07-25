import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../../models/User";
import RememberToken from "../../models/RememberToken";
import { checkRateLimit } from "../../utils/rateLimiter";

const loginSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  password: z.string(),
  rememberMe: z.boolean().optional().default(false),
});

// Dummy hash used to match execution time of bcrypt.compare when user does not exist.
const DUMMY_HASH = "$2a$12$N9qo8uLOqpGCQHiaLk.IG.3E23337Bf1VpK4b8pI2u/6j6p1e2u/6";

export default defineEventHandler(async (event) => {
  try {
    // 1. Enforce rate limiting: Max 5 login attempts per IP per minute
    try {
      await checkRateLimit(event, "login", 5, 60);
    } catch (rateLimitError) {
      if (rateLimitError.statusCode === 429) throw rateLimitError;
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

    const { email, password, rememberMe } = parseResult.data;

    // 3. Retrieve user
    const user = await User.findOne({ email });

    // Timing attack mitigation
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

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 3600; // 30 days vs 1 hour
    const expiresIn = rememberMe ? "30d" : (process.env.JWT_EXPIRES_IN || config.jwtExpiresIn || "1h");

    const token = jwt.sign(
      { userId: user._id, roles: user.roles },
      jwtSecret,
      { expiresIn }
    );

    // 8. Deliver JWT inside secure HTTP-Only cookie
    setCookie(event, "auth_token", token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIES === "true" || config.secureCookies,
      sameSite: "strict",
      path: "/",
      maxAge,
    });

    // 9. If Remember Me is enabled, persist long-lived session token in DB
    if (rememberMe) {
      try {
        const rawRememberToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(rawRememberToken).digest("hex");
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        await RememberToken.create({
          userId: user._id,
          email: user.email,
          tokenHash,
          userAgent: getHeader(event, "user-agent") || "Unknown Device",
          ipAddress: getHeader(event, "x-forwarded-for") || event.node.req.socket.remoteAddress || "127.0.0.1",
          expiresAt,
          lastUsedAt: new Date(),
        });

        // Set persistent HTTP-Only remember_token cookie
        setCookie(event, "remember_token", rawRememberToken, {
          httpOnly: true,
          secure: process.env.SECURE_COOKIES === "true" || config.secureCookies,
          sameSite: "strict",
          path: "/",
          maxAge: 30 * 24 * 60 * 60,
        });
      } catch (tokErr) {
        console.warn("[Login] Failed to persist RememberToken in DB:", tokErr.message);
      }
    }

    return {
      success: true,
      user: {
        email: user.email,
        roles: user.roles,
      },
    };

  } catch (error) {
    if (error.statusCode) throw error;
    console.error("[Login] Unexpected error:", error.message);
    throw createError({
      statusCode: 503,
      statusMessage: "Service Unavailable",
      message: "Unable to connect to the server. Please try again in a moment.",
    });
  }
});
