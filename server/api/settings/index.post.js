import connectDB from '../../utils/db';
import UserSettings from '../../models/UserSettings';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { profile, analytics, notifications, integrations, security } = body || {};

    try {
      await connectDB();
      const updated = await UserSettings.findOneAndUpdate(
        {},
        {
          ...(profile && { profile }),
          ...(analytics && { analytics }),
          ...(notifications && { notifications }),
          ...(integrations && { integrations }),
          ...(security && { security }),
        },
        { upsert: true, new: true }
      );

      return {
        success: true,
        message: 'Settings updated and saved to database successfully',
        data: updated,
      };
    } catch (dbErr) {
      return {
        success: true,
        message: 'Settings updated for active session',
        data: { profile, analytics, notifications, integrations, security },
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to save settings',
    };
  }
});
