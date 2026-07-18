import crypto from "crypto";

export default defineEventHandler((event) => {
  const method = getMethod(event);
  const path = event.path || "";

  // Parse cookies
  const cookies = parseCookies(event);
  let csrfToken = cookies.csrf_token;

  // 1. Generate CSRF token if missing on GET page requests
  if (method === "GET" && !csrfToken) {
    csrfToken = crypto.randomBytes(32).toString("hex");
    
    // Set a non-httpOnly cookie so client-side javascript can read it
    setCookie(event, "csrf_token", csrfToken, {
      sameSite: "strict",
      secure: process.env.SECURE_COOKIES === "true",
      path: "/",
      maxAge: 3600 * 24, // 24 hours
    });
  }

  // 2. Validate CSRF token on mutating requests for API routes
  if (path.startsWith("/api")) {
    const mutatingMethods = ["POST", "PUT", "DELETE", "PATCH"];
    if (mutatingMethods.includes(method)) {
      const headerToken = getHeader(event, "x-csrf-token");
      if (!headerToken || headerToken !== csrfToken) {
        throw createError({
          statusCode: 403,
          statusMessage: "Forbidden",
          message: "CSRF token validation failed or session expired.",
        });
      }
    }
  }
});
