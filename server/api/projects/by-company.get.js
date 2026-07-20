import connectDB from "../../utils/db";
import ProjectPerformance from "../../models/ProjectPerformance";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();

    const query = getQuery(event);
    const companyName = query.company;
    const period = query.period || "daily";
    const sprintFilter = query.sprint || "ALL";

    // ── No company → return all project summaries ──
    if (!companyName || companyName === "ALL") {
      const latestRecords = await ProjectPerformance.aggregate([
        { $sort: { generatedAt: -1, createdAt: -1 } },
        {
          $group: {
            _id: "$companyName",
            doc: { $first: "$$ROOT" },
          },
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { companyName: 1 } },
      ]);
      return { success: true, data: latestRecords };
    }

    // ── Fetch all records for this company ──
    const allRecords = await ProjectPerformance.find({
      companyName: { $regex: new RegExp(`^${companyName}$`, "i") },
    })
      .sort({ generatedAt: -1, createdAt: -1 })
      .limit(30)
      .lean();

    if (!allRecords.length) {
      return {
        success: false,
        data: null,
        companyName,
        error: "No performance data found for this project.",
      };
    }

    // ── Build sprint options from records ──
    const sprintsMap = new Map();
    allRecords.forEach((doc, idx) => {
      const name = doc.sprintName || doc.sprint?.name || `Sprint ${idx + 1}`;
      if (!sprintsMap.has(name)) sprintsMap.set(name, doc);
    });

    const sprintKeys = Array.from(sprintsMap.keys());
    const sprintOptions = [{ label: "All Sprints", value: "ALL" }];
    sprintKeys.forEach((k) => sprintOptions.push({ label: k, value: k }));

    // ── Select current and previous documents ──
    const current =
      sprintFilter !== "ALL" && sprintsMap.has(sprintFilter)
        ? sprintsMap.get(sprintFilter)
        : allRecords[0];

    const previous = allRecords.length > 1 ? allRecords[1] : null;

    // ── Extract KPIs ──
    const k = current?.kpis || {};
    const pk = previous?.kpis || {};

    const totalIssues = k.totalIssues ?? 0;
    const doneIssues = k.done ?? 0;
    const inProgressIssues = k.inProgress ?? 0;
    const todoIssues = k.todo ?? 0;
    const blockedIssues = k.blocked ?? 0;
    const overdueIssues = k.overdue ?? 0;
    const bugCount = k.bugCount ?? 0;
    const highPriority = k.highPriority ?? 0;
    const unassignedSprint = k.unassignedSprint ?? 0;
    const healthScore = k.healthScore ?? 0;
    const velocity = k.velocity ?? 0;
    const completionPct = k.completionPct > 0 ? Math.round(k.completionPct) : totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0;
    const spCompletionPct = k.spCompletionPct > 0 ? Math.round(k.spCompletionPct) : 0;
    const spCompleted = k.storyPointsCompleted ?? 0;
    const spRemaining = k.storyPointsRemaining ?? 0;
    const spTotal = k.storyPointsTotal > 0 ? k.storyPointsTotal : spCompleted + spRemaining;
    const avgResolutionHours = k.avgResolutionHours ?? 0;

    // Previous KPI values
    const pTotalIssues = pk.totalIssues ?? 0;
    const pDoneIssues = pk.done ?? 0;
    const pHealthScore = pk.healthScore ?? 0;
    const pVelocity = pk.velocity ?? 0;
    const pSpCompleted = pk.storyPointsCompleted ?? 0;
    const pCompletionPct = pk.completionPct > 0 ? Math.round(pk.completionPct) : pTotalIssues > 0 ? Math.round((pDoneIssues / pTotalIssues) * 100) : 0;
    const pBlocked = pk.blocked ?? 0;
    const pBugCount = pk.bugCount ?? 0;

    // Trend delta helpers
    const delta = (a, b) => {
      const d = a - b;
      return { value: d, dir: d > 0 ? "up" : d < 0 ? "down" : "stable" };
    };

    const trends = {
      healthScore: delta(healthScore, pHealthScore),
      completionPct: delta(completionPct, pCompletionPct),
      spCompleted: delta(spCompleted, pSpCompleted),
      velocity: delta(velocity, pVelocity),
      done: delta(doneIssues, pDoneIssues),
      blocked: delta(blockedIssues, pBlocked),
      bugCount: delta(bugCount, pBugCount),
    };

    // ── Sprint dates and progress ──
    const sprint = current?.sprint || {};
    const sprintStart = sprint.startDate || null;
    const sprintEnd = sprint.endDate || null;

    let sprintDays = 14;
    let currentDay = 10;
    let daysRemaining = 4;

    if (sprintStart && sprintEnd) {
      const msPerDay = 86400000;
      sprintDays = Math.max(1, Math.round((new Date(sprintEnd) - new Date(sprintStart)) / msPerDay));
      const elapsed = Math.max(0, Math.round((Date.now() - new Date(sprintStart)) / msPerDay));
      currentDay = Math.min(elapsed, sprintDays);
      daysRemaining = Math.max(0, sprintDays - currentDay);
    }

    const sprintProgressPct = sprintDays > 0 ? Math.round((currentDay / sprintDays) * 100) : 0;

    // ── Executive KPIs ──
    const hasPrev = !!previous;
    const execKpis = [
      {
        key: "healthScore",
        name: "Health Score",
        value: `${healthScore}%`,
        pct: healthScore,
        trend: trends.healthScore,
        prevPeriod: hasPrev ? `${pHealthScore}% prev` : "No prev data",
        variant: "emerald",
        icon: "heart",
      },
      {
        key: "completionPct",
        name: "Sprint Completion",
        value: `${completionPct}%`,
        pct: completionPct,
        trend: trends.completionPct,
        prevPeriod: hasPrev ? `${pCompletionPct}% prev` : "No prev data",
        variant: "blue",
        icon: "check-circle",
      },
      {
        key: "spCompleted",
        name: "SP Completed",
        value: spTotal > 0 ? `${spCompleted} pts` : `${doneIssues} done`,
        pct: spTotal > 0 ? Math.round((spCompleted / spTotal) * 100) : completionPct,
        trend: trends.spCompleted,
        prevPeriod: hasPrev ? `${pSpCompleted} pts prev` : "No prev data",
        variant: "emerald",
        icon: "zap",
      },
      {
        key: "spRemaining",
        name: "SP Remaining",
        value: spTotal > 0 ? `${spRemaining} pts` : `${totalIssues - doneIssues} tasks`,
        pct: spTotal > 0 ? Math.round((spRemaining / spTotal) * 100) : Math.round(((totalIssues - doneIssues) / Math.max(1, totalIssues)) * 100),
        trend: { value: -(spRemaining), dir: spRemaining > 0 ? "down" : "stable" },
        prevPeriod: hasPrev ? `${pk.storyPointsRemaining ?? 0} pts prev` : "No prev data",
        variant: "orange",
        icon: "clock",
      },
      {
        key: "velocity",
        name: "Velocity",
        value: velocity > 0 ? `${velocity} pts` : `${spCompleted > 0 ? spCompleted : doneIssues} pts`,
        pct: Math.min(100, velocity > 0 ? Math.round((velocity / Math.max(1, spTotal)) * 100) * 3 : Math.round(completionPct * 0.85)),
        trend: trends.velocity,
        prevPeriod: hasPrev ? `${pVelocity} pts prev` : "No prev data",
        variant: "purple",
        icon: "trending-up",
      },
      {
        key: "totalIssues",
        name: "Total Issues",
        value: `${totalIssues}`,
        pct: 100,
        trend: { value: totalIssues - pTotalIssues, dir: "stable" },
        prevPeriod: hasPrev ? `${pTotalIssues} prev` : "No prev data",
        variant: "blue",
        icon: "list",
      },
      {
        key: "done",
        name: "Completed Issues",
        value: `${doneIssues}`,
        pct: totalIssues > 0 ? Math.round((doneIssues / totalIssues) * 100) : 0,
        trend: trends.done,
        prevPeriod: hasPrev ? `${pDoneIssues} prev` : "No prev data",
        variant: "emerald",
        icon: "check-square",
      },
      {
        key: "inProgress",
        name: "In Progress",
        value: `${inProgressIssues}`,
        pct: totalIssues > 0 ? Math.round((inProgressIssues / totalIssues) * 100) : 0,
        trend: { value: inProgressIssues - (pk.inProgress ?? 0), dir: "stable" },
        prevPeriod: hasPrev ? `${pk.inProgress ?? 0} prev` : "No prev data",
        variant: "blue",
        icon: "activity",
      },
      {
        key: "todo",
        name: "Todo Issues",
        value: `${todoIssues}`,
        pct: totalIssues > 0 ? Math.round((todoIssues / totalIssues) * 100) : 0,
        trend: { value: todoIssues - (pk.todo ?? 0), dir: "stable" },
        prevPeriod: hasPrev ? `${pk.todo ?? 0} prev` : "No prev data",
        variant: "purple",
        icon: "inbox",
      },
      {
        key: "blocked",
        name: "Blocked Issues",
        value: `${blockedIssues}`,
        pct: totalIssues > 0 ? Math.round((blockedIssues / totalIssues) * 100) : 0,
        trend: { value: -(trends.blocked.value), dir: blockedIssues > pBlocked ? "down" : "up" },
        prevPeriod: hasPrev ? `${pBlocked} prev` : "No prev data",
        variant: blockedIssues > 0 ? "red" : "emerald",
        icon: "shield-off",
      },
      {
        key: "overdue",
        name: "Overdue Issues",
        value: `${overdueIssues}`,
        pct: totalIssues > 0 ? Math.round((overdueIssues / totalIssues) * 100) : 0,
        trend: { value: overdueIssues - (pk.overdue ?? 0), dir: overdueIssues > 0 ? "down" : "up" },
        prevPeriod: hasPrev ? `${pk.overdue ?? 0} prev` : "No prev data",
        variant: overdueIssues > 0 ? "orange" : "emerald",
        icon: "alert-triangle",
      },
      {
        key: "highPriority",
        name: "High Priority",
        value: `${highPriority}`,
        pct: totalIssues > 0 ? Math.round((highPriority / totalIssues) * 100) : 0,
        trend: { value: highPriority - (pk.highPriority ?? 0), dir: "stable" },
        prevPeriod: hasPrev ? `${pk.highPriority ?? 0} prev` : "No prev data",
        variant: highPriority > 5 ? "orange" : "blue",
        icon: "flag",
      },
      {
        key: "bugCount",
        name: "Bug Count",
        value: `${bugCount}`,
        pct: totalIssues > 0 ? Math.round((bugCount / totalIssues) * 100) : 0,
        trend: trends.bugCount,
        prevPeriod: hasPrev ? `${pBugCount} prev` : "No prev data",
        variant: bugCount > 0 ? "red" : "emerald",
        icon: "bug",
      },
      {
        key: "avgResolution",
        name: "Avg Resolution Time",
        value: avgResolutionHours > 0 ? `${avgResolutionHours}h` : "N/A",
        pct: avgResolutionHours > 0 ? Math.min(100, Math.round(100 - (avgResolutionHours / 48) * 100)) : 0,
        trend: { value: avgResolutionHours - (pk.avgResolutionHours ?? 0), dir: "stable" },
        prevPeriod: hasPrev ? `${pk.avgResolutionHours ?? 0}h prev` : "No prev data",
        variant: "purple",
        icon: "timer",
      },
    ];

    // ── Issue distribution for charts ──
    const statusColumns = current?.statusColumns || [];
    const prioritySprint = current?.prioritySprint || [];
    const backlog = current?.backlog || {};
    const team = current?.team || [];
    const analysis = current?.analysis || {};

    // Risk Level
    const riskLevel =
      blockedIssues > 5 || overdueIssues > 10 || healthScore < 30
        ? "Critical"
        : blockedIssues > 0 || overdueIssues > 3 || healthScore < 50
        ? "High"
        : overdueIssues > 0 || highPriority > 5
        ? "Medium"
        : "Low";

    // Recent reports list
    const recentReports = allRecords.slice(0, 12).map((doc, idx) => ({
      id: idx,
      type: doc.reportType || period,
      generatedAt: doc.generatedAt || doc.createdAt,
      sprintName: doc.sprintName || doc.sprint?.name || "Sprint",
      healthScore: doc.kpis?.healthScore ?? 0,
      completionPct:
        doc.kpis?.completionPct > 0
          ? Math.round(doc.kpis.completionPct)
          : doc.kpis?.totalIssues > 0
          ? Math.round(((doc.kpis?.done ?? 0) / doc.kpis.totalIssues) * 100)
          : 0,
      healthLabel: doc.kpis?.healthLabel || "—",
    }));

    // Velocity sparkline (last 10 records)
    const velocityHistory = allRecords
      .slice(0, 10)
      .reverse()
      .map((doc, i) => ({
        idx: i,
        sprint: doc.sprintName || doc.sprint?.name || `S${i + 1}`,
        velocity: doc.kpis?.velocity ?? doc.kpis?.storyPointsCompleted ?? doc.kpis?.done ?? 0,
        completionPct:
          doc.kpis?.completionPct > 0
            ? Math.round(doc.kpis.completionPct)
            : doc.kpis?.totalIssues > 0
            ? Math.round(((doc.kpis?.done ?? 0) / doc.kpis.totalIssues) * 100)
            : 0,
      }));

    return {
      success: true,
      companyName: current.companyName,
      period,
      sprintOptions,
      activeSprintName: sprintFilter !== "ALL" ? sprintFilter : (sprintKeys[0] || "Active Sprint"),
      // Current document
      current: {
        sprint,
        kpis: current.kpis,
        statusColumns,
        team: [...team].sort((a, b) => (b.completed || 0) - (a.completed || 0)),
        prioritySprint,
        priorityBacklog: current.priorityBacklog || [],
        backlog,
        analysis,
      },
      // Computed summaries
      execKpis,
      trends,
      summary: {
        totalIssues,
        doneIssues,
        inProgressIssues,
        todoIssues,
        blockedIssues,
        overdueIssues,
        bugCount,
        highPriority,
        unassignedSprint,
        healthScore,
        velocity,
        completionPct,
        spCompletionPct,
        spCompleted,
        spRemaining,
        spTotal,
        avgResolutionHours,
        sprintProgressPct,
        currentDay,
        sprintDays,
        daysRemaining,
        riskLevel,
      },
      // History
      recentReports,
      velocityHistory,
      generatedAt: current.generatedAt || current.createdAt,
    };
  } catch (error) {
    console.error("[API /api/projects/by-company] Error:", error);
    return { success: false, data: null, error: error.message };
  }
});
