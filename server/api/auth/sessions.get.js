import connectDB from "../../utils/db";
import RememberToken from "../../models/RememberToken";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const user = event.context.user;
    if (!user) {
      return { success: true, sessions: [] };
    }

    const sessions = await RememberToken.find({ userId: user._id })
      .sort({ lastUsedAt: -1 })
      .lean();

    return {
      success: true,
      sessions: sessions.map(s => ({
        id: s._id,
        userAgent: s.userAgent,
        ipAddress: s.ipAddress,
        lastUsedAt: s.lastUsedAt,
        expiresAt: s.expiresAt,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch active sessions",
    };
  }
});
