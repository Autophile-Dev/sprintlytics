import mongoose from 'mongoose';

const UserSettingsSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    profile: {
      fullName: { type: String, default: 'Engineering Lead' },
      title: { type: String, default: 'Senior Scrum Master & Tech Lead' },
      department: { type: String, default: 'Core Engineering' },
      bio: { type: String, default: 'Optimizing sprint velocity, code quality, and delivery throughput across engineering teams.' },
      avatarUrl: { type: String, default: '' },
    },
    analytics: {
      defaultPeriod: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'daily' },
      defaultSprintDuration: { type: Number, default: 2, min: 1, max: 4 },
      storyPointScale: { type: String, enum: ['fibonacci', 'tshirt', 'linear'], default: 'fibonacci' },
      aiRiskSensitivity: { type: String, enum: ['aggressive', 'balanced', 'conservative'], default: 'balanced' },
      targetVelocity: { type: Number, default: 45 },
    },
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      highRiskBlockers: { type: Boolean, default: true },
      dailyDigest: { type: Boolean, default: false },
      weeklyReport: { type: Boolean, default: true },
      slackWebhook: { type: String, default: '' },
    },
    integrations: {
      jiraDomain: { type: String, default: '' },
      jiraApiToken: { type: String, default: '' },
      githubToken: { type: String, default: '' },
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      sessionTimeoutMinutes: { type: Number, default: 60 },
    },
  },
  { timestamps: true }
);

export default mongoose.models.UserSettings || mongoose.model('UserSettings', UserSettingsSchema);
