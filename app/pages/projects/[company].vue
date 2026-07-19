<template>
  <div class="project-analytics-container">
    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <div class="spinner"></div>
      <p>Loading analytics for {{ decodedCompany }}...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error || !projectData" class="error-state">
      <div class="error-icon">!</div>
      <h2>No Performance Data Found</h2>
      <p>Could not find performance records for <strong>{{ decodedCompany }}</strong>.</p>
      <NuxtLink to="/" class="btn-primary">Back to Dashboard</NuxtLink>
    </div>

    <!-- Content State -->
    <template v-else>
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-main">
          <div class="company-badge">
            <span class="dot"></span> Project Performance
          </div>
          <h1 class="page-title">{{ projectData.companyName || decodedCompany }}</h1>
          <p class="page-subtitle">
            {{ projectData.periodLabel || 'Sprint Performance Overview' }} • Report Run: {{ formatDate(projectData.generatedAt || projectData.createdAt) }}
          </p>
        </div>

        <div class="header-status">
          <div class="health-card" :class="getHealthClass(projectData.kpis?.healthScore)">
            <span class="health-score">{{ projectData.kpis?.healthScore || 0 }}%</span>
            <span class="health-label">{{ projectData.kpis?.healthLabel || 'Health Score' }}</span>
          </div>
        </div>
      </header>

      <!-- KPI Summary Cards -->
      <section class="kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Completion Rate</span>
          <div class="kpi-value">{{ projectData.kpis?.completionPct || 0 }}%</div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill primary" :style="{ width: (projectData.kpis?.completionPct || 0) + '%' }"></div>
          </div>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Sprint Velocity</span>
          <div class="kpi-value">{{ projectData.kpis?.velocity || 0 }} <span class="unit">pts</span></div>
          <span class="kpi-sub">{{ projectData.kpis?.storyPointsCompleted || 0 }} / {{ projectData.kpis?.storyPointsTotal || 0 }} Story Points</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Total Issues</span>
          <div class="kpi-value">{{ projectData.kpis?.totalIssues || 0 }}</div>
          <div class="issue-breakdown">
            <span class="badge done">{{ projectData.kpis?.done || 0 }} Done</span>
            <span class="badge progress">{{ projectData.kpis?.inProgress || 0 }} In Progress</span>
            <span class="badge blocked" v-if="projectData.kpis?.blocked">{{ projectData.kpis.blocked }} Blocked</span>
          </div>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Bugs & High Priority</span>
          <div class="kpi-value text-warning">{{ projectData.kpis?.bugCount || 0 }} <span class="unit">bugs</span></div>
          <span class="kpi-sub">{{ projectData.kpis?.highPriority || 0 }} High Priority Items</span>
        </div>
      </section>

      <!-- Sprint Overview Card -->
      <div class="card mb-4" v-if="projectData.sprint?.name">
        <div class="card-header">
          <div>
            <h2 class="card-title">Active Sprint: {{ projectData.sprint.name }}</h2>
            <p class="card-subtitle" v-if="projectData.sprint.goal">Goal: {{ projectData.sprint.goal }}</p>
          </div>
          <span class="status-tag" :class="projectData.sprint.state">{{ projectData.sprint.state || 'active' }}</span>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="analytics-grid">
        <!-- Left Column: Team & Columns -->
        <div class="grid-col-left">
          <!-- Team Workload Table -->
          <div class="card" v-if="projectData.team && projectData.team.length">
            <div class="card-header">
              <h2 class="card-title">Team Performance & Utilization</h2>
            </div>
            <div class="card-body padding-none">
              <div class="team-table-wrapper">
                <table class="team-table">
                  <thead>
                    <tr>
                      <th>Member</th>
                      <th>Assigned</th>
                      <th>Completed</th>
                      <th>Story Points</th>
                      <th>Utilization</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="member in projectData.team" :key="member.name">
                      <td class="font-semibold">{{ member.name }}</td>
                      <td>{{ member.assigned }}</td>
                      <td class="text-success font-semibold">{{ member.completed }}</td>
                      <td>{{ member.storyPointsDelivered || 0 }} / {{ member.storyPointsAssigned || 0 }}</td>
                      <td>
                        <div class="util-box">
                          <span>{{ member.utilizationPct || 0 }}%</span>
                          <div class="progress-bar-bg compact">
                            <div 
                              class="progress-bar-fill"
                              :class="(member.utilizationPct || 0) > 90 ? 'warning' : 'primary'"
                              :style="{ width: Math.min(member.utilizationPct || 0, 100) + '%' }"
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span class="member-status-badge" :class="getMemberStatusClass(member.status)">
                          {{ member.status || 'Active' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Priority Distribution -->
          <div class="card" v-if="projectData.prioritySprint && projectData.prioritySprint.length">
            <div class="card-header">
              <h2 class="card-title">Priority Breakdown</h2>
            </div>
            <div class="card-body">
              <div class="priority-list">
                <div v-for="p in projectData.prioritySprint" :key="p.priority" class="priority-row">
                  <div class="priority-info">
                    <span class="priority-name">{{ p.priority }}</span>
                    <span class="priority-count">{{ p.done }} / {{ p.total }} completed</span>
                  </div>
                  <div class="progress-bar-bg">
                    <div 
                      class="progress-bar-fill" 
                      :style="{ width: (p.total ? Math.round((p.done / p.total) * 100) : 0) + '%', backgroundColor: p.color || '#059669' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: AI Analysis & Executive Summary -->
        <div class="grid-col-right" v-if="projectData.analysis">
          <!-- Executive Summary Box -->
          <div class="card ai-summary-card" v-if="projectData.analysis.executiveSummary">
            <div class="card-header">
              <div class="ai-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                </svg>
                AI Executive Summary
              </div>
            </div>
            <p class="summary-text">{{ projectData.analysis.executiveSummary }}</p>
          </div>

          <!-- Achievements -->
          <div class="card" v-if="projectData.analysis.keyAchievements && projectData.analysis.keyAchievements.length">
            <h3 class="card-title text-success mb-2">Key Achievements</h3>
            <ul class="bullet-list positive">
              <li v-for="(item, idx) in projectData.analysis.keyAchievements" :key="idx">{{ item }}</li>
            </ul>
          </div>

          <!-- Risks & Blockers -->
          <div class="card" v-if="(projectData.analysis.risks && projectData.analysis.risks.length) || (projectData.analysis.blockers && projectData.analysis.blockers.length)">
            <h3 class="card-title text-danger mb-2">Risks & Bottlenecks</h3>
            <ul class="bullet-list danger">
              <li v-for="(item, idx) in projectData.analysis.risks" :key="'risk-'+idx">{{ item }}</li>
              <li v-for="(item, idx) in projectData.analysis.blockers" :key="'block-'+idx">{{ item }}</li>
            </ul>
          </div>

          <!-- Priority Actions & Recommendations -->
          <div class="card" v-if="projectData.analysis.recommendations && projectData.analysis.recommendations.length">
            <h3 class="card-title text-primary mb-2">Recommendations</h3>
            <ul class="bullet-list primary">
              <li v-for="(item, idx) in projectData.analysis.recommendations" :key="idx">{{ item }}</li>
            </ul>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const decodedCompany = computed(() => {
  const param = route.params.company;
  return param ? decodeURIComponent(param) : '';
});

// Fetch performance data for company
const { data, pending, error } = await useFetch(`/api/projects/by-company?company=${encodeURIComponent(decodedCompany.value)}`, {
  watch: [decodedCompany]
});

const projectData = computed(() => data.value?.data || null);

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getHealthClass = (score) => {
  if (!score) return 'neutral';
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'warning';
};

const getMemberStatusClass = (status) => {
  if (!status) return 'normal';
  const s = status.toLowerCase();
  if (s.includes('overload')) return 'danger';
  if (s.includes('risk')) return 'warning';
  return 'normal';
};
</script>

<style scoped>
.project-analytics-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Open Sans', sans-serif;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 5rem 2rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  text-align: center;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #E5E7EB;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #FEF2F2;
  color: #EF4444;
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 1.25rem;
}

.company-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  margin-bottom: 0.5rem;
}

