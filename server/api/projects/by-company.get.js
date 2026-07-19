import connectDB from "../../utils/db";
import ProjectPerformance from "../../models/ProjectPerformance";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();

    const query = getQuery(event);
    const companyName = query.company;

    if (!companyName) {
      // Return all latest performance records grouped by companyName
      const latestRecords = await ProjectPerformance.aggregate([
        { $sort: { generatedAt: -1, createdAt: -1 } },
        {
          $group: {
            _id: "$companyName",
            doc: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$doc" } },
        { $sort: { companyName: 1 } }
      ]);

      return {
        success: true,
        data: latestRecords
      };
    }

    // Fetch performance documents for specific companyName (sorted by generatedAt desc)
    const records = await ProjectPerformance.find({
      companyName: { $regex: new RegExp(`^${companyName}$`, 'i') }
    })
      .sort({ generatedAt: -1, createdAt: -1 })
      .lean();

    return {
      success: true,
      companyName,
      data: records[0] || null,
      history: records
    };
  } catch (error) {
    console.error('[API /api/projects/by-company] Error:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
});
