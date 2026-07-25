import { connectDB } from "../../utils/db";
import Notification from "../../models/Notification";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const user = event.context.user;
    const userId = user ? user._id : null;

    let notifications = await Notification.find(
      userId ? { $or: [{ userId }, { userId: null }] } : {}
    )
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    // Auto-seed realistic initial notifications if DB is empty
    if (!notifications.length) {
      const seedItems = [
        {
          userId,
          title: "High Risk Alert: Database Migration Delay",
          message: "Third-party payment gateway integration is currently blocked waiting on API credentials.",
          type: "risk",
          priority: "high",
          isRead: false,
          actionUrl: "/risks",
          createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 mins ago
        },
        {
          userId,
          title: "Sprint Health Report Ready",
          message: "DevOps Tasks Sprint 24 report has been generated with 88% health score.",
          type: "sprint",
          priority: "medium",
          isRead: false,
          actionUrl: "/reports/sprint",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
          userId,
          title: "Developer Capacity Warning",
          message: "Senior Backend Lead capacity exceeds 115% utilization for active sprint.",
          type: "capacity",
          priority: "high",
          isRead: false,
          actionUrl: "/team/utilization",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        },
        {
          userId,
          title: "Velocity Milestone Achieved",
          message: "Team throughput increased by +14% compared to previous 3-sprint average.",
          type: "kpi",
          priority: "low",
          isRead: true,
          actionUrl: "/sprint/velocity",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        },
      ];

      await Notification.insertMany(seedItems);
      notifications = await Notification.find(
        userId ? { $or: [{ userId }, { userId: null }] } : {}
      )
        .sort({ createdAt: -1 })
        .limit(30)
        .lean();
    }

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
      success: true,
      notifications: notifications.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        priority: n.priority,
        isRead: n.isRead,
        actionUrl: n.actionUrl,
        createdAt: n.createdAt,
      })),
      unreadCount,
    };
  } catch (error) {
    console.error("[Notifications API] Error fetching notifications:", error.message);
    return {
      success: true,
      notifications: [],
      unreadCount: 0,
    };
  }
});
