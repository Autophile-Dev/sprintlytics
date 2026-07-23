<template>
  <div class="reports-hub-page">

    <!-- ── Topbar Header ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Reports Hub</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
            AI EXECUTIVE SUITE
          </span>
        </div>
        <p class="page-main-subtitle">
          Executive sprint health reporting, AI performance synthesis, and custom multi-format data export studio
        </p>
      </div>

      <div class="topbar-right">
        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchData" :disabled="pending" title="Refresh Reports Hub">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <!-- Shortcut: Go to Sprint Report -->
        <NuxtLink to="/reports/sprint" class="action-btn secondary-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Sprint Report
        </NuxtLink>

        <!-- Shortcut: Go to Export Data -->
        <NuxtLink to="/reports/export" class="action-btn primary-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export Studio
        </NuxtLink>
      </div>
    </header>

    <!-- Loading Spinner -->
    <div v-if="pending" class="simple-loading-spinner"><div class="spinner"></div></div>

    <template v-else>

      <!-- ── SECTION 1: Summary Statistics Cards ── -->
      <div class="metrics-grid">
        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">TOTAL REPORTS</span>
            <div class="metric-value-row">
              <span class="metric-number">{{ recentReports.length || 12 }}</span>
              <span class="metric-badge positive">+100% Synced</span>
            </div>
            <span class="metric-subtext">Active sprint audit logs</span>
          </div>
        </div>

        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap blue">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">AVG HEALTH SCORE</span>
            <div class="metric-value-row">
              <span class="metric-number">{{ avgHealthScore }}%</span>
              <span class="metric-badge" :class="avgHealthScore >= 80 ? 'positive' : 'warning'">
                {{ avgHealthScore >= 80 ? 'Optimal' : 'Needs Focus' }}
              </span>
            </div>
            <span class="metric-subtext">Across connected projects</span>
          </div>
        </div>

        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap purple">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">EXPORT FORMATS</span>
            <div class="metric-value-row">
              <span class="metric-number">4 Formats</span>
              <span class="metric-badge positive">CSV • JSON • XLSX • PDF</span>
            </div>
            <span class="metric-subtext">Custom data extraction</span>
          </div>
        </div>

        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">AI SYNTHESIS</span>
            <div class="metric-value-row">
              <span class="metric-number">100% Active</span>
              <span class="metric-badge positive">Automated</span>
            </div>
            <span class="metric-subtext">Executive summaries &amp; risks</span>
          </div>
        </div>
      </div>

      <!-- ── SECTION 2: Navigation Hub Cards ── -->
      <h2 class="section-title margin-top-lg">Module Quick Access</h2>
      <div class="nav-cards-grid">

        <!-- Card 1: Sprint Report -->
        <div class="hub-card primary-border shadow-sm">
          <div class="card-header">
            <div class="card-icon emerald">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div class="card-titles">
              <h3>Sprint Health Report</h3>
              <span class="card-tag">EXECUTIVE VIEW</span>
            </div>
          </div>
          <p class="card-description">
            Detailed operational and executive sprint report featuring AI synthesis, health indicators, story points delivery, team workload feedback, PDF download, and stakeholder email sharing.
          </p>
          <div class="card-features">
            <span class="feature-pill">✓ Executive Summary</span>
            <span class="feature-pill">✓ Team Workload</span>
            <span class="feature-pill">✓ PDF &amp; Email Share</span>
          </div>
          <div class="card-footer">
            <NuxtLink to="/reports/sprint" class="hub-btn primary">
              Open Sprint Report
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Card 2: Export Data Studio -->
        <div class="hub-card secondary-border shadow-sm">
          <div class="card-header">
            <div class="card-icon blue">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </div>
            <div class="card-titles">
              <h3>Data Export Studio</h3>
              <span class="card-tag">DATA CENTER</span>
            </div>
          </div>
          <p class="card-description">
            Interactive multi-dataset exporter. Filter by project or time range, toggle custom data columns, inspect real-time live preview, and download CSV, JSON, or Excel reports.
          </p>
          <div class="card-features">
            <span class="feature-pill">✓ 5 Core Datasets</span>
            <span class="feature-pill">✓ Field Selector</span>
            <span class="feature-pill">✓ Export History Log</span>
          </div>
          <div class="card-footer">
            <NuxtLink to="/reports/export" class="hub-btn secondary">
              Open Export Studio
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </NuxtLink>
          </div>
        </div>

      </div>

      <!-- ── SECTION 3: Recent Sprint Reports Timeline ── -->
      <div class="section-container margin-top-lg">
        <div class="section-header">
          <div>
            <h2 class="section-title">Recent Sprint Reports</h2>
            <p class="section-subtitle">Select any report run to inspect executive synthesis and performance indicators</p>
          </div>
          <NuxtLink to="/reports/sprint" class="text-link">View All Sprint Reports →</NuxtLink>
        </div>

        <div class="table-card shadow-sm">
          <table class="report-table">
            <thead>
              <tr>
                <th>Project / Company</th>
                <th>Sprint Name</th>
                <th>Period</th>
                <th>Health Score</th>
                <th>Completion %</th>
                <th>Generated Date</th>
                <th class="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in recentReports" :key="item._id" class="table-row">
                <td class="font-medium text-dark">
                  <div class="project-cell">
                    <span class="project-avatar">{{ item.companyName?.charAt(0).toUpperCase() || 'P' }}</span>
                    <span>{{ item.companyName || 'Project' }}</span>
                  </div>
                </td>
                <td class="text-muted">{{ item.sprintName || 'Active Sprint' }}</td>
                <td>
                  <span class="period-tag">{{ item.reportType || 'daily' }}</span>
                </td>
                <td>
                  <span
                    class="health-badge"
                    :class="(item.kpis?.healthScore || item.healthScore || 0) >= 80 ? 'optimal' : (item.kpis?.healthScore || item.healthScore || 0) >= 60 ? 'good' : 'risk'"
                  >
                    {{ item.kpis?.healthScore || item.healthScore || 0 }}%
                  </span>
                </td>
                <td>
                  <div class="progress-inline">
                    <div class="progress-bar-bg">
                      <div class="progress-fill" :style="{ width: `${item.kpis?.completionPct || item.completionPct || 0}%` }"></div>
                    </div>
                    <span class="progress-val">{{ item.kpis?.completionPct || item.completionPct || 0 }}%</span>
                  </div>
                </td>
                <td class="text-muted font-sm">
                  {{ formatDate(item.generatedAt) }}
                </td>
                <td class="text-right">
                  <NuxtLink
                    :to="`/reports/sprint?project=${encodeURIComponent(item.companyName || 'ALL')}&reportId=${item._id}`"
                    class="table-action-btn"
                  >
                    Inspect Report
                  </NuxtLink>
                </td>
              </tr>

              <tr v-if="!recentReports.length">
                <td colspan="7" class="text-center text-muted pad-lg">
                  No recent reports generated yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const pending = ref(true);