.company-badge .dot {
  width: 6px;
  height: 6px;
  background-color: #10B981;
  border-radius: 50%;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 500;
  color: #111827;
  margin: 0;
}

.page-subtitle {
  font-size: 0.88rem;
  color: #6B7280;
  margin: 0.25rem 0 0;
}

.health-card {
  padding: 0.75rem 1.5rem;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.health-card.excellent { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
.health-card.good { background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }
.health-card.warning { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
.health-card.neutral { background: #F3F4F6; color: #374151; border: 1px solid #E5E7EB; }

.health-score {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.health-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-top: 0.25rem;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.kpi-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
}

.kpi-value .unit {
  font-size: 0.9rem;
  font-weight: 500;
  color: #6B7280;
}

.kpi-sub {
  font-size: 0.78rem;
  color: #6B7280;
}

.issue-breakdown {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.badge.done { background: #ECFDF5; color: #059669; }
.badge.progress { background: #EFF6FF; color: #2563EB; }
.badge.blocked { background: #FEF2F2; color: #EF4444; }

.text-warning { color: #D97706; }
.text-danger { color: #EF4444; }
.text-success { color: #059669; }
.text-primary { color: #2563EB; }

/* Progress Bar */
.progress-bar-bg {
  width: 100%;
  height: 6px;
  background-color: #F3F4F6;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-bg.compact { height: 5px; }

.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
}

.progress-bar-fill.primary { background-color: #059669; }
.progress-bar-fill.warning { background-color: #F59E0B; }

/* Card */
.card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-subtitle {
  font-size: 0.82rem;
  color: #6B7280;
  margin: 0.2rem 0 0;
}

.mb-2 { margin-bottom: 0.5rem; }
.mb-4 { margin-bottom: 1rem; }

.status-tag {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: #ECFDF5;
  color: #059669;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
}

/* Layout Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 1.5rem;
}

.grid-col-left, .grid-col-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Table */
.padding-none { padding: 0; }

.team-table-wrapper {
  overflow-x: auto;
}

.team-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.team-table th {
  background: #F9FAFB;
  padding: 0.75rem 1rem;
  font-weight: 600;
  color: #4B5563;
  border-bottom: 1px solid #E5E7EB;
}

.team-table td {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #F3F4F6;
  color: #1F2937;
}

.team-table tr:last-child td { border-bottom: none; }

.font-semibold { font-weight: 600; }

.util-box {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-weight: 600;
}

.member-status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: #F3F4F6;
  color: #4B5563;
}

.member-status-badge.danger { background: #FEF2F2; color: #EF4444; }
.member-status-badge.warning { background: #FEF3C7; color: #D97706; }

/* Priority */
.priority-list {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.priority-row {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.priority-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 600;
}

.priority-name { color: #1F2937; }
.priority-count { color: #6B7280; }

/* AI Summary */
.ai-summary-card {
  background: linear-gradient(135deg, #065F46 0%, #047857 100%);
  color: #ffffff;
  border: none;
}

.ai-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.summary-text {
  font-size: 0.9rem;
  line-height: 1.6;
  opacity: 0.95;
  margin: 0;
}

.bullet-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #374151;
}

.bullet-list.positive li::marker { color: #059669; }
.bullet-list.danger li::marker { color: #EF4444; }
.bullet-list.primary li::marker { color: #2563EB; }

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background-color: #059669;
  color: #ffffff;
  border-radius: 10px;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
}

@media (max-width: 1024px) {
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .analytics-grid { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>
