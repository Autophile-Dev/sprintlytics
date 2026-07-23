/**
 * Mongoose model for `export_logs` collection.
 * Records data export operations performed within Sprintlytics Export Data Studio.
 */

import mongoose from "mongoose";
const { Schema } = mongoose;

const ExportLogSchema = new Schema(
  {
    dataset: { type: String, required: true }, // 'sprint' | 'team' | 'risks' | 'backlog' | 'insights'
    datasetLabel: { type: String, default: 'Sprint Performance Data' },
    format: { type: String, required: true, default: 'csv' }, // 'csv' | 'json' | 'xlsx' | 'pdf'
    companyName: { type: String, default: 'ALL' },
    period: { type: String, default: 'daily' },
    recordCount: { type: Number, default: 0 },
    fileSize: { type: String, default: '0 KB' },
    fileName: { type: String, default: '' },
    exportedBy: { type: String, default: 'System User' },
    fieldsIncluded: { type: [String], default: [] },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "export_logs", timestamps: true }
);

export default mongoose.models.ExportLog || mongoose.model("ExportLog", ExportLogSchema);
