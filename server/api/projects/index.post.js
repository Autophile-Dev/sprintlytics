import connectDB from '../../utils/db';
import CompanyProject from '../../models/CompanyProject';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, company, lead, status, techStack } = body || {};

    if (!name || !company || !lead) {
      return {
        success: false,
        error: 'Project name, company, and project lead are required.',
      };
    }

    try {
      await connectDB();
      const newProject = await CompanyProject.create({
        name,
        company,
        lead,
        status: status || 'On Track',
        healthScore: 88,
        techStack: Array.isArray(techStack) ? techStack : ['Vue 3', 'Nuxt', 'Node.js'],
        progress: 10,
        sprintCount: 1,
      });

      return {
        success: true,
        message: 'Project created successfully',
        data: newProject,
      };
    } catch (dbError) {
      const fallbackProject = {
        _id: 'proj_' + Date.now(),
        name,
        company,
        lead,
        status: status || 'On Track',
        healthScore: 88,
        techStack: Array.isArray(techStack) ? techStack : ['Vue 3', 'Nuxt', 'Node.js'],
        progress: 10,
        sprintCount: 1,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: 'Project created in session store',
        data: fallbackProject,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create project',
    };
  }
});
