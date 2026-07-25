import mongoose from 'mongoose';

const RiskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    project: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['Technical', 'Resource', 'Schedule', 'External', 'Quality'],
      default: 'Technical',
    },
    impact: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true,
    },
    likelihood: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'Mitigated', 'Closed', 'Monitoring'],
      default: 'Open',
    },
    owner: { type: String, required: true, trim: true },
    mitigation: { type: String, required: true, trim: true },
    daysOpen: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.Risk || mongoose.model('Risk', RiskSchema);
