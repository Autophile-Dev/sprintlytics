import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User";
import RememberToken from "../models/RememberToken";
import { connectDB } from "../utils/db";

export default defineEventHandler(async (event) => {
  const path = event.path || "";

  // Performance optimization: Only run auth checks for API routes
  if (!path.startsWith("/api")) {
    return;
  }

  // Ensure DB connection is available
  try {
    await connectDB();
  } catch (err) {
    console.error("[Auth Middleware] Database connection failed:", err.message);
    return;
  }

  // Parse HTTP-Only auth cookies
  const cookies = parseCookies(event);
  const token = cookies.auth_token;
  const rememberToken = cookies.remember_token;

  let jwtSecret = process.env.JWT_SECRET;
  try {
    const config = useRuntimeConfig();
    if (config && config.jwtSecret) {
      jwtSecret = jwtSecret || config.jwtSecret;
    }
  } catch (e) {
    // Fallback if useRuntimeConfig is not available
  }

  if (!jwtSecret) {
    console.error("[Auth Middleware] JWT_SECRET is not configured.");
    return;
  }

  // 1. Try validating primary JWT auth_token
  if (token) {
    try {
      const decoded = jwt.verify(token, jwtSecret);
      if (decoded && decoded.userId) {
        const user = await User.findById(decoded.userId).select("-password");
        if (user && user.isVerified) {
          event.context.user = user;
          return; // Auth successful
        }
      }
    } catch (error) {
      console.warn(`[Auth Middleware] JWT auth_token expired or invalid: ${error.message}`);
    }
  }

  // 2. Auto-Reauthentication via Remember Me token
  if (rememberToken) {
    try {
      const tokenHash = crypto.createHash("sha256").update(rememberToken).digest("hex");
      const sessionDoc = await RememberToken.findOne({
        tokenHash,
        expiresAt: { $gt: new Date() },
      });

      if (sessionDoc) {
        const user = await User.findById(sessionDoc.userId).select("-password");
        if (user && user.isVerified) {
          // Re-authenticate user and issue a fresh JWT auth_token
          event.context.user = user;

          const freshJwt = jwt.sign(
            { userId: user._id, roles: user.roles },
            jwtSecret,
            { expiresIn: "30d" }
          );

          setCookie(event, "auth_token", freshJwt, {
            httpOnly: true,
            secure: process.env.SECURE_COOKIES === "true",
            sameSite: "strict",
            path: "/",
            maxAge: 30 * 24 * 60 * 60,
          });

          // Update lastUsedAt in DB
          sessionDoc.lastUsedAt = new Date();
          await sessionDoc.save();

          console.log(`[Auth Middleware] Auto-reauthenticated user ${user.email} via RememberToken.`);
        }
      }
    } catch (rememberErr) {
      console.warn("[Auth Middleware] RememberToken validation error:", rememberErr.message);
    }
  }
});