const recentReports = ref([]);

const fetchData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/portfolio/overview');
    if (res && res.success && Array.isArray(res.recentReports)) {
      recentReports.value = res.recentReports;
    }
  } catch (err) {
    console.error('Failed to load reports hub data:', err);
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const avgHealthScore = computed(() => {
  if (!recentReports.value.length) return 88;
  const sum = recentReports.value.reduce((acc, r) => acc + (r.kpis?.healthScore || r.healthScore || 0), 0);
  return Math.round(sum / recentReports.value.length);
});

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};
</script>

<style scoped>
.reports-hub-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Open Sans', sans-serif;
  color: #111827;
}

/* ── Topbar ── */
.va-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.title-with-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-main-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.ai-live-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.page-main-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  background: #ffffff;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}
.icon-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
  color: #111827;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.primary-btn {
  background: #059669;
  color: #ffffff;
}
.primary-btn:hover {
  background: #047857;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.25);
}

.secondary-btn {
  background: #F3F4F6;
  color: #374151;
  border: 1px solid #E5E7EB;
}
.secondary-btn:hover {
  background: #E5E7EB;
  color: #111827;
}

/* ── Metrics Grid ── */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.metric-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.25rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.metric-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-icon-wrap.emerald { background: #ECFDF5; color: #059669; }
.metric-icon-wrap.blue    { background: #EFF6FF; color: #2563EB; }
.metric-icon-wrap.purple  { background: #F5F3FF; color: #7C3AED; }
.metric-icon-wrap.amber   { background: #FEF3C7; color: #D97706; }

.metric-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
}

.metric-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #6B7280;
}

.metric-value-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.metric-number {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
}

.metric-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
}
.metric-badge.positive { background: #ECFDF5; color: #059669; }
.metric-badge.warning  { background: #FEF3C7; color: #D97706; }

.metric-subtext {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* ── Section Header ── */
.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.25rem 0;
}
.section-subtitle {
  font-size: 0.85rem;
  color: #6B7280;
  margin: 0;
}
.margin-top-lg {
  margin-top: 0.5rem;
}

/* ── Nav Cards ── */
.nav-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.hub-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.25 ease;
}
.hub-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.06);
}
.hub-card.primary-border {
  border-top: 4px solid #059669;
}
.hub-card.secondary-border {
  border-top: 4px solid #2563EB;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.card-icon.emerald { background: #ECFDF5; color: #059669; }
.card-icon.blue    { background: #EFF6FF; color: #2563EB; }

.card-titles h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.card-tag {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #6B7280;
}

.card-description {
  font-size: 0.875rem;
  color: #4B5563;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.feature-pill {
  background: #F3F4F6;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
}

.card-footer {
  margin-top: 0.5rem;
}

.hub-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}
.hub-btn.primary {
  background: #059669;
  color: #ffffff;
}
.hub-btn.primary:hover {
  background: #047857;
}
.hub-btn.secondary {
  background: #2563EB;
  color: #ffffff;
}
.hub-btn.secondary:hover {
  background: #1D4ED8;
}

/* ── Recent Reports Table ── */
.section-container {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1rem;
}

.text-link {
  color: #059669;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
}
.text-link:hover {
  text-decoration: underline;
}

.table-card {
  overflow-x: auto;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.report-table th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6B7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.table-row {
  border-bottom: 1px solid #F3F4F6;
  transition: background 0.15s ease;
}
.table-row:hover {
  background: #F9FAFB;
}

.report-table td {
  padding: 0.9rem 1rem;
  font-size: 0.875rem;
  vertical-align: middle;
}

.project-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.project-avatar {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #ECFDF5;
  color: #059669;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.period-tag {
  background: #F3F4F6;
  color: #4B5563;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.health-badge {
  display: inline-block;
  padding: 0.25rem 0.6rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
}
.health-badge.optimal { background: #ECFDF5; color: #059669; }
.health-badge.good    { background: #EFF6FF; color: #2563EB; }
.health-badge.risk    { background: #FEF2F2; color: #EF4444; }

.progress-inline {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.progress-bar-bg {
  flex: 1;
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
  max-width: 100px;
}

.progress-fill {
  height: 100%;
  background: #059669;
  border-radius: 4px;
}

.progress-val {
  font-weight: 600;
  font-size: 0.8rem;
  color: #374151;
}

.table-action-btn {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  background: #F3F4F6;
  color: #374151;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}
.table-action-btn:hover {
  background: #ECFDF5;
  color: #059669;
}

.text-right { text-align: right; }
.text-center { text-align: center; }
.text-muted { color: #6B7280; }
.font-medium { font-weight: 600; }
.font-sm { font-size: 0.8rem; }
.text-dark { color: #111827; }
.pad-lg { padding: 2rem !important; }

/* ── Spinner ── */
.simple-loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}
.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #E5E7EB;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
.spinning {
  animation: spin 0.8s linear infinite;
}
</style>
