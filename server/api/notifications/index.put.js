import { connectDB } from "../../utils/db";
import Notification from "../../models/Notification";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const body = await readBody(event);
    const { id, all } = body || {};

    if (all) {
      // Mark all user notifications as read
      await Notification.updateMany({ isRead: false }, { isRead: true });
      return {
        success: true,
        message: "All notifications marked as read",
      };
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
      return {
        success: true,
        message: "Notification marked as read",
      };
    }

    return {
      success: false,
      error: "Notification ID or 'all' flag required",
    };
  } catch (error) {
    console.error("[Notifications API] Error updating notification:", error.message);
    return {
      success: false,
      error: error.message || "Failed to update notification",
    };
  }
});
