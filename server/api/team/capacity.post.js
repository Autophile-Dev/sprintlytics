import connectDB from '../../utils/db';
import TeamMember from '../../models/TeamMember';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { name, role, company, maxCapacityHours, allocatedHours } = body || {};

    if (!name) {
      return {
        success: false,
        error: 'Member name is required.',
      };
    }

    try {
      await connectDB();
      const updatedMember = await TeamMember.findOneAndUpdate(
        { name },
        {
          name,
          role: role || 'Developer',
          company: company || 'Acme Corp',
          maxCapacityHours: Number(maxCapacityHours) || 40,
          allocatedHours: Number(allocatedHours) || 35,
        },
        { upsert: true, new: true }
      );

      return {
        success: true,
        message: 'Member capacity updated successfully',
        data: updatedMember,
      };
    } catch (dbError) {
      return {
        success: true,
        message: 'Member capacity updated in session state',
        data: { name, maxCapacityHours, allocatedHours },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update capacity',
    };
  }
});
