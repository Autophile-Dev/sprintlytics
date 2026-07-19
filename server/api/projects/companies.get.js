import connectDB from "../../utils/db";
import ProjectPerformance from "../../models/ProjectPerformance";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();

    // Fetch distinct company names from project_performance collection
    const rawCompanies = await ProjectPerformance.distinct('companyName', {
      companyName: { $exists: true, $ne: '' }
    });

    // Deduplicate, trim, filter out invalid/empty strings, and sort alphabetically
    const companies = [...new Set(
      rawCompanies
        .filter(c => c && typeof c === 'string' && c.trim().length > 0)
        .map(c => c.trim())
    )].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    return {
      success: true,
      companies
    };
  } catch (error) {
    console.error('[API /api/projects/companies] Error fetching companies:', error);
    return {
      success: false,
      companies: [],
      error: error.message
    };
  }
});
