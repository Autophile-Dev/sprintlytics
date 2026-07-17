import mongoose from "mongoose";

const { Schema } = mongoose;

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 60 * 60 * 1000; // 1 hour lockout

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String],
      default: ["user"],
    },
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  { collection: "users", timestamps: true }
);

// Virtual attribute for checking if account is locked
UserSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Increment failed login attempts and lock if threshold is reached
UserSchema.methods.incLoginAttempts = async function () {
  // If we have an expired lock, reset to 1 attempt and clear lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    this.loginAttempts = 1;
    this.lockUntil = null;
    return this.save();
  }

  this.loginAttempts += 1;
  
  // Lock the account if we hit the limit
  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  return this.save();
};

// Reset login attempts on successful login
UserSchema.methods.resetLoginAttempts = async function () {
  this.loginAttempts = 0;
  this.lockUntil = null;
  return this.save();
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
