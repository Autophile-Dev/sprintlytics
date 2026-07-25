import crypto from "crypto";
import RememberToken from "../../models/RememberToken";
import { connectDB } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const cookies = parseCookies(event);
  const rememberToken = cookies.remember_token;

  if (rememberToken) {
    try {
      await connectDB();
      const tokenHash = crypto.createHash("sha256").update(rememberToken).digest("hex");
      await RememberToken.deleteMany({ tokenHash });
    } catch (err) {
      console.warn("[Logout] Failed to revoke RememberToken from DB:", err.message);
    }
  }

  // Clear HTTP-Only authentication cookies
  deleteCookie(event, "auth_token", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  });

  deleteCookie(event, "remember_token", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  });

  return {
    success: true,
    message: "Logged out successfully.",
  };
});
