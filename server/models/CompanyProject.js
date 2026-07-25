import mongoose from 'mongoose';

const CompanyProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['On Track', 'At Risk', 'Off Track', 'Completed'],
      default: 'On Track',
    },
    healthScore: { type: Number, default: 85, min: 0, max: 100 },
    lead: { type: String, required: true, trim: true },
    techStack: [{ type: String }],
    progress: { type: Number, default: 0, min: 0, max: 100 },
    sprintCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

export default mongoose.models.CompanyProject ||
  mongoose.model('CompanyProject', CompanyProjectSchema);
