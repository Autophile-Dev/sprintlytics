<template>
  <div class="sprint-report-page">

    <!-- ── Global Filters & Controls Topbar ── -->
    <header class="va-topbar no-print">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Sprint Health Report</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
            AI GENERATED
          </span>
        </div>
        <p class="page-main-subtitle">
          Executive performance summary, team workload metrics, risk audit, and AI strategic recommendations
        </p>
      </div>

      <div class="topbar-right">
        <!-- Period Pills -->
        <div class="period-pills">
          <button
            v-for="p in ['daily','weekly','monthly']"
            :key="p"
            class="pill-btn"
            :class="{ active: selectedPeriod === p }"
            @click="setPeriod(p)"
          >
            {{ p.charAt(0).toUpperCase() + p.slice(1) }}
          </button>
        </div>

        <!-- Project Selector -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedProject"
            :options="projectOptions"
            @change="onProjectChange"
          />
        </div>

        <!-- Historical Sprint Report Selector (Always Enabled) -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedHistoryId"
            :options="historyOptions"
            @change="onHistoryChange"
          />
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchReportData" :disabled="pending" title="Refresh Report Data">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>

        <!-- Share Email Button -->
        <button class="action-btn secondary-btn" @click="openEmailModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Share Report
        </button>

        <!-- Print / PDF Download Button -->
        <button class="action-btn primary-btn" @click="triggerPrint">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Download PDF / Print
        </button>
      </div>
    </header>

    <!-- Toast Notification -->
    <Transition name="toast-fade">
      <div v-if="toast.show" class="toast-notification" :class="toast.type">
        <span class="toast-icon">
          <svg v-if="toast.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </span>
        {{ toast.message }}
      </div>
    </Transition>

    <!-- Loading Spinner -->
    <div v-if="pending" class="simple-loading-spinner"><div class="spinner"></div></div>

    <template v-else-if="reportData">

      <!-- Printable Report Banner Header -->
      <div class="print-header-banner">
        <div class="banner-left">
          <h2 class="banner-title">{{ reportData.companyName }} — {{ reportData.periodLabel }}</h2>
          <p class="banner-sub">Sprint: <strong>{{ reportData.sprint?.name }}</strong> | Generated: {{ formatDate(reportData.generatedAt) }}</p>
        </div>
        <div class="banner-right">
          <div class="score-pill" :class="reportData.kpis.healthScore >= 80 ? 'optimal' : reportData.kpis.healthScore >= 60 ? 'good' : 'risk'">
            Health Score: {{ reportData.kpis.healthScore }}%
          </div>
        </div>
      </div>

      <!-- ── SECTION 1: Key Executive Metric Cards ── -->
      <div class="metrics-grid">
        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">SPRINT HEALTH</span>
            <div class="metric-value-row">
              <span class="metric-number">{{ reportData.kpis.healthScore }}%</span>
              <span class="metric-badge" :class="reportData.kpis.healthScore >= 80 ? 'positive' : 'warning'">
                {{ reportData.kpis.healthLabel }}
              </span>
            </div>
            <span class="metric-subtext">Overall delivery efficiency</span>
          </div>
        </div>

        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">COMPLETION RATE</span>
            <div class="metric-value-row">
              <span class="metric-number">{{ reportData.kpis.completionPct }}%</span>
              <span class="metric-badge positive">{{ reportData.kpis.done }} / {{ reportData.kpis.totalIssues }} Tasks</span>
            </div>
            <span class="metric-subtext">Sprint backlog items closed</span>
          </div>
        </div>

        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">VELOCITY (SP)</span>
            <div class="metric-value-row">
              <span class="metric-number">{{ reportData.kpis.velocity }}</span>
              <span class="metric-badge positive">{{ reportData.kpis.storyPointsCompleted }} / {{ reportData.kpis.storyPointsTotal }} SP</span>
            </div>
            <span class="metric-subtext">Story points delivered</span>
          </div>
        </div>

        <div class="metric-card shadow-sm">
          <div class="metric-icon-wrap red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div class="metric-body">
            <span class="metric-label">BLOCKED &amp; BUGS</span>
            <div class="metric-value-row">
              <span class="metric-number">{{ reportData.kpis.blocked + reportData.kpis.bugCount }}</span>
              <span class="metric-badge" :class="reportData.kpis.blocked > 0 ? 'danger' : 'positive'">
                {{ reportData.kpis.blocked }} Blocked • {{ reportData.kpis.bugCount }} Bugs
              </span>
            </div>
            <span class="metric-subtext">Active delivery impediments</span>
          </div>
        </div>
      </div>

      <!-- ── SECTION 2: AI Executive Synthesis Banner ── -->
      <div class="ai-executive-card shadow-sm">
        <div class="ai-card-header">
          <div class="sparkle-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            </svg>
          </div>
          <h3>AI Executive Synthesis &amp; Directives</h3>
        </div>
        <p class="executive-text">
          {{ reportData.analysis.executiveSummary }}
        </p>

        <div class="ai-bullets-grid">
          <!-- Key Achievements -->
          <div class="bullet-box success" v-if="reportData.analysis.keyAchievements?.length">
            <h4 class="bullet-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Key Achievements
            </h4>
            <ul>
              <li v-for="(ach, idx) in reportData.analysis.keyAchievements" :key="idx">{{ ach }}</li>
            </ul>
          </div>

          <!-- Active Risks & Blockers -->
          <div class="bullet-box danger" v-if="reportData.analysis.risks?.length || reportData.analysis.blockers?.length">
            <h4 class="bullet-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Active Risks &amp; Blockers
            </h4>
            <ul>
              <li v-for="(blk, idx) in reportData.analysis.blockers" :key="'b'+idx"><strong>Blocker:</strong> {{ blk }}</li>
              <li v-for="(rsk, idx) in reportData.analysis.risks" :key="'r'+idx">{{ rsk }}</li>
            </ul>
          </div>

          <!-- Strategic Recommendations -->
          <div class="bullet-box info" v-if="reportData.analysis.recommendations?.length || reportData.analysis.priorityActions?.length">
            <h4 class="bullet-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Action Items &amp; Recommendations
            </h4>
            <ul>
              <li v-for="(act, idx) in reportData.analysis.priorityActions" :key="'pa'+idx"><strong>Priority:</strong> {{ act }}</li>
              <li v-for="(rec, idx) in reportData.analysis.recommendations" :key="'rec'+idx">{{ rec }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- ── SECTION 3: Task Status & Priority Distribution ── -->
      <div class="distribution-grid">

        <!-- Status Breakdown -->
        <div class="dist-card shadow-sm">
          <h3 class="card-subtitle">Task Status Distribution</h3>
          <div class="status-bars-list">
            <div v-for="col in reportData.statusColumns" :key="col.name" class="status-bar-item">
              <div class="status-bar-header">
                <span class="status-name" :style="{ color: col.color || '#374151' }">
                  ● {{ col.name }}
                </span>
                <span class="status-count">{{ col.count }} tasks ({{ calculatePct(col.count, reportData.kpis.totalIssues) }}%)</span>
              </div>
              <div class="bar-outer">
                <div
                  class="bar-inner"
                  :style="{ width: `${calculatePct(col.count, reportData.kpis.totalIssues)}%`, background: col.color || '#3B82F6' }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Priority Breakdown -->
        <div class="dist-card shadow-sm">
          <h3 class="card-subtitle">Priority Breakdown</h3>
          <div class="priority-list">
            <div v-for="p in reportData.prioritySprint" :key="p.priority" class="priority-row">
              <div class="priority-info">
                <span class="priority-badge" :style="{ background: p.color || '#6B7280' }">{{ p.priority }}</span>
                <span class="priority-numbers">{{ p.done }} / {{ p.total }} Done</span>
              </div>
              <div class="bar-outer">
                <div
                  class="bar-inner"
                  :style="{ width: `${calculatePct(p.done, p.total)}%`, background: p.color || '#6B7280' }"
                ></div>
              </div>
            </div>

            <div v-if="!reportData.prioritySprint?.length" class="text-muted font-sm pad-sm text-center">
              No priority breakdown logs available for this sprint run.
            </div>
          </div>
        </div>

      </div>

      <!-- ── SECTION 4: Team Contribution & AI Feedback Table ── -->
      <div class="section-container shadow-sm margin-top-md">
        <h3 class="card-subtitle margin-bottom-sm">Team Contribution &amp; AI Workload Audit</h3>
        
        <div class="table-card">
          <table class="report-table">
            <thead>
              <tr>
                <th>Engineer Name</th>
                <th>Assigned Tasks</th>
                <th>Completed</th>
                <th>SP Delivered</th>
                <th>Utilization %</th>
                <th>Workload Status</th>
                <th>AI Workload Feedback</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="m in reportData.team" :key="m.name" class="table-row">
                <td class="font-medium text-dark">
                  <div class="engineer-cell">
                    <span class="eng-avatar">{{ m.name?.charAt(0).toUpperCase() }}</span>
                    <span>{{ m.name }}</span>
                  </div>
                </td>
                <td>{{ m.assigned || 0 }}</td>
                <td class="font-medium text-emerald">{{ m.completed || 0 }}</td>
                <td>{{ m.storyPointsDelivered || 0 }} SP</td>
                <td>
                  <span class="util-val">{{ m.utilizationPct || 0 }}%</span>
                </td>
                <td>
                  <span
                    class="status-pill"
                    :class="(m.status || 'Balanced').toLowerCase().includes('overload') ? 'overloaded' : (m.status || '').toLowerCase().includes('under') ? 'underutilized' : 'balanced'"
                  >
                    {{ m.status || 'Balanced' }}
                  </span>
                </td>
                <td class="text-muted font-sm ai-feedback-cell">
                  {{ getMemberFeedback(m.name) || 'Load is well balanced across sprint backlog tasks.' }}
                </td>
              </tr>

              <tr v-if="!reportData.team?.length">
                <td colspan="7" class="text-center text-muted pad-lg">
                  No individual team member logs recorded for this report.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <!-- ── MODAL: Share Report via Email ── -->
    <div v-if="showEmailModal" class="modal-backdrop" @click.self="showEmailModal = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Share Sprint Health Report</h3>
          <button @click="showEmailModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p class="modal-subtitle">Send an executive HTML summary of <strong>{{ reportData?.companyName }}</strong> report to stakeholders.</p>
          
          <div class="form-group">
            <label class="form-label">Recipient Email *</label>
            <input
              type="email"
              v-model="emailForm.to"
              placeholder="e.g. cto@company.com, pm@company.com"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Subject</label>
            <input
              type="text"
              v-model="emailForm.subject"
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Executive Notes / Comments</label>
            <textarea
              v-model="emailForm.notes"
              placeholder="Add key highlights or additional directives for stakeholders..."
              rows="3"
              class="form-textarea"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="action-btn secondary-btn" @click="showEmailModal = false">Cancel</button>
          <button class="action-btn primary-btn" @click="sendEmailReport" :disabled="isSending">
            {{ isSending ? 'Sending Email...' : 'Send Report Email' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const pending = ref(true);
const reportData = ref(null);
const historyList = ref([]);
const companiesList = ref([]);

const selectedPeriod = ref(route.query.period || 'daily');
const selectedProject = ref(route.query.project || 'ALL');
const selectedHistoryId = ref(route.query.reportId || '');

const showEmailModal = ref(false);
const isSending = ref(false);
const emailForm = ref({
  to: '',
  subject: '',
  notes: ''
});

const toast = ref({ show: false, message: '', type: 'success' });
const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => { toast.value.show = false; }, 3500);
};

const projectOptions = computed(() => {
  const opts = [{ label: 'All Projects', value: 'ALL' }];
  companiesList.value.forEach(c => opts.push({ label: c, value: c }));
  return opts;
});

const historyOptions = computed(() => {
  let list = historyList.value || [];
  if (selectedProject.value && selectedProject.value !== 'ALL') {
    const sel = selectedProject.value.toLowerCase();
    list = list.filter(h => h.companyName && h.companyName.toLowerCase() === sel);
  }
  if (!list.length) {
    const fallbackLabel = selectedProject.value !== 'ALL' 
      ? `No Sprints for ${selectedProject.value}` 
      : 'No Sprint Reports Available';
    return [{ label: fallbackLabel, value: '' }];
  }
  return list.map(h => ({
    label: `${h.companyName} (${formatDate(h.generatedAt)}) — ${h.kpis?.healthScore ?? h.healthScore ?? 80}% Health`,
    value: h._id
  }));
});

const onProjectChange = () => {
  selectedHistoryId.value = '';
  fetchReportData();
};

const fetchReportData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/reports/sprint', {
      params: {
        project: selectedProject.value,
        period: selectedPeriod.value,
        reportId: selectedHistoryId.value || undefined
      }
    });

    if (res && res.success) {
      reportData.value = res.report;
      historyList.value = res.history || [];
      companiesList.value = res.companies || [];

      if (res.report && (!selectedHistoryId.value || !historyList.value.some(h => h._id === selectedHistoryId.value))) {
        selectedHistoryId.value = res.report._id;
      }
    }
  } catch (err) {
    console.error('Error fetching sprint report:', err);
    showToast('Failed to load sprint report', 'error');
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  fetchReportData();
});

