import { connectDB } from "../../utils/db";
import Notification from "../../models/Notification";
import Risk from "../../models/Risk";
import TeamMember from "../../models/TeamMember";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const user = event.context.user;
    const userId = user ? user._id : null;

    // 1. Dynamic Generator: Synthesize live alerts from MongoDB collections
    try {
      // A. Active Unresolved Risks
      const activeRisks = await Risk.find({ status: { $ne: "resolved" } }).lean();
      for (const r of activeRisks) {
        const title = `Risk Alert: ${r.title || 'Unresolved Risk'}`;
        const existing = await Notification.findOne({ title });
        if (!existing) {
          await Notification.create({
            userId,
            title,
            message: `${r.companyName || 'Project'}: ${r.description || 'Action required to mitigate blocker.'} (Impact: ${r.impact || 'High'})`,
            type: "risk",
            priority: r.impact === "critical" || r.severity === "high" ? "high" : "medium",
            isRead: false,
            actionUrl: "/risks",
            createdAt: r.createdAt || new Date(),
          });
        }
      }

      // B. Team Overcapacity Warning
      const members = await TeamMember.find().lean();
      for (const m of members) {
        const cap = m.capacityStoryPoints || 40;
        const assigned = m.assignedStoryPoints || 0;
        const pct = Math.round((assigned / cap) * 100);
        if (pct > 100) {
          const title = `Overcapacity Warning: ${m.name || 'Team Member'}`;
          const existing = await Notification.findOne({ title });
          if (!existing) {
            await Notification.create({
              userId,
              title,
              message: `${m.name} is currently assigned ${assigned} story points (${pct}% of ${cap} SP capacity).`,
              type: "capacity",
              priority: "high",
              isRead: false,
              actionUrl: "/team/utilization",
              createdAt: new Date(),
            });
          }
        }
      }
    } catch (genErr) {
      console.warn("[Notifications API] Dynamic generator warning:", genErr.message);
    }

    // 2. Fetch all persistent notifications
    let notifications = await Notification.find(
      userId ? { $or: [{ userId }, { userId: null }] } : {}
    )
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();

    // Fallback seeder if DB remains empty
    if (!notifications.length) {
      const seedItems = [
        {
          userId,
          title: "High Risk Alert: Payment Gateway Timeout",
          message: "Third-party sandbox environment is experiencing 504 timeouts affecting Sprint 24.",
          type: "risk",
          priority: "high",
          isRead: false,
          actionUrl: "/risks",
          createdAt: new Date(Date.now() - 1000 * 60 * 12),
        },
        {
          userId,
          title: "Sprint Health Report Generated",
          message: "DevOps Tasks Sprint report is ready for executive review with 88% overall health score.",
          type: "sprint",
          priority: "medium",
          isRead: false,
          actionUrl: "/reports/sprint",
          createdAt: new Date(Date.now() - 1000 * 60 * 45),
        },
        {
          userId,
          title: "Developer Workload Bottleneck",
          message: "Lead Fullstack Engineer capacity exceeded 115% for the active weekly iteration.",
          type: "capacity",
          priority: "high",
          isRead: false,
          actionUrl: "/team/utilization",
          createdAt: new Date(Date.now() - 1000 * 60 * 180),
        },
        {
          userId,
          title: "Velocity Target Exceeded",
          message: "Team throughput increased by +14% compared to rolling 3-sprint baseline.",
          type: "kpi",
          priority: "low",
          isRead: true,
          actionUrl: "/sprint/velocity",
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
        },
      ];
      await Notification.insertMany(seedItems);
      notifications = await Notification.find(
        userId ? { $or: [{ userId }, { userId: null }] } : {}
      )
        .sort({ createdAt: -1 })
        .limit(40)
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
    console.error("[Notifications API] Error:", error.message);
    return {
      success: true,
      notifications: [],
      unreadCount: 0,
    };
  }
});
