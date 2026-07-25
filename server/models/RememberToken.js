import mongoose from 'mongoose';

const RememberTokenSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    tokenHash: { type: String, required: true, index: true },
    userAgent: { type: String, default: 'Unknown Device' },
    ipAddress: { type: String, default: '127.0.0.1' },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.RememberToken ||
  mongoose.model('RememberToken', RememberTokenSchema);
