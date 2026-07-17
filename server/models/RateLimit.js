import mongoose from "mongoose";

const { Schema } = mongoose;

const RateLimitSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      default: 1,
    },
    expireAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: auto-deletes record when window expires
    },
  },
  { collection: "rate_limits", timestamps: true }
);

export default mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);
