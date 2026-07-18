import bcrypt from "bcryptjs";
import User from "../../models/User.js";

export default defineEventHandler(async (event) => {
  const EMAIL = "waleed.zaheer55@gmail.com";
  const PASSWORD = "Test@123";

  // Security: only allow from localhost
  const requestIP = getRequestIP(event, { xForwardedFor: false });
  if (requestIP !== "127.0.0.1" && requestIP !== "::1" && requestIP !== "::ffff:127.0.0.1") {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }

  try {
    // Remove existing if any
    await User.deleteOne({ email: EMAIL });

    // Hash password and create verified user
    const hashedPassword = await bcrypt.hash(PASSWORD, 12);
    const user = await User.create({
      email: EMAIL,
      password: hashedPassword,
      isVerified: true,
      roles: ["user"],
    });

    return {
      success: true,
      message: `Account created for ${user.email}`,
      email: user.email,
      isVerified: user.isVerified,
    };
  } catch (err) {
    throw createError({ statusCode: 500, message: err.message });
  }
});
