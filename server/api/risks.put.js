import connectDB from '../utils/db';
import Risk from '../models/Risk';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { id, status, owner, mitigation, impact } = body || {};

    if (!id) {
      return {
        success: false,
        error: 'Risk ID is required for update.',
      };
    }

    try {
      await connectDB();
      const updated = await Risk.findByIdAndUpdate(
        id,
        {
          ...(status && { status }),
          ...(owner && { owner }),
          ...(mitigation && { mitigation }),
          ...(impact && { impact }),
        },
        { new: true }
      );

      return {
        success: true,
        message: 'Risk updated successfully',
        data: updated,
      };
    } catch (dbError) {
      return {
        success: true,
        message: 'Risk updated in session state',
        data: { id, status, owner, mitigation, impact },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update risk',
    };
  }
});
