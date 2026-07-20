<template>
  <div class="team-utilization-container">
    <!-- Header with Filters -->
    <header class="team-utilization-header">
      <h1 class="page-title">Team Utilization Dashboard</h1>
      <p class="page-subtitle">Real‑time capacity insights for engineering squads.</p>
      <div class="filters">
        <CustomSelect
          v-model="selectedProject"
          :options="projectOptions"
          placeholder="All Projects"
          class="filter-select"
        />
        <CustomSelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="All Statuses"
          class="filter-select"
        />
      </div>
    </header>

    <!-- Executive Summary Cards -->
    <section class="summary-cards">
      <div class="kpi-card-premium">
        <div class="kpi-header-row">
          <span class="kpi-name">Team Size</span>
        </div>
        <div class="kpi-value-row"><span class="kpi-value">{{ summary.totalMembers }}</span></div>
      </div>
      <div class="kpi-card-premium">
        <div class="kpi-header-row">
          <span class="kpi-name">Avg Utilization</span>
        </div>
        <div class="kpi-value-row"><span class="kpi-value">{{ summary.avgUtilization }}%</span></div>
      </div>
      <div class="kpi-card-premium">
        <div class="kpi-header-row">
          <span class="kpi-name">Capacity Load</span>
        </div>
        <div class="kpi-value-row"><span class="kpi-value">{{ summary.capacityLoadPct }}%</span></div>
        <div class="kpi-footer-row"><span class="kpi-footer-label">Allocated {{ summary.totalAllocated }}h / {{ summary.totalAvailable }}h</span></div>
      </div>
      <div class="kpi-card-premium">
        <div class="kpi-header-row">
          <span class="kpi-name">Overloaded</span>
        </div>
        <div class="kpi-value-row"><span class="kpi-value text-danger">{{ summary.overloadedCount }}</span></div>
      </div>
      <div class="kpi-card-premium">
        <div class="kpi-header-row">
          <span class="kpi-name">Underutilized</span>
        </div>
        <div class="kpi-value-row"><span class="kpi-value text-warning">{{ summary.underutilizedCount }}</span></div>
      </div>
      <div class="kpi-card-premium">
        <div class="kpi-header-row">
          <span class="kpi-name">At Risk</span>
        </div>
        <div class="kpi-value-row"><span class="kpi-value text-danger">{{ summary.atRiskCount }}</span></div>
      </div>
    </section>

    <!-- Utilization Trend Sparkline -->
    <section class="trend-section">
      <h2 class="section-title">Utilization Trend (last 10 snapshots)</h2>
      <SparklineChart :data="utilizationTrend.map(t => t.utilizationPct)" class="sparkline" />
      <div class="trend-legend">
        <span v-for="pt in utilizationTrend" :key="pt.sprint" class="legend-item">
          {{ pt.sprint }}: {{ pt.utilizationPct }}%
        </span>
      </div>
    </section>

    <!-- Role Distribution Bar Chart -->
    <section class="role-distribution">
      <h2 class="section-title">Role Breakdown</h2>
      <div class="role-bars">
        <div
          v-for="r in roleBreakdown"
          :key="r.role"
          class="role-bar"
        >
          <span class="role-label">{{ r.role }}</span>
          <div class="bar-bg">
            <div class="bar-fill" :style="{ width: r.pct + '%' }"></div>
          </div>
          <span class="role-pct">{{ r.pct }}%</span>
        </div>
      </div>
    </section>

    <!-- Team Member Table -->
    <section class="team-table-section">
      <h2 class="section-title">Team Members</h2>
      <table class="team-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Company</th>
            <th>Sprint</th>
            <th>Assigned hrs</th>
            <th>Completed hrs</th>
            <th>Story Points Delivered</th>
            <th>Utilization % </th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in members" :key="m.email">
            <td>{{ m.name }}</td>
            <td>{{ m.role }}</td>
            <td>{{ m.companyName }}</td>
            <td>{{ m.sprintName }}</td>
            <td>{{ m.assigned }}</td>
            <td>{{ m.completed }}</td>
            <td>{{ m.storyPointsDelivered }}</td>
            <td>{{ m.utilizationPct }}%</td>
            <td>
              <span :class="['status-badge', statusClass(m.status)]">{{ m.status }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <!-- AI Insights -->
    <section class="ai-insights">
      <h2 class="section-title">AI‑Generated Insights</h2>
      <p class="insight-summary">{{ aiInsights.summary }}</p>
      <ul class="insight-recs">
        <li v-for="(rec, i) in aiInsights.recommendations" :key="i">{{ rec }}</li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import CustomSelect from '~/components/CustomSelect.vue';
import SparklineChart from '~/components/SparklineChart.vue';
import { useFetch } from '#app';

useHead({ title: 'Team Utilization | Sprintlytics' });

const route = useRoute();

// Reactive filters
const selectedProject = ref('ALL');
const selectedStatus = ref('ALL');

// API fetch – query changes trigger re‑fetch automatically
const { data, pending, error, refresh } = await useFetch('/api/team/utilization', {
  query: computed(() => ({ project: selectedProject.value, status: selectedStatus.value })),
  watch: [selectedProject, selectedStatus]
});

// Defensive fallback if API fails
const summary = computed(() => data.value?.summary || {});
const members = computed(() => data.value?.members || []);
const roleBreakdown = computed(() => data.value?.roleBreakdown || []);
const utilizationTrend = computed(() => data.value?.utilizationTrend || []);
const projectOptions = computed(() => data.value?.projectOptions || [{ label: 'All Projects', value: 'ALL' }]);
const statusOptions = computed(() => data.value?.statusOptions || []);
const aiInsights = computed(() => data.value?.aiInsights || { summary: '', recommendations: [] });

function statusClass(status) {
  switch (status) {
    case 'Overloaded':
      return 'status-overloaded';
    case 'Underutilized':
      return 'status-underutilized';
    case 'At Risk':
      return 'status-at-risk';
    default:
      return 'status-balanced';
  }
}
</script>

<style scoped>
.team-utilization-container { padding: 2rem; max-width: 1440px; margin: 0 auto; }
.team-utilization-header { margin-bottom: 2rem; }
.page-title { font-size: 2.2rem; font-weight: 700; margin: 0; }
.page-subtitle { font-size: 1rem; color: var(--text-subtle); margin-top: 0.25rem; }
.filters { display: flex; gap: 1rem; margin-top: 1rem; }
.filter-select { width: 200px; }
.summary-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
.kpi-card-premium { background: var(--card-bg); border-radius: 12px; padding: 1rem; box-shadow: var(--card-shadow); }
.kpi-header-row { font-size: 0.9rem; color: var(--text-muted); }
.kpi-value-row { font-size: 1.5rem; font-weight: 600; margin-top: 0.25rem; }
.kpi-footer-label { font-size: 0.75rem; color: var(--text-muted); }
.trend-section, .role-distribution, .team-table-section, .ai-insights { margin-top: 2.5rem; }
.section-title { font-size: 1.6rem; font-weight: 600; margin-bottom: 1rem; }
.sparkline { height: 120px; }
.trend-legend { display: flex; flex-wrap: wrap; gap: 0.5rem; font-size: 0.85rem; color: var(--text-muted); }
.role-bars { display: flex; flex-direction: column; gap: 0.75rem; }
.role-bar { display: flex; align-items: center; gap: 0.5rem; }
.role-label { width: 120px; font-size: 0.9rem; }
.bar-bg { flex: 1; background: var(--bg-muted); height: 12px; border-radius: 6px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--accent); }
.role-pct { width: 40px; text-align: right; font-size: 0.85rem; }
.team-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
.team-table th, .team-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border); font-size: 0.9rem; }
.status-badge { padding: 0.2rem 0.5rem; border-radius: 8px; font-size: 0.75rem; font-weight: 500; }
.status-balanced { background: #e0f7fa; color: #006064; }
.status-overloaded { background: #ffebee; color: #b71c1c; }
.status-underutilized { background: #fff3e0; color: #e65100; }
.status-at-risk { background: #f3e5f5; color: #4a148c; }
.ai-insights { background: var(--card-bg); padding: 1.5rem; border-radius: 12px; box-shadow: var(--card-shadow); }
.insight-summary { font-weight: 600; margin-bottom: 0.75rem; }
.insight-recs { list-style: disc inside; margin: 0; padding-left: 1rem; }
</style>
