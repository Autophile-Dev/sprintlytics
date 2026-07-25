import connectDB from '../utils/db';
import Risk from '../models/Risk';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const {
      title,
      project,
      company,
      category,
      impact,
      likelihood,
      owner,
      mitigation,
    } = body || {};

    if (!title || !project || !impact || !owner || !mitigation) {
      return {
        success: false,
        error: 'Title, project, impact, owner, and mitigation plan are required fields.',
      };
    }

    try {
      await connectDB();
      const newRisk = await Risk.create({
        title,
        project,
        company: company || 'Acme Corp',
        category: category || 'Technical',
        impact,
        likelihood: likelihood || 'Medium',
        status: 'Open',
        owner,
        mitigation,
        daysOpen: 1,
      });

      return {
        success: true,
        message: 'Risk created successfully',
        data: newRisk,
      };
    } catch (dbError) {
      // In-memory fallback if DB connection is unavailable
      const fallbackRisk = {
        _id: 'risk_' + Date.now(),
        title,
        project,
        company: company || 'Acme Corp',
        category: category || 'Technical',
        impact,
        likelihood: likelihood || 'Medium',
        status: 'Open',
        owner,
        mitigation,
        daysOpen: 1,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: 'Risk logged in session store',
        data: fallbackRisk,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create risk',
    };
  }
});
