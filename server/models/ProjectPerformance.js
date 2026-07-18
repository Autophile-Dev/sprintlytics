/**
 * Mongoose model for the `project_performance` collection.
 * Written by the "Store Performance Data" node of the
 * "AI - PM - DB" n8n workflow — one document per report run.
 *
 * Requires: npm install mongoose
 */

import mongoose from "mongoose";
const { Schema } = mongoose;

/* ---------- embedded sub-schemas ---------- */

const SprintSchema = new Schema(
  {
    id: { type: Schema.Types.Mixed }, // Jira sprint id (number/string)
    name: { type: String, default: "Active Sprint" },
    goal: { type: String, default: "No sprint goal set" },
    state: { type: String },
    startDate: { type: String, default: null },
    endDate: { type: String, default: null },
    completeDate: { type: String, default: null },
  },
  { _id: false },
);

const KpisSchema = new Schema(
  {
    totalIssues: { type: Number, default: 0 },
    completionPct: { type: Number, default: 0 },
    spCompletionPct: { type: Number, default: 0 },
    healthScore: { type: Number, default: 0 },
    healthLabel: { type: String },
    velocity: { type: Number, default: 0 },
    storyPointsTotal: { type: Number, default: 0 },
    storyPointsCompleted: { type: Number, default: 0 },
    storyPointsRemaining: { type: Number, default: 0 },
    done: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    todo: { type: Number, default: 0 },
    blocked: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 },
    bugCount: { type: Number, default: 0 },
    highPriority: { type: Number, default: 0 },
    avgResolutionHours: { type: Number, default: 0 },
    unassignedSprint: { type: Number, default: 0 },
    backlogTotal: { type: Number, default: 0 },
    backlogUnassigned: { type: Number, default: 0 },
    backlogHighPriority: { type: Number, default: 0 },
  },
  { _id: false },
);

const StatusColumnSchema = new Schema(
  {
    name: { type: String },
    count: { type: Number, default: 0 },
    categoryKey: { type: String, default: "new" },
    color: { type: String },
  },
  { _id: false },
);

const TeamMemberSchema = new Schema(
  {
    name: { type: String },
    email: { type: String, default: null },
    isUnassigned: { type: Boolean, default: false },
    assigned: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    blocked: { type: Number, default: 0 },
    highPriorityOpen: { type: Number, default: 0 },
    storyPointsDelivered: { type: Number, default: 0 },
    storyPointsAssigned: { type: Number, default: 0 },
    loggedHours: { type: Number, default: 0 },
    completionRate: { type: Number, default: 0 },
    utilizationPct: { type: Number, default: 0 },
    // Map of statusName -> count, e.g. { "In Progress": 3, "Done": 5 }
    byStatus: { type: Schema.Types.Mixed, default: {} },
    status: { type: String }, // Balanced | Overloaded | Underutilized | At Risk | Unassigned
  },
  { _id: false },
);

const PriorityStatSchema = new Schema(
  {
    priority: { type: String }, // Highest | High | Medium | Low | Lowest | None
    rank: { type: Number, default: 6 },
    total: { type: Number, default: 0 },
    done: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    todo: { type: Number, default: 0 },
    blocked: { type: Number, default: 0 },
    overdue: { type: Number, default: 0 },
    storyPoints: { type: Number, default: 0 },
    color: { type: String },
    openPct: { type: Number, default: 0 },
  },
  { _id: false },
);

const BacklogSchema = new Schema(
  {
    total: { type: Number, default: 0 },
    unassigned: { type: Number, default: 0 },
    highPriority: { type: Number, default: 0 },
    unprioritized: { type: Number, default: 0 },
    bugs: { type: Number, default: 0 },
    storyPoints: { type: Number, default: 0 },
    byPriority: { type: [PriorityStatSchema], default: [] },
    topHigh: { type: [String], default: [] },
  },
  { _id: false },
);

const TeamFeedbackEntrySchema = new Schema(
  {
    feedback: { type: String },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
  },
  { _id: false },
);

const AnalysisSchema = new Schema(
  {
    executiveSummary: { type: String },
    keyAchievements: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    blockers: { type: [String], default: [] },
    priorityActions: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    nextSprintSuggestions: { type: [String], default: [] },
    // Keyed by team member name -> feedback object
    teamFeedback: { type: Map, of: TeamFeedbackEntrySchema, default: {} },
  },
  { _id: false },
);

/* ---------- main schema ---------- */

const ProjectPerformanceSchema = new Schema(
  {
    executionId: { type: String, index: true },
    workflowId: { type: String, index: true },
    workflowName: { type: String },
    companyName: { type: String, default: "Unknown" },
    reportType: { type: String, default: "daily" }, // daily | weekly | monthly
    periodLabel: { type: String, default: "Sprint Report" },
    generatedAt: { type: Date },
    sprintId: { type: Schema.Types.Mixed, default: null },
    sprintName: { type: String, default: null },
    sprint: { type: SprintSchema, default: () => ({}) },
    kpis: { type: KpisSchema, default: () => ({}) },
    statusColumns: { type: [StatusColumnSchema], default: [] },
    team: { type: [TeamMemberSchema], default: [] },
    prioritySprint: { type: [PriorityStatSchema], default: [] },
    priorityBacklog: { type: [PriorityStatSchema], default: [] },
    priorityAll: { type: [PriorityStatSchema], default: [] },
    backlog: { type: BacklogSchema, default: () => ({}) },
    analysis: { type: AnalysisSchema, default: () => ({}) },
  },
  { collection: "project_performance", timestamps: true },
);

export default mongoose.models.ProjectPerformance ||
  mongoose.model("ProjectPerformance", ProjectPerformanceSchema);
