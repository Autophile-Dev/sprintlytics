/**
 * Mongoose model for the `email_logs` collection.
 * Written by the "Log Executive Email" and "Log Individual Emails" nodes
 * of the "AI - PM - DB" n8n workflow — one document per email.
 *
 * Both executive and individual emails share this collection; the
 * `recipientName` field is only populated on individual emails.
 *
 * Requires: npm install mongoose
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

const EmailLogSchema = new Schema(
  {
    executionId: { type: String, index: true },
    workflowId: { type: String, index: true },
    emailType: { type: String }, // executive | individual
    status: { type: String },
    delivered: { type: Boolean, default: false },
    to: { type: String, default: "" },
    recipientName: { type: String, default: "" }, // individual emails only
    recipientCount: { type: Number, default: 0 },
    fromEmail: { type: String, default: "" },
    subject: { type: String, default: "" },
    htmlBody: { type: String, default: "" },
    htmlLength: { type: Number, default: 0 },
    sentAt: { type: Date },
  },
  { collection: "email_logs", timestamps: true },
);

module.exports =
  mongoose.models.EmailLog || mongoose.model("EmailLog", EmailLogSchema);
