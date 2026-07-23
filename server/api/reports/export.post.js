import connectDB from "../../utils/db";
import ExportLog from "../../models/ExportLog";

export default defineEventHandler(async (event) => {
  try {
    await connectDB();
    const body = await readBody(event);
    const { dataset, datasetLabel, format, companyName, period, recordCount, fileSize, fileName, exportedBy, fieldsIncluded } = body;

    if (!dataset || !format) {
      return { success: false, error: 'Dataset and format parameters are required.' };
    }

    const logEntry = await ExportLog.create({
      dataset: dataset.toLowerCase(),
      datasetLabel: datasetLabel || dataset,
      format: (format || 'csv').toLowerCase(),
      companyName: companyName || 'ALL',
      period: period || 'ALL',
      recordCount: recordCount || 0,
      fileSize: fileSize || '15 KB',
      fileName: fileName || `sprintlytics_${dataset}_export.csv`,
      exportedBy: exportedBy || 'Executive User',
      fieldsIncluded: Array.isArray(fieldsIncluded) ? fieldsIncluded : [],
      timestamp: new Date()
    });

    return {
      success: true,
      message: 'Export logged successfully',
      logId: logEntry._id
    };
  } catch (error) {
    console.error('[API /api/reports/export POST] Error:', error);
    return { success: false, error: error.message };
  }
});
