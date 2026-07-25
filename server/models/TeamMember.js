import mongoose from 'mongoose';

const TeamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    avatar: { type: String, default: '' },
    maxCapacityHours: { type: Number, default: 40 },
    allocatedHours: { type: Number, default: 35 },
    efficiencyScore: { type: Number, default: 90, min: 0, max: 100 },
  },
  { timestamps: true }
);

export default mongoose.models.TeamMember ||
  mongoose.model('TeamMember', TeamMemberSchema);
