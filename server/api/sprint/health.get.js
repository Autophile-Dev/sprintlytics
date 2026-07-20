import connectDB from "../../utils/db";
import ProjectPerformance from "../../models/ProjectPerformance";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const query = getQuery(event);
    const companyName = query.company;
    const period = query.period || 'daily';

    // Return companies list if no company selected
    if (!companyName || companyName === 'ALL' || companyName === '') {
      const companies = await ProjectPerformance.distinct('companyName');
      return { success: true, companies, data: null };
    }

    // Fetch all records for this company sorted newest first
    const records = await ProjectPerformance.find({
      companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
    })
      .sort({ generatedAt: -1, createdAt: -1 })
      .limit(30)
      .lean();

    if (!records.length) {
      return { success: false, data: null, error: 'No performance data found for this project.' };
    }

    const current = records[0];
    const previous = records[1] || null;

    // Calculate trend deltas vs previous record
    const trend = previous
      ? {
          completionPct: Math.round((current.kpis?.completionPct || 0) - (previous.kpis?.completionPct || 0)),
          healthScore: Math.round((current.kpis?.healthScore || 0) - (previous.kpis?.healthScore || 0)),
          velocity: Math.round((current.kpis?.velocity || 0) - (previous.kpis?.velocity || 0)),
          blocked: Math.round((current.kpis?.blocked || 0) - (previous.kpis?.blocked || 0)),
          done: Math.round((current.kpis?.done || 0) - (previous.kpis?.done || 0)),
          storyPointsCompleted: Math.round((current.kpis?.storyPointsCompleted || 0) - (previous.kpis?.storyPointsCompleted || 0)),
        }
      : null;

    return {
      success: true,
      companyName,
      period,
      data: current,
      previous,
      trend,
      history: records.slice(0, 10),
    };
  } catch (error) {
    console.error('[API /api/sprint/health] Error:', error);
    return { success: false, data: null, error: error.message };
  }
});
