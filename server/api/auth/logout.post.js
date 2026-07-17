export default defineEventHandler(async (event) => {
  // Clear the JWT authentication cookie
  deleteCookie(event, "auth_token", {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
  });

  return {
    success: true,
    message: "Logged out successfully.",
  };
});
