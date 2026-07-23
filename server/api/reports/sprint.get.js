import connectDB from "../../utils/db";
import ProjectPerformance from "../../models/ProjectPerformance";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();

    const query = getQuery(event);
    const period = (query.period || 'daily').toLowerCase();
    const projectFilter = query.project || 'ALL';
    const reportId = query.reportId || null;

    // 1. Build base match filter
    const matchFilter = {};
    if (period && ['daily', 'weekly', 'monthly'].includes(period)) {
      matchFilter.reportType = period;
    }
    if (projectFilter && projectFilter !== 'ALL') {
      const escapedProject = projectFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      matchFilter.companyName = { $regex: new RegExp(`^${escapedProject}$`, 'i') };
    }

    // 2. Fetch history list for report selection dropdown
    let historyMatch = {};
    if (projectFilter && projectFilter !== 'ALL') {
      const escapedProject = projectFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      historyMatch.companyName = { $regex: new RegExp(`^${escapedProject}$`, 'i') };
    }
    if (period && ['daily', 'weekly', 'monthly'].includes(period)) {
      historyMatch.reportType = period;
    }

    let history = await ProjectPerformance.find(historyMatch)
      .sort({ generatedAt: -1, createdAt: -1 })
      .limit(30)
      .select('_id companyName reportType periodLabel generatedAt kpis.healthScore kpis.completionPct kpis.velocity sprintName executionId')
      .lean();

    if (history.length === 0 && historyMatch.reportType) {
      delete historyMatch.reportType;
      history = await ProjectPerformance.find(historyMatch)
        .sort({ generatedAt: -1, createdAt: -1 })
        .limit(30)
        .select('_id companyName reportType periodLabel generatedAt kpis.healthScore kpis.completionPct kpis.velocity sprintName executionId')
        .lean();
    }

    // 3. Find target report document
    let activeDoc = null;

    if (reportId) {
      activeDoc = await ProjectPerformance.findOne({
        $or: [{ _id: reportId }, { executionId: reportId }]
      }).lean();
    }

    if (!activeDoc) {
      if (Object.keys(matchFilter).length > 0) {
        activeDoc = await ProjectPerformance.findOne(matchFilter)
          .sort({ generatedAt: -1, createdAt: -1 })
          .lean();
      }
      if (!activeDoc && projectFilter && projectFilter !== 'ALL') {
        const escapedProject = projectFilter.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        activeDoc = await ProjectPerformance.findOne({ companyName: { $regex: new RegExp(`^${escapedProject}$`, 'i') } })
          .sort({ generatedAt: -1, createdAt: -1 })
          .lean();
      }
      if (!activeDoc) {
        activeDoc = await ProjectPerformance.findOne()
          .sort({ generatedAt: -1, createdAt: -1 })
          .lean();
      }
    }

    // 4. Fetch list of distinct companies for filters
    const companies = await ProjectPerformance.distinct("companyName");

    if (!activeDoc) {
      return {
        success: true,
        report: null,
        history: [],
        companies: companies.filter(Boolean),
        message: 'No sprint report data found'
      };
    }

    // Parse team feedback map if stored as object / map
    const analysisObj = activeDoc.analysis || {};
    let teamFeedbackFormatted = [];
    if (analysisObj.teamFeedback) {
      if (analysisObj.teamFeedback instanceof Map) {
        teamFeedbackFormatted = Array.from(analysisObj.teamFeedback.entries()).map(([member, fb]) => ({
          member,
          feedback: fb.feedback || fb,
          strengths: fb.strengths || [],
          improvements: fb.improvements || []
        }));
      } else if (typeof analysisObj.teamFeedback === 'object') {
        teamFeedbackFormatted = Object.entries(analysisObj.teamFeedback).map(([member, fb]) => ({
          member,
          feedback: typeof fb === 'string' ? fb : fb.feedback || '',
          strengths: fb.strengths || [],
          improvements: fb.improvements || []
        }));
      }
    }

    const formattedReport = {
      _id: activeDoc._id,
      executionId: activeDoc.executionId,
      companyName: activeDoc.companyName || 'Project',
      reportType: activeDoc.reportType || 'daily',
      periodLabel: activeDoc.periodLabel || 'Sprint Health Report',
      generatedAt: activeDoc.generatedAt || activeDoc.createdAt,
      sprint: activeDoc.sprint || {
        name: activeDoc.sprintName || 'Active Sprint',
        goal: 'Deliver scheduled sprint backlog items on time',
        state: 'active'
      },
      kpis: {
        healthScore: activeDoc.kpis?.healthScore || 0,
        healthLabel: activeDoc.kpis?.healthLabel || (activeDoc.kpis?.healthScore >= 80 ? 'Optimal' : 'At Risk'),
        completionPct: activeDoc.kpis?.completionPct || 0,
        spCompletionPct: activeDoc.kpis?.spCompletionPct || 0,
        velocity: activeDoc.kpis?.velocity || 0,
        storyPointsTotal: activeDoc.kpis?.storyPointsTotal || 0,
        storyPointsCompleted: activeDoc.kpis?.storyPointsCompleted || 0,
        storyPointsRemaining: activeDoc.kpis?.storyPointsRemaining || 0,
        totalIssues: activeDoc.kpis?.totalIssues || 0,
        done: activeDoc.kpis?.done || 0,
        inProgress: activeDoc.kpis?.inProgress || 0,
        todo: activeDoc.kpis?.todo || 0,
        blocked: activeDoc.kpis?.blocked || 0,
        bugCount: activeDoc.kpis?.bugCount || 0,
        highPriority: activeDoc.kpis?.highPriority || 0,
        overdue: activeDoc.kpis?.overdue || 0,
        avgResolutionHours: activeDoc.kpis?.avgResolutionHours || 0,
        unassignedSprint: activeDoc.kpis?.unassignedSprint || 0,
        backlogTotal: activeDoc.kpis?.backlogTotal || 0
      },
      statusColumns: activeDoc.statusColumns || [
        { name: 'To Do', count: activeDoc.kpis?.todo || 0, categoryKey: 'new', color: '#6B7280' },
        { name: 'In Progress', count: activeDoc.kpis?.inProgress || 0, categoryKey: 'indeterminate', color: '#3B82F6' },
        { name: 'Blocked', count: activeDoc.kpis?.blocked || 0, categoryKey: 'warning', color: '#EF4444' },
        { name: 'Done', count: activeDoc.kpis?.done || 0, categoryKey: 'done', color: '#10B981' }
      ],
      prioritySprint: activeDoc.prioritySprint || [],
      team: activeDoc.team || [],
      analysis: {
        executiveSummary: analysisObj.executiveSummary || 'No executive summary generated for this run.',
        keyAchievements: analysisObj.keyAchievements || [],
        risks: analysisObj.risks || [],
        blockers: analysisObj.blockers || [],
        priorityActions: analysisObj.priorityActions || [],
        recommendations: analysisObj.recommendations || [],
        nextSprintSuggestions: analysisObj.nextSprintSuggestions || [],
        teamFeedback: teamFeedbackFormatted
      }
    };

    return {
      success: true,
      report: formattedReport,
      history: history.map(h => ({
        _id: h._id,
        executionId: h.executionId,
        companyName: h.companyName,
        reportType: h.reportType,
        periodLabel: h.periodLabel,
        generatedAt: h.generatedAt,
        sprintName: h.sprintName || 'Active Sprint',
        healthScore: h.kpis?.healthScore || 0,
        completionPct: h.kpis?.completionPct || 0,
        velocity: h.kpis?.velocity || 0
      })),
      companies: companies.filter(Boolean)
    };
  } catch (error) {
    console.error('[API /api/reports/sprint] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});
