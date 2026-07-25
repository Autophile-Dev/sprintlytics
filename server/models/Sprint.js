import mongoose from 'mongoose';

const SprintSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    project: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    plannedPoints: { type: Number, required: true, min: 0 },
    completedPoints: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Planning'],
      default: 'Planning',
    },
    scopeAddedPoints: { type: Number, default: 0 },
    scopeRemovedPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Sprint || mongoose.model('Sprint', SprintSchema);
