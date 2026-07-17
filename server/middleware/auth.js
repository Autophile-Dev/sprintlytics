import jwt from "jsonwebtoken";
import User from "../models/User";
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

  // Parse HTTP-Only auth cookie
  const cookies = parseCookies(event);
  const token = cookies.auth_token;

  if (!token) {
    return; // No token present; downstream requireAuth will intercept if needed
  }

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

  try {
    // Verify JWT integrity and expiration
    const decoded = jwt.verify(token, jwtSecret);
    if (decoded && decoded.userId) {
      const user = await User.findById(decoded.userId).select("-password");
      
      // If user exists and is verified, attach to event context
      if (user && user.isVerified) {
        event.context.user = user;
      }
    }
  } catch (error) {
    // If JWT is invalid/expired, log a warning (could also clear cookie here if desired)
    console.warn(`[Auth Middleware] Token validation failed: ${error.message}`);
  }
});
