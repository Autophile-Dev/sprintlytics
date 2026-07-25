import connectDB from "../../utils/db";
import RememberToken from "../../models/RememberToken";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id } = body || {};

    if (!id) {
      return { success: false, error: "Session ID is required" };
    }

    await connectDB();
    await RememberToken.deleteOne({ _id: id });

    return {
      success: true,
      message: "Session revoked successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to revoke session",
    };
  }
});
