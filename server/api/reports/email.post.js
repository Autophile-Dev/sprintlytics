import connectDB from "../../utils/db";
import EmailLog from "../../models/EmailLog";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const body = await readBody(event);
    const { to, subject, notes, companyName, period, healthScore, completionPct, velocity, sprintName } = body;

    if (!to) {
      return { success: false, error: 'Recipient email address is required.' };
    }

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px; background: #ffffff; color: #111827;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #ecfdf5; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="color: #065f46; margin: 0; font-size: 20px;">Sprintlytics Executive Sprint Report</h2>
            <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0;">Project: <strong>${companyName || 'All Projects'}</strong> | Period: ${period || 'daily'}</p>
          </div>
        </div>

        <p style="font-size: 14px; color: #374151;">Sprint: <strong>${sprintName || 'Active Sprint'}</strong></p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0;">
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 14px; text-align: center;">
            <span style="display: block; font-size: 11px; color: #047857; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Health Score</span>
            <span style="font-size: 26px; font-weight: 800; color: #059669;">${healthScore || 0}%</span>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px; text-align: center;">
            <span style="display: block; font-size: 11px; color: #1d4ed8; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Completion</span>
            <span style="font-size: 26px; font-weight: 800; color: #2563eb;">${completionPct || 0}%</span>
          </div>
          <div style="background: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 10px; padding: 14px; text-align: center;">
            <span style="display: block; font-size: 11px; color: #6d28d9; font-weight: bold; letter-spacing: 0.5px; text-transform: uppercase;">Velocity (SP)</span>
            <span style="font-size: 26px; font-weight: 800; color: #7c3aed;">${velocity || 0}</span>
          </div>
        </div>

        ${notes ? `
          <div style="background: #f9fafb; border-left: 4px solid #059669; padding: 14px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 14px; color: #374151;">
            <strong style="color: #111827;">Executive Notes:</strong>
            <p style="margin: 6px 0 0 0; line-height: 1.5;">${notes}</p>
          </div>
        ` : ''}

        <p style="font-size: 13px; color: #6b7280; line-height: 1.5; margin-top: 24px;">
          This executive report was dispatched automatically from the <strong>Sprintlytics Reports Module</strong>.
        </p>

        <div style="border-top: 1px solid #f3f4f6; margin-top: 20px; padding-top: 14px; text-align: center; font-size: 12px; color: #9ca3af;">
          © ${new Date().getFullYear()} Sprintlytics AI Project Intelligence
        </div>
      </div>
    `;

    const logEntry = await EmailLog.create({
      executionId: 'web-report-share-' + Date.now(),
      workflowId: 'sprintlytics-reports-module',
      emailType: 'executive',
      status: 'SENT',
      delivered: true,
      to,
      recipientCount: 1,
      fromEmail: 'reports@sprintlytics.ai',
      subject: subject || `Executive Sprint Health Report — ${companyName || 'Portfolio'}`,
      htmlBody: htmlContent,
      htmlLength: htmlContent.length,
      sentAt: new Date()
    });

    return {
      success: true,
      message: `Executive report dispatched to ${to}`,
      logId: logEntry._id
    };
  } catch (error) {
    console.error('[API /api/reports/email] Error:', error);
    return { success: false, error: error.message };
  }
});
