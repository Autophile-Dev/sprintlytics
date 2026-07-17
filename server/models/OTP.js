import mongoose from "mongoose";

const { Schema } = mongoose;

const OTPSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      enum: ["email_verification", "password_reset"],
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // TTL index: deletes document when current time passes expiresAt
    },
  },
  { collection: "otps", timestamps: true }
);

export default mongoose.models.OTP || mongoose.model("OTP", OTPSchema);