const setPeriod = (p) => {
  selectedPeriod.value = p;
  selectedHistoryId.value = '';
  fetchReportData();
};

const onHistoryChange = () => {
  fetchReportData();
};

const calculatePct = (count, total) => {
  if (!total || total === 0) return 0;
  return Math.round((count / total) * 100);
};

const getMemberFeedback = (memberName) => {
  if (!reportData.value?.analysis?.teamFeedback) return null;
  const list = reportData.value.analysis.teamFeedback;
  if (Array.isArray(list)) {
    const item = list.find(f => f.member === memberName);
    return item ? item.feedback : null;
  }
  return null;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Active Run';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
};

const triggerPrint = () => {
  window.print();
};

const openEmailModal = () => {
  emailForm.value = {
    to: '',
    subject: `Executive Sprint Report — ${reportData.value?.companyName || 'Project'}`,
    notes: ''
  };
  showEmailModal.value = true;
};

const sendEmailReport = async () => {
  if (!emailForm.value.to) {
    showToast('Please enter recipient email address', 'error');
    return;
  }

  isSending.value = true;
  try {
    const res = await $fetch('/api/reports/email', {
      method: 'POST',
      body: {
        to: emailForm.value.to,
        subject: emailForm.value.subject,
        notes: emailForm.value.notes,
        companyName: reportData.value?.companyName,
        period: selectedPeriod.value,
        healthScore: reportData.value?.kpis?.healthScore,
        completionPct: reportData.value?.kpis?.completionPct,
        velocity: reportData.value?.kpis?.velocity,
        sprintName: reportData.value?.sprint?.name
      }
    });

    if (res && res.success) {
      showToast(res.message || 'Report emailed successfully!', 'success');
      showEmailModal.value = false;
    } else {
      showToast(res?.error || 'Failed to dispatch report email', 'error');
    }
  } catch (err) {
    console.error('Email error:', err);
    showToast('Failed to dispatch email', 'error');
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
.sprint-report-page {
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
}

.page-main-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.period-pills {
  display: flex;
  background: #F3F4F6;
  padding: 3px;
  border-radius: 10px;
}

.pill-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6B7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.pill-btn.active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.filter-group {
  min-width: 160px;
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
}
.icon-btn:hover { background: #F9FAFB; color: #111827; }

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}
.primary-btn { background: #059669; color: #ffffff; }
.primary-btn:hover { background: #047857; }
.secondary-btn { background: #F3F4F6; color: #374151; border: 1px solid #E5E7EB; }
.secondary-btn:hover { background: #E5E7EB; }

/* ── Printable Header Banner ── */
.print-header-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #065F46;
  color: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
}
.banner-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.2rem 0;
}
.banner-sub {
  font-size: 0.85rem;
  margin: 0;
  color: #A7F3D0;
}
.score-pill {
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  font-weight: 700;
  font-size: 0.9rem;
}
.score-pill.optimal { background: #10B981; color: #ffffff; }
.score-pill.good    { background: #3B82F6; color: #ffffff; }
.score-pill.risk    { background: #EF4444; color: #ffffff; }

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
.metric-icon-wrap.red     { background: #FEF2F2; color: #EF4444; }

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
  gap: 0.5rem;
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
.metric-badge.danger   { background: #FEF2F2; color: #EF4444; }

.metric-subtext {
  font-size: 0.75rem;
  color: #9CA3AF;
}

/* ── AI Executive Card ── */
.ai-executive-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
  border-left: 4px solid #059669;
}

.ai-card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}

.sparkle-icon {
  color: #059669;
}

.ai-card-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #111827;
}

.executive-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #374151;
  background: #F9FAFB;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: 1px solid #F3F4F6;
  margin-bottom: 1.25rem;
}

.ai-bullets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.bullet-box {
  border-radius: 10px;
  padding: 1rem;
  border: 1px solid #E5E7EB;
}
.bullet-box.success { background: #F0FDF4; border-color: #BBF7D0; }
.bullet-box.danger  { background: #FEF2F2; border-color: #FECACA; }
.bullet-box.info    { background: #EFF6FF; border-color: #BFDBFE; }

.bullet-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
}
.bullet-box.success .bullet-title { color: #166534; }
.bullet-box.danger .bullet-title  { color: #991B1B; }
.bullet-box.info .bullet-title    { color: #1E40AF; }

.bullet-box ul {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #374151;
}

/* ── Distribution Grid ── */
.distribution-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.dist-card {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
}

.card-subtitle {
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 1rem 0;
}

.status-bars-list, .priority-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.status-bar-header, .priority-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.825rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.bar-outer {
  height: 8px;
  background: #E5E7EB;
  border-radius: 4px;
  overflow: hidden;
}

.bar-inner {
  height: 100%;
  border-radius: 4px;
}

.priority-badge {
  color: #ffffff;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

/* ── Team Table ── */
.section-container {
  background: #ffffff;
  border-radius: 14px;
  border: 1px solid #E5E7EB;
  padding: 1.5rem;
}

.table-card { overflow-x: auto; }
.report-table { width: 100%; border-collapse: collapse; text-align: left; }
.report-table th {
  padding: 0.75rem 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6B7280;
  text-transform: uppercase;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
}
.report-table td {
  padding: 0.85rem 1rem;
  font-size: 0.85rem;
  border-bottom: 1px solid #F3F4F6;
  vertical-align: middle;
}

.engineer-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.eng-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #ECFDF5;
  color: #059669;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.status-pill {
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
}
.status-pill.balanced     { background: #ECFDF5; color: #059669; }
.status-pill.overloaded   { background: #FEF2F2; color: #EF4444; }
.status-pill.underutilized{ background: #FEF3C7; color: #D97706; }

.ai-feedback-cell {
  max-width: 280px;
  line-height: 1.4;
}

/* ── Modal ── */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: #ffffff;
  border-radius: 14px;
  width: 90%;
  max-width: 500px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.modal-header h3 { margin: 0; font-size: 1.15rem; font-weight: 700; }
.btn-close { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; color: #6B7280; }

.modal-subtitle { font-size: 0.875rem; color: #6B7280; margin: 0 0 1rem 0; }
.form-group { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
.form-label { font-size: 0.8rem; font-weight: 700; color: #374151; }
.form-input, .form-textarea {
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  font-size: 0.875rem;
  font-family: inherit;
}
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1rem; }

/* ── Toast ── */
.toast-notification {
  position: fixed;
  bottom: 2rem; right: 2rem;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.875rem; font-weight: 600;
  color: #ffffff; z-index: 1100;
  display: flex; align-items: center; gap: 0.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
.toast-notification.success { background: #059669; }
.toast-notification.error   { background: #DC2626; }

/* ── Helpers ── */
.text-muted { color: #6B7280; }
.font-medium { font-weight: 600; }
.font-sm { font-size: 0.8rem; }
.text-dark { color: #111827; }
.text-emerald { color: #059669; }
.text-center { text-align: center; }
.margin-top-md { margin-top: 1rem; }
.margin-bottom-sm { margin-bottom: 0.75rem; }
.pad-lg { padding: 2rem !important; }

/* ── Print Media Query ── */
@media print {
  .no-print { display: none !important; }
  .sprint-report-page { gap: 1rem; }
  .va-topbar { display: none !important; }
  .ai-executive-card, .metric-card, .dist-card, .section-container {
    box-shadow: none !important;
    border: 1px solid #ccc !important;
    break-inside: avoid;
  }
}
</style>
