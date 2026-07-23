import connectDB from "../../utils/db";
import ProjectPerformance from "../../models/ProjectPerformance";
import ExportLog from "../../models/ExportLog";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();

    const query = getQuery(event);
    const dataset = (query.dataset || 'sprint').toLowerCase();
    const projectFilter = query.project || 'ALL';
    const period = (query.period || 'ALL').toLowerCase();
    const limit = parseInt(query.limit) || 100;

    // 1. Build match filter for ProjectPerformance
    const matchFilter = {};
    if (period && period !== 'all' && ['daily', 'weekly', 'monthly'].includes(period)) {
      matchFilter.reportType = period;
    }
    if (projectFilter && projectFilter !== 'ALL') {
      const escapedProject = projectFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      matchFilter.companyName = { $regex: new RegExp(`^${escapedProject}$`, 'i') };
    }

    const docs = await ProjectPerformance.find(matchFilter)
      .sort({ generatedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    let records = [];

    // 2. Extract tabular records based on dataset type
    if (dataset === 'sprint') {
      records = docs.map(d => ({
        id: d._id.toString(),
        companyName: d.companyName || 'N/A',
        sprintName: d.sprint?.name || d.sprintName || 'Active Sprint',
        reportType: d.reportType || 'daily',
        periodLabel: d.periodLabel || 'Sprint Report',
        healthScore: d.kpis?.healthScore ?? 0,
        healthLabel: d.kpis?.healthLabel || (d.kpis?.healthScore >= 80 ? 'Optimal' : 'At Risk'),
        completionPct: d.kpis?.completionPct ?? 0,
        velocity: d.kpis?.velocity ?? 0,
        storyPointsTotal: d.kpis?.storyPointsTotal ?? 0,
        storyPointsCompleted: d.kpis?.storyPointsCompleted ?? 0,
        storyPointsRemaining: d.kpis?.storyPointsRemaining ?? 0,
        totalIssues: d.kpis?.totalIssues ?? 0,
        done: d.kpis?.done ?? 0,
        inProgress: d.kpis?.inProgress ?? 0,
        todo: d.kpis?.todo ?? 0,
        blocked: d.kpis?.blocked ?? 0,
        bugCount: d.kpis?.bugCount ?? 0,
        overdue: d.kpis?.overdue ?? 0,
        avgResolutionHours: d.kpis?.avgResolutionHours ?? 0,
        generatedAt: d.generatedAt ? new Date(d.generatedAt).toISOString().split('T')[0] : 'N/A'
      }));
    } else if (dataset === 'team') {
      docs.forEach(d => {
        if (Array.isArray(d.team)) {
          d.team.forEach(m => {
            records.push({
              memberName: m.name || 'Unassigned',
              companyName: d.companyName || 'N/A',
              sprintName: d.sprint?.name || d.sprintName || 'Active Sprint',
              email: m.email || 'N/A',
              assigned: m.assigned ?? 0,
              completed: m.completed ?? 0,
              blocked: m.blocked ?? 0,
              highPriorityOpen: m.highPriorityOpen ?? 0,
              storyPointsDelivered: m.storyPointsDelivered ?? 0,
              storyPointsAssigned: m.storyPointsAssigned ?? 0,
              loggedHours: m.loggedHours ?? 0,
              utilizationPct: m.utilizationPct ?? 0,
              status: m.status || 'Balanced',
              generatedAt: d.generatedAt ? new Date(d.generatedAt).toISOString().split('T')[0] : 'N/A'
            });
          });
        }
      });
    } else if (dataset === 'risks') {
      docs.forEach(d => {
        const k = d.kpis || {};
        const a = d.analysis || {};
        const risksList = Array.isArray(a.risks) && a.risks.length ? a.risks : [];
        const blockersList = Array.isArray(a.blockers) && a.blockers.length ? a.blockers : [];
        const combined = [...risksList, ...blockersList];

        if (combined.length > 0) {
          combined.forEach((item, idx) => {
            records.push({
              id: `${d._id}_risk_${idx}`,
              companyName: d.companyName || 'N/A',
              sprintName: d.sprint?.name || d.sprintName || 'Active Sprint',
              period: d.reportType || 'daily',
              issueSummary: item,
              severity: (k.blocked > 2 || k.healthScore < 60) ? 'High' : (k.blocked > 0 || k.healthScore < 80) ? 'Medium' : 'Low',
              healthScore: k.healthScore ?? 0,
              blockedIssues: k.blocked ?? 0,
              bugCount: k.bugCount ?? 0,
              generatedAt: d.generatedAt ? new Date(d.generatedAt).toISOString().split('T')[0] : 'N/A'
            });
          });
        } else if (k.blocked > 0 || k.bugCount > 0 || k.healthScore < 80) {
          records.push({
            id: `${d._id}_risk_gen`,
            companyName: d.companyName || 'N/A',
            sprintName: d.sprint?.name || d.sprintName || 'Active Sprint',
            period: d.reportType || 'daily',
            issueSummary: `Sprint health flagged at ${k.healthScore}% with ${k.blocked} blocked issues & ${k.bugCount} bugs.`,
            severity: (k.blocked > 2 || k.healthScore < 60) ? 'High' : 'Medium',
            healthScore: k.healthScore ?? 0,
            blockedIssues: k.blocked ?? 0,
            bugCount: k.bugCount ?? 0,
            generatedAt: d.generatedAt ? new Date(d.generatedAt).toISOString().split('T')[0] : 'N/A'
          });
        }
      });
    } else if (dataset === 'backlog') {
      records = docs.map(d => {
        const b = d.backlog || {};
        return {
          id: d._id.toString(),
          companyName: d.companyName || 'N/A',
          backlogTotal: b.total ?? d.kpis?.backlogTotal ?? 0,
          unassigned: b.unassigned ?? d.kpis?.backlogUnassigned ?? 0,
          highPriority: b.highPriority ?? d.kpis?.backlogHighPriority ?? 0,
          unprioritized: b.unprioritized ?? 0,
          bugs: b.bugs ?? 0,
          storyPoints: b.storyPoints ?? 0,
          topHighItemsCount: Array.isArray(b.topHigh) ? b.topHigh.length : 0,
          generatedAt: d.generatedAt ? new Date(d.generatedAt).toISOString().split('T')[0] : 'N/A'
        };
      });
    } else if (dataset === 'insights') {
      records = docs.map(d => {
        const a = d.analysis || {};
        return {
          id: d._id.toString(),
          companyName: d.companyName || 'N/A',
          sprintName: d.sprint?.name || d.sprintName || 'Active Sprint',
          period: d.reportType || 'daily',
          executiveSummary: a.executiveSummary || 'N/A',
          achievementsCount: Array.isArray(a.keyAchievements) ? a.keyAchievements.length : 0,
          risksCount: Array.isArray(a.risks) ? a.risks.length : 0,
          recommendationsCount: Array.isArray(a.recommendations) ? a.recommendations.length : 0,
          generatedAt: d.generatedAt ? new Date(d.generatedAt).toISOString().split('T')[0] : 'N/A'
        };
      });
    }

    // 3. Fetch recent Export History logs from MongoDB ExportLog model
    const exportHistory = await ExportLog.find()
      .sort({ timestamp: -1, createdAt: -1 })
      .limit(20)
      .lean();

    return {
      success: true,
      dataset,
      recordCount: records.length,
      records,
      exportHistory: exportHistory.map(h => ({
        _id: h._id,
        dataset: h.dataset,
        datasetLabel: h.datasetLabel || h.dataset,
        format: h.format?.toUpperCase() || 'CSV',
        companyName: h.companyName,
        period: h.period,
        recordCount: h.recordCount,
        fileSize: h.fileSize,
        fileName: h.fileName,
        exportedBy: h.exportedBy,
        timestamp: h.timestamp || h.createdAt
      }))
    };
  } catch (error) {
    console.error('[API /api/reports/export] Error:', error);
    return {
      success: false,
      error: error.message,
      records: [],
      exportHistory: []
    };
  }
});
