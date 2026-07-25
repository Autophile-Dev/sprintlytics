import { connectDB } from "../../utils/db";
import Notification from "../../models/Notification";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const body = await readBody(event);
    const user = event.context.user;

    const { title, message, type = "system", priority = "medium", actionUrl = "/reports/sprint" } = body || {};

    if (!title || !message) {
      return { success: false, error: "Title and message are required." };
    }

    const notif = await Notification.create({
      userId: user ? user._id : null,
      title,
      message,
      type,
      priority,
      isRead: false,
      actionUrl,
      createdAt: new Date(),
    });

    return {
      success: true,
      notification: {
        id: notif._id,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        priority: notif.priority,
        isRead: notif.isRead,
        actionUrl: notif.actionUrl,
        createdAt: notif.createdAt,
      },
    };
  } catch (error) {
    console.error("[Notifications POST API] Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to create notification",
    };
  }
});
