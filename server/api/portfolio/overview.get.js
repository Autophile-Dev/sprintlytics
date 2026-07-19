import connectDB from "../../utils/db";
import ProjectPerformance from "../../models/ProjectPerformance";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();

    const query = getQuery(event);
    const period = (query.period || 'daily').toLowerCase(); // daily | weekly | monthly
    const projectFilter = query.project || 'ALL'; // ALL | specific companyName

    const matchFilter = {};
    if (period && ['daily', 'weekly', 'monthly'].includes(period)) {
      matchFilter.reportType = period;
    }
    if (projectFilter && projectFilter !== 'ALL') {
      const escapedProject = projectFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      matchFilter.companyName = { $regex: new RegExp(`^${escapedProject}$`, 'i') };
    }

    // 1. Get latest document for each company matching period & project filter
    const pipeline = [];
    if (Object.keys(matchFilter).length > 0) {
      pipeline.push({ $match: matchFilter });
    }
    pipeline.push(
      { $sort: { generatedAt: -1, createdAt: -1 } },
      {
        $group: {
          _id: "$companyName",
          doc: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$doc" } },
      { $sort: { companyName: 1 } }
    );

    let projectsData = await ProjectPerformance.aggregate(pipeline);

    // If period filter returned 0 docs for selected project/portfolio, fallback to latest docs
    if (projectsData.length === 0) {
      const fallbackPipeline = [];
      if (projectFilter && projectFilter !== 'ALL') {
        const escapedProject = projectFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        fallbackPipeline.push({ $match: { companyName: { $regex: new RegExp(`^${escapedProject}$`, 'i') } } });
      }
      fallbackPipeline.push(
        { $sort: { generatedAt: -1, createdAt: -1 } },
        {
          $group: {
            _id: "$companyName",
            doc: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { companyName: 1 } }
      );
      projectsData = await ProjectPerformance.aggregate(fallbackPipeline);
    }

    // 2. Get recent reports list
    const reportMatch = {};
    if (projectFilter && projectFilter !== 'ALL') {
      const escapedProject = projectFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      reportMatch.companyName = { $regex: new RegExp(`^${escapedProject}$`, 'i') };
    }
    if (period && ['daily', 'weekly', 'monthly'].includes(period)) {
      reportMatch.reportType = period;
    }

    let recentReports = await ProjectPerformance.find(reportMatch)
      .sort({ generatedAt: -1, createdAt: -1 })
      .limit(15)
      .select('companyName reportType periodLabel generatedAt kpis.healthScore kpis.completionPct sprintName')
      .lean();

    if (recentReports.length === 0 && reportMatch.reportType) {
      delete reportMatch.reportType;
      recentReports = await ProjectPerformance.find(reportMatch)
        .sort({ generatedAt: -1, createdAt: -1 })
        .limit(15)
        .select('companyName reportType periodLabel generatedAt kpis.healthScore kpis.completionPct sprintName')
        .lean();
    }

    // 3. Compute Portfolio Aggregated Metrics
    let totalHealth = 0;
    let totalCompletion = 0;
    let totalVelocity = 0;
    let totalSpDelivered = 0;
    let totalSpTarget = 0;
    let totalBlocked = 0;
    let totalBugs = 0;
    let totalHighPriority = 0;
    let totalIssues = 0;
    let totalDone = 0;
    let totalInProgress = 0;
    let totalTodo = 0;
    let totalOverdue = 0;
    let totalUnassigned = 0;
    let totalBacklog = 0;
    let totalResolutionHoursSum = 0;

    const teamMembersMap = new Map();
    const allRisks = [];
    const allBlockers = [];
    const allAchievements = [];
    const allRecommendations = [];
    const executiveSummaries = [];

    const projectSummaries = projectsData.map(p => {
      const k = p.kpis || {};
      const a = p.analysis || {};

      totalHealth += (k.healthScore || 0);
      totalCompletion += (k.completionPct || 0);
      totalVelocity += (k.velocity || 0);
      totalSpDelivered += (k.storyPointsCompleted || 0);
      totalSpTarget += (k.storyPointsTotal || 0);
      totalBlocked += (k.blocked || 0);
      totalBugs += (k.bugCount || 0);
      totalHighPriority += (k.highPriority || 0);
      totalIssues += (k.totalIssues || 0);
      totalDone += (k.done || 0);
      totalInProgress += (k.inProgress || 0);
      totalTodo += (k.todo || 0);
      totalOverdue += (k.overdue || 0);
      totalUnassigned += (k.unassignedSprint || 0);
      totalBacklog += (k.backlogTotal || 0);
      totalResolutionHoursSum += (k.avgResolutionHours || 0);

      if (Array.isArray(p.team)) {
        p.team.forEach(m => {
          if (!m.name) return;
          if (!teamMembersMap.has(m.name)) {
            teamMembersMap.set(m.name, {
              name: m.name,
              assigned: m.assigned || 0,
              completed: m.completed || 0,
              storyPointsDelivered: m.storyPointsDelivered || 0,
              utilizationPct: m.utilizationPct || 0,
              status: m.status || 'Balanced'
            });
          }
        });
      }

      if (a.executiveSummary) {
        executiveSummaries.push({
          company: p.companyName,
          text: a.executiveSummary.replace(/^\[.*?\]\s*/, ''), // remove duplicate prefix if present
          healthScore: k.healthScore || 0,
          healthLabel: k.healthLabel || (k.healthScore >= 80 ? 'Optimal' : k.healthScore >= 60 ? 'Good' : 'At Risk'),
          completionPct: k.completionPct || 0,
          sprintName: p.sprint?.name || 'Active Sprint'
        });
      }
      if (Array.isArray(a.risks)) allRisks.push(...a.risks);
      if (Array.isArray(a.blockers)) allBlockers.push(...a.blockers);
      if (Array.isArray(a.keyAchievements)) allAchievements.push(...a.keyAchievements);
      if (Array.isArray(a.recommendations)) allRecommendations.push(...a.recommendations);
      if (Array.isArray(a.priorityActions)) allRecommendations.push(...a.priorityActions);

      return {
        companyName: p.companyName,
        healthScore: k.healthScore || 0,
        healthLabel: k.healthLabel || (k.healthScore >= 80 ? 'Optimal' : k.healthScore >= 60 ? 'Good' : 'At Risk'),
        completionPct: k.completionPct || 0,
        velocity: k.velocity || 0,
        storyPointsCompleted: k.storyPointsCompleted || 0,
        storyPointsTotal: k.storyPointsTotal || 0,
        blocked: k.blocked || 0,
        bugCount: k.bugCount || 0,
        highPriority: k.highPriority || 0,
        overdue: k.overdue || 0,
        sprintState: p.sprint?.state || 'active',
        sprintName: p.sprint?.name || 'Active Sprint',
        generatedAt: p.generatedAt || p.createdAt,
        riskLevel: (k.blocked > 2 || k.healthScore < 60) ? 'High' : (k.blocked > 0 || k.healthScore < 80) ? 'Medium' : 'Low'
      };
    });

    const projectCount = projectsData.length || 1;
    const avgHealth = Math.round(totalHealth / projectCount);
    const avgCompletion = Math.round(totalCompletion / projectCount);
    const avgVelocity = Math.round(totalVelocity / projectCount);
    const avgResolutionHours = Math.round((totalResolutionHoursSum / projectCount) * 10) / 10;

    const teamList = Array.from(teamMembersMap.values());
    const teamStats = {
      total: teamList.length,
      balanced: teamList.filter(t => (t.status || '').toLowerCase().includes('balanced')).length,
      overloaded: teamList.filter(t => (t.status || '').toLowerCase().includes('overload')).length,
      underutilized: teamList.filter(t => (t.status || '').toLowerCase().includes('underutil')).length,
      unassigned: teamList.filter(t => t.isUnassigned || (t.status || '').toLowerCase().includes('unassign')).length
    };

    return {
      success: true,
      period,
      projectFilter,
      portfolioMetrics: {
        healthScore: avgHealth,
        healthLabel: avgHealth >= 80 ? 'Optimal' : avgHealth >= 60 ? 'Good' : 'At Risk',
        completionPct: avgCompletion,
        velocity: totalSpDelivered,
        velocityAvg: avgVelocity,
        storyPointsCompleted: totalSpDelivered,
        storyPointsTotal: totalSpTarget,
        totalBlocked,
        totalBugs,
        totalHighPriority,
        activeProjects: projectsData.length,
        totalProjects: projectsData.length,
        runningSprints: projectsData.filter(p => (p.sprint?.state || 'active') === 'active').length,
        totalSprints: projectsData.length,
        totalIssues,
        completedIssues: totalDone,
        remainingIssues: totalInProgress + totalTodo,
        doneIssues: totalDone,
        inProgressIssues: totalInProgress,
        todoIssues: totalTodo,
        overdueIssues: totalOverdue,
        unassignedIssues: totalUnassigned,
        backlogSize: totalBacklog,
        avgResolutionHours
      },
      projects: projectSummaries,
      leaderboard: [...projectSummaries].sort((a, b) => b.healthScore - a.healthScore),
      projectsRequiringAttention: projectSummaries.filter(p => p.healthScore < 75 || p.blocked > 0 || p.bugCount > 2 || p.overdue > 0),
      teamStats,
      teamMembers: teamList,
      aiInsights: {
        executiveSummaries: executiveSummaries,
        synthesis: `Portfolio analysis across ${projectsData.length} active connected projects indicates an overall average health score of ${avgHealth}% (${avgHealth >= 80 ? 'Optimal' : avgHealth >= 60 ? 'Good' : 'At Risk'}) with ${totalDone} completed tasks out of ${totalIssues} total sprint items (${avgCompletion}% overall completion rate).`,
        recommendations: [...new Set(allRecommendations)].slice(0, 6),
        risks: [...new Set(allRisks)].slice(0, 5),
        blockers: [...new Set(allBlockers)].slice(0, 5),
        keyAchievements: [...new Set(allAchievements)].slice(0, 5)
      },
      recentReports
    };
  } catch (error) {
    console.error('[API /api/portfolio/overview] Error:', error);
    return {
      success: false,
      error: error.message,
      portfolioMetrics: {},
      projects: []
    };
  }
});
