<template>
  <div class="risk-detail-analytics-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="nav-back-wrap">
          <NuxtLink to="/risks" class="back-link-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Risk Monitor
          </NuxtLink>
        </div>
        <div class="title-with-badge">
          <h1 class="page-main-title">{{ riskDetail?.id || riskId }}</h1>
          <span v-if="riskDetail" class="sev-pill" :class="riskDetail.severity.toLowerCase()">
            {{ riskDetail.severity }} Severity
          </span>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
            </svg>
            AI POWERED
          </span>
        </div>
        <p class="page-main-subtitle">
          <span v-if="riskDetail">{{ riskDetail.title }}</span>
          <span v-if="riskDetail"> · {{ riskDetail.project }}</span>
        </p>
      </div>

      <div class="topbar-right">
        <!-- Date Badge -->
        <div class="gen-date-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Active Sprint SLA
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchRiskDetail" :disabled="pending" title="Refresh Risk Details">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <!-- Mark as Mitigated Button -->
        <button class="action-btn secondary-btn" @click="markAsMitigated">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Mark as Mitigated
        </button>

        <!-- Export Risk Report Button -->
        <button class="action-btn primary-btn" @click="openExportModal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Risk PDF
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

    <!-- Loading State -->
    <div v-if="pending" class="simple-loading-spinner"><div class="spinner"></div></div>

    <!-- Empty State -->
    <div v-else-if="!riskDetail && !pending" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2>Risk Record Not Found</h2>
      <p>No risk record found matching ID <strong>{{ riskId }}</strong>.</p>
      <NuxtLink to="/risks" class="action-btn primary-btn" style="text-decoration:none;display:inline-flex;margin-top:1rem;">← Return to Risk Monitor</NuxtLink>
    </div>

    <!-- MAIN RISK DETAIL VIEW -->
    <template v-else-if="riskDetail">

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 0 — Hero Risk Summary Banner         -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="hero-profile-banner">
          <div class="hp-left">
            <div class="hp-avatar-wrap" :class="riskDetail.severity.toLowerCase()">
              <div class="hp-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
            </div>

            <div class="hp-details">
              <div class="hp-title-row">
                <h2 class="hp-name">{{ riskDetail.title }}</h2>
                <span class="status-pill" :class="riskDetail.status === 'Active' ? 'status-at-risk' : 'status-balanced'">
                  {{ riskDetail.status }}
                </span>
              </div>
              <p class="hp-role">Target Project: <strong class="co-name">{{ riskDetail.project }}</strong> • Category: <strong>{{ riskDetail.category }}</strong></p>
              <div class="hp-meta-tags">
                <span class="m-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> Affected: {{ riskDetail.affected }}</span>
                <span class="m-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> SLA Target: {{ riskDetail.slaTarget }}</span>
              </div>
            </div>
          </div>

          <div class="hp-right">
            <div class="xp-score-ring" :class="riskDetail.severity.toLowerCase()">
              <div class="score-num">{{ riskDetail.riskScore }}</div>
              <div class="score-lbl">RISK INDEX</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Executive Risk Metrics (8 KPIs)   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Risk Impact &amp; Severity Metrics</h2>
            <span class="sec-subtitle">Granular SLA metrics, business velocity drag &amp; resolution priority</span>
          </div>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="(kpi, key) in riskDetail.kpis" :key="key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="key === 'severity'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <svg v-else-if="key === 'project'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                  <svg v-else-if="key === 'affectedComponent'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <svg v-else-if="key === 'slaTarget'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else-if="key === 'businessImpact'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <svg v-else-if="key === 'estimatedDelay'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <svg v-else-if="key === 'priorityIndex'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <span class="kpi-name">{{ kpi.name }}</span>
              </div>
            </div>

            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="trend-badge" :class="kpi.trendDir === 'up' ? 'positive' : 'negative'">
                <svg v-if="kpi.trendDir === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                {{ kpi.trend }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 2 — Historical Velocity Drag Chart    -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Sprint-over-Sprint Velocity Impact Curve</h3>
              <p class="card-desc">Story points delivered vs velocity drag introduced by this risk item</p>
            </div>
          </div>

          <div class="line-chart-area" @mousemove="handleTrendHover" @mouseleave="hoveredIdx = null">
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="trend-svg">
              <defs>
                <linearGradient id="riskImpactGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#EF4444" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#EF4444" stop-opacity="0.00"/>
                </linearGradient>
              </defs>

              <g class="grid-y">
                <line v-for="tick in yGridTicks" :key="'gt-'+tick.val" :x1="margin.left" :y1="tick.y" :x2="chartWidth - margin.right" :y2="tick.y" stroke="#E5E7EB" stroke-dasharray="4,4"/>
                <text v-for="tick in yGridTicks" :key="'lbl-'+tick.val" :x="margin.left - 10" :y="tick.y + 4" text-anchor="end" fill="#9CA3AF" font-size="10" font-weight="600">{{ tick.val }}</text>
              </g>

              <path v-if="trendPath" :d="trendAreaPath" fill="url(#riskImpactGrad)"/>
              <path v-if="trendPath" :d="trendPath" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>

              <circle v-for="(pt, idx) in chartPoints" :key="'pt-'+idx" :cx="pt.x" :cy="pt.y" r="5" fill="#EF4444" stroke="#ffffff" stroke-width="2"/>

              <g class="grid-x">
                <text v-for="(pt, idx) in chartPoints" :key="'xt-'+idx" :x="pt.x" :y="chartHeight - 45" text-anchor="end" fill="#4B5563" font-size="10" font-weight="600" :transform="`rotate(-30, ${pt.x}, ${chartHeight - 45})`">
                  {{ formatAxisLabel(pt.sprint) }}
                </text>
              </g>
            </svg>

            <div v-if="hoveredIdx !== null && chartPoints[hoveredIdx]" class="chart-tooltip-popup" :style="tooltipStyle">
              <div class="tooltip-header">{{ chartPoints[hoveredIdx].sprint }}</div>
              <div class="tooltip-row red"><span class="dot"></span> Velocity Drag: <strong>{{ chartPoints[hoveredIdx].drag }} SP</strong></div>
              <div class="tooltip-row emerald"><span class="dot"></span> Delivered SP: <strong>{{ chartPoints[hoveredIdx].delivered }} SP</strong></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 — AI Mitigation & Playbook          -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="ai-insights-card">
          <div class="ai-card-header">
            <div class="ai-badge-group">
              <div class="ai-spark-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h3 class="ai-card-title">AI Root Cause Analysis &amp; Mitigation Playbook</h3>
            </div>
            <span class="ai-tag-sm">ACTION RECOMMENDED</span>
          </div>

          <div class="ai-headline-box">
            <h4>Root Cause Diagnosis: {{ riskDetail.impact }}</h4>
          </div>

          <div class="ai-insights-grid">
            <div class="ai-col">
              <h5>Contributing Risk Factors</h5>
              <ul>
                <li v-for="(item, idx) in riskDetail.riskFactors" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="ai-col">
              <h5>Step-by-Step Remediation Action Plan</h5>
              <ul>
                <li v-for="(item, idx) in riskDetail.remediationSteps" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 4 — Linked Jira Tickets & Audit Table  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="va-table-container">
          <div class="table-header-row">
            <div>
              <h3 class="table-title">Linked Escalations &amp; Work Items</h3>
              <p class="table-desc">Active tickets and dependency items associated with {{ riskDetail.id }}</p>
            </div>
          </div>

          <div class="table-responsive">
            <table class="va-data-table">
              <thead>
                <tr>
                  <th>Ticket Key</th>
                  <th>Summary</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Story Points</th>
                  <th>Status</th>
                  <th style="text-align:left">SLA Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="t in riskDetail.linkedTickets" :key="t.key">
                  <td class="font-mono font-bold">{{ t.key }}</td>
                  <td class="font-semibold text-gray-900">{{ t.summary }}</td>
                  <td class="text-gray-600">{{ t.assignee }}</td>
                  <td>
                    <span class="sev-badge" :class="t.priority.toLowerCase()">{{ t.priority }}</span>
                  </td>
                  <td class="font-bold">{{ t.sp }} SP</td>
                  <td>
                    <span class="status-pill" :class="t.status === 'In Progress' || t.status === 'Blocked' ? 'status-at-risk' : 'status-balanced'">
                      {{ t.status }}
                    </span>
                  </td>
                  <td style="text-align:left">
                    <span class="sla-badge" :class="t.sla.includes('Overdue') ? 'overdue' : 'normal'">
                      {{ t.sla }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </template>

    <!-- Export Modal -->
    <AppModal
      v-if="showExportModal"
      :is-open="showExportModal"
      title="Export Executive Risk Detail PDF"
      @close="showExportModal = false"
    >
      <div class="export-modal-body">
        <p class="export-desc">Generate a PDF executive briefing report for risk item {{ riskId }}.</p>
        <div class="modal-actions-row">
          <button class="action-btn secondary-btn" @click="showExportModal = false">Cancel</button>
          <button class="action-btn primary-btn" :disabled="isExporting" @click="handleExportReport">
            {{ isExporting ? 'Generating PDF...' : 'Download PDF' }}
          </button>
        </div>
      </div>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const riskId = route.params.id || 'RSK-101';

const pending = ref(true);
const riskDetail = ref(null);
const showExportModal = ref(false);
const isExporting = ref(false);
const toast = ref({ show: false, message: '', type: 'success' });

// Chart dimensions
const chartWidth = 750;
const chartHeight = 290;
const margin = { top: 20, right: 30, bottom: 95, left: 45 };

const hoveredIdx = ref(null);

const formatAxisLabel = (str) => {
  if (!str) return '';
  let s = String(str);
  if (s.length > 14) s = s.replace(/Sprint\s+/i, 'S');
  if (s.length > 16) s = s.slice(0, 14) + '…';
  return s;
};

const yGridTicks = computed(() => [
  { val: 100, y: margin.top },
  { val: 75,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.25 },
  { val: 50,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.5 },
  { val: 25,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.75 },
  { val: 0,   y: chartHeight - margin.bottom }
]);

const chartPoints = computed(() => {
  const list = riskDetail.value?.historicalTrends || [];
  if (!list.length) return [];
  const maxVal = 100;
  const availWidth = chartWidth - margin.left - margin.right;
  const step = list.length > 1 ? availWidth / (list.length - 1) : availWidth / 2;

  return list.map((pt, i) => {
    const x = margin.left + i * step;
    const y = chartHeight - margin.bottom - (Math.min(pt.dragScore, maxVal) / maxVal) * (chartHeight - margin.top - margin.bottom);
    return { ...pt, x, y };
  });
});

const trendPath = computed(() => {
  const pts = chartPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
});

const trendAreaPath = computed(() => {
  const pts = chartPoints.value;
  if (!pts.length) return '';
  const line = pts.map(p => `${p.x},${p.y}`).join(' L ');
  const lastX = pts[pts.length - 1].x;
  const firstX = pts[0].x;
  const bottomY = chartHeight - margin.bottom;
  return `M ${firstX},${bottomY} L ${line} L ${lastX},${bottomY} Z`;
});

const handleTrendHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = chartPoints.value;
  if (!pts.length) return;
  let closestIdx = 0;
  let minDiff = Infinity;
  pts.forEach((p, idx) => {
    const diff = Math.abs(p.x - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  hoveredIdx.value = closestIdx;
};

const tooltipStyle = computed(() => {
  if (hoveredIdx.value === null || !chartPoints.value[hoveredIdx.value]) return {};
  const pt = chartPoints.value[hoveredIdx.value];
  const isRightHalf = pt.x > chartWidth / 2;
  return {
    left: `${pt.x + (isRightHalf ? -170 : 15)}px`,
    top: `${pt.y - 15}px`
  };
});

const fetchRiskDetail = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/risks', {
      query: { project: 'ALL', severity: 'ALL', period: 'daily' }
    });

    if (res && res.success) {
      const match = (res.riskItems || []).find(r => r.id.toLowerCase() === riskId.toLowerCase()) || res.riskItems?.[0];
      const proj = match?.project || 'FLEXA ERP';
      const sev = match?.severity || 'High';

      riskDetail.value = {
        id: match?.id || riskId,
        title: match?.title || 'High-priority delivery blocker halting release candidate',
        project: proj,
        category: match?.category || 'Technical Blocker',
        severity: sev,
        status: match?.status || 'Active',
        affected: match?.affected || 'Muhammad Bilal',
        impact: match?.impact || 'Core database connection latency spiking release cycle by 18%',
        action: match?.action || 'Re-assign blocked tickets and initiate daily escalation sync',
        slaTarget: '24 Hours',
        riskScore: sev === 'Critical' ? 88 : sev === 'High' ? 68 : 45,
        kpis: {
          severity: { name: 'Severity Rank', value: `${sev} Level`, trend: 'Action Req', trendDir: 'down', variant: sev === 'Critical' ? 'rose' : 'amber' },
          project: { name: 'Target Project', value: proj, trend: 'Active Sprint', trendDir: 'up', variant: 'blue' },
          affectedComponent: { name: 'Affected Engineer', value: match?.affected || 'Dev Team', trend: 'Capacity Load', trendDir: 'down', variant: 'purple' },
          slaTarget: { name: 'SLA Resolution Target', value: '24 Hours', trend: 'In Progress', trendDir: 'up', variant: 'cyan' },
          businessImpact: { name: 'Velocity Drag', value: '-18% SP', trend: 'High Drag', trendDir: 'down', variant: 'rose' },
          estimatedDelay: { name: 'Est. Delivery Delay', value: '2.5 Days', trend: 'Scope Drag', trendDir: 'down', variant: 'amber' },
          priorityIndex: { name: 'Escalation Priority', value: 'Level 1 P1', trend: 'Highest', trendDir: 'down', variant: 'indigo' },
          resolutionStatus: { name: 'Mitigation Status', value: match?.status || 'Active', trend: 'Monitoring', trendDir: 'up', variant: 'emerald' }
        },
        historicalTrends: [
          { sprint: 'S1', dragScore: 20, drag: 4, delivered: 42 },
          { sprint: 'S2', dragScore: 35, drag: 7, delivered: 38 },
          { sprint: 'S3', dragScore: 50, drag: 12, delivered: 31 },
          { sprint: 'S4', dragScore: 68, drag: 16, delivered: 28 },
          { sprint: 'S5', dragScore: 82, drag: 22, delivered: 24 }
        ],
        riskFactors: [
          'Unresolved upstream API dependency blocking frontend integration',
          'Database query execution time exceeded 4500ms timeout threshold',
          'Resource capacity loaded at 115% without secondary backup assignment'
        ],
        remediationSteps: [
          'Execute database index optimization script on production staging pool',
          'Temporarily re-route non-critical workloads to secondary read replica',
          'Conduct immediate architectural review with backend squad leads'
        ],
        linkedTickets: [
          { key: 'FLX-1082', summary: 'API latency bottleneck on tenant auth query', assignee: 'Muhammad Bilal', priority: 'High', sp: 5, status: 'Blocked', sla: '2 Hours Overdue' },
          { key: 'FLX-1094', summary: 'Database connection pool max cap reached', assignee: 'Faisal Syslab', priority: 'Critical', sp: 8, status: 'In Progress', sla: 'SLA Active' },
          { key: 'FLX-1102', summary: 'Frontend state machine deadlock on timeout', assignee: 'Ihtesham Mansoor', priority: 'Medium', sp: 3, status: 'Done', sla: 'Resolved' }
        ]
      };
    }
  } catch (err) {
    console.error('Error fetching risk details:', err);
    showToast('Failed to load risk details', 'error');
  } finally {
    pending.value = false;
  }
};

const markAsMitigated = () => {
  if (riskDetail.value) {
    riskDetail.value.status = 'Resolved';
    if (riskDetail.value.kpis?.resolutionStatus) {
      riskDetail.value.kpis.resolutionStatus.value = 'Resolved';
    }
  }
  showToast(`Risk ${riskId} marked as mitigated!`, 'success');
};

const openExportModal = () => {
  showExportModal.value = true;
};

const handleExportReport = () => {
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
    showExportModal.value = false;
    showToast(`Risk ${riskId} report exported as PDF successfully!`, 'success');
  }, 1200);
};

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

onMounted(() => {
  fetchRiskDetail();
});
</script>

<style scoped>
/* ── Page Layout ── */
.risk-detail-analytics-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

/* ── Standardized Floating Topbar ── */
.va-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  background: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.topbar-left { display: flex; flex-direction: column; gap: 0.35rem; }
.nav-back-wrap { margin-bottom: 0.2rem; }

.back-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #059669;
  text-decoration: none;
  transition: color 0.15s ease;
}
.back-link-btn:hover { color: #047857; text-decoration: underline; }

.title-with-badge { display: flex; align-items: center; gap: 0.75rem; }
.page-main-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; letter-spacing: -0.02em; }

.sev-pill { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; }
.sev-pill.critical { background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; }
.sev-pill.high { background: #FFF7ED; color: #EA580C; border: 1px solid #FFEDD5; }
.sev-pill.medium { background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
.sev-pill.low { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }

.ai-live-tag {
  display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.6rem;
  background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0;
  font-size: 0.72rem; font-weight: 700; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;
}

.page-main-subtitle { font-size: 0.85rem; color: #6B7280; margin: 0; }
.topbar-right { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.gen-date-badge {
  display: flex; align-items: center; gap: 0.35rem; font-size: 0.75rem; font-weight: 600;
  color: #6B7280; background: #F9FAFB; border: 1px solid #E5E7EB; padding: 0.45rem 0.75rem; border-radius: 8px;
}

.icon-btn {
  display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;
  background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; color: #4B5563; transition: all 0.15s ease;
}
.icon-btn:hover { background: #F9FAFB; color: #059669; }

.action-btn {
  display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.9rem; border-radius: 8px;
  font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s ease; border: 1px solid #E5E7EB; background: #ffffff; color: #374151;
}
.action-btn.primary-btn { background: #059669; color: #ffffff; border-color: #059669; box-shadow: 0 2px 4px rgba(5, 150, 105, 0.2); }
.action-btn.primary-btn:hover { background: #047857; }
.action-btn.secondary-btn:hover { background: #F3F4F6; }

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Toast */
.toast-notification {
  position: fixed; top: 1.5rem; right: 1.5rem; z-index: 9999; display: flex; align-items: center; gap: 0.5rem;
  padding: 0.75rem 1.25rem; border-radius: 8px; font-size: 0.85rem; font-weight: 600; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); color: #ffffff;
}
.toast-notification.success { background: #059669; }
.toast-notification.error { background: #EF4444; }

.section-container { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; flex-direction: column; gap: 0.2rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.sec-subtitle { font-size: 0.8rem; color: #6B7280; }

/* ── Hero Risk Summary Banner ── */
.hero-profile-banner {
  background: #ffffff; border-radius: 14px; padding: 1.5rem; border: none;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1.5rem;
}

.hp-left { display: flex; align-items: center; gap: 1.25rem; }
.hp-avatar-wrap {
  width: 72px; height: 72px; border-radius: 50%; padding: 3px; flex-shrink: 0;
}
.hp-avatar-wrap.critical { background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%); }
.hp-avatar-wrap.high { background: linear-gradient(135deg, #EA580C 0%, #C2410C 100%); }
.hp-avatar-wrap.medium { background: linear-gradient(135deg, #D97706 0%, #B45309 100%); }
.hp-avatar-wrap.low { background: linear-gradient(135deg, #059669 0%, #047857 100%); }

.hp-avatar {
  width: 100%; height: 100%; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #EF4444;
}
.hp-details { display: flex; flex-direction: column; gap: 0.25rem; }
.hp-title-row { display: flex; align-items: center; gap: 0.75rem; }
.hp-name { font-size: 1.35rem; font-weight: 800; color: #111827; margin: 0; }
.hp-role { font-size: 0.88rem; color: #4B5563; margin: 0; }
.co-name { color: #111827; }
.hp-meta-tags { display: flex; gap: 0.75rem; font-size: 0.78rem; color: #6B7280; margin-top: 0.2rem; }
.m-tag { display: flex; align-items: center; gap: 0.3rem; }

.hp-right { display: flex; align-items: center; }
.xp-score-ring {
  display: flex; flex-direction: column; align-items: center; justify-content: center; width: 90px; height: 90px;
  border-radius: 50%;
}
.xp-score-ring.critical { background: linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%); border: 2px solid #FCA5A5; color: #EF4444; }
.xp-score-ring.high { background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%); border: 2px solid #FDBA74; color: #EA580C; }
.xp-score-ring.medium { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border: 2px solid #FCD34D; color: #D97706; }
.xp-score-ring.low { background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%); border: 2px solid #A7F3D0; color: #059669; }

.score-num { font-size: 1.7rem; font-weight: 800; line-height: 1; }
.score-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em; margin-top: 2px; }

/* ── Executive 8 KPI Cards Grid (4 per row) ── */
.exec-kpi-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
}
@media (max-width: 1200px) { .exec-kpi-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .exec-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 580px) { .exec-kpi-grid { grid-template-columns: 1fr; } }

.kpi-card-premium {
  background: #ffffff; border: none; outline: none; border-radius: 12px; padding: 1.15rem;
  display: flex; flex-direction: column; gap: 0.75rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card-premium:hover { transform: translateY(-2px); box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px 0px; }

.kpi-header-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; white-space: nowrap; min-width: 0; }
.kpi-title-with-icon { display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.kpi-icon-badge { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; }
.kpi-icon-badge.rose { background: #FEF2F2; color: #EF4444; }
.kpi-icon-badge.amber { background: #FEF3C7; color: #D97706; }
.kpi-icon-badge.purple { background: #F3E8FF; color: #7C3AED; }
.kpi-icon-badge.indigo { background: #EEF2FF; color: #4F46E5; }
.kpi-icon-badge.cyan { background: #ECFEFF; color: #0891B2; }
.kpi-icon-badge.emerald { background: #ECFDF5; color: #059669; }
.kpi-icon-badge.blue { background: #EFF6FF; color: #2563EB; }

.kpi-name { font-size: 0.8rem; font-weight: 600; color: #4B5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpi-value-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; white-space: nowrap; min-width: 0; }
.kpi-value { font-size: 1.35rem; font-weight: 700; color: #111827; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }

.trend-badge { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
.trend-badge.positive { background: #ECFDF5; color: #059669; }
.trend-badge.negative { background: #FEF2F2; color: #EF4444; }

/* ── Card Analytics & Chart ── */
.card-analytics {
  background: #ffffff; border: none; outline: none; border-radius: 14px; padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1.25rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  height: auto !important; min-height: auto !important; overflow: visible;
}
.card-analytics-header { margin-bottom: 0.5rem; }
.card-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem 0; }
.card-desc { font-size: 0.8rem; color: #6B7280; margin: 0; }

.line-chart-area { position: relative; width: 100%; height: auto; overflow: visible; }
.trend-svg { width: 100%; height: 290px; display: block; overflow: visible; }

.chart-tooltip-popup {
  position: absolute; transform: translate(-50%, -100%); background: #0F172A; color: #ffffff;
  padding: 0.6rem 0.85rem; border-radius: 8px; font-size: 0.75rem; pointer-events: none; box-shadow: 0 4px 12px rgba(0,0,0,0.25); z-index: 10;
}
.tooltip-header { font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 0.25rem; margin-bottom: 0.35rem; color: #94A3B8; }
.tooltip-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; }
.tooltip-row.red .dot { width: 6px; height: 6px; border-radius: 50%; background: #EF4444; }
.tooltip-row.emerald .dot { width: 6px; height: 6px; border-radius: 50%; background: #059669; }

/* ── Section 3: AI Mitigation Card ── */
.ai-insights-card {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); border-radius: 14px; padding: 1.5rem;
  color: #F8FAFC; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; border: none;
}
.ai-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; }
.ai-badge-group { display: flex; align-items: center; gap: 0.6rem; }
.ai-spark-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(5, 150, 105, 0.2); border-radius: 8px; color: #10B981; }
.ai-card-title { font-size: 1.1rem; font-weight: 700; color: #ffffff; margin: 0; }
.ai-tag-sm { font-size: 0.7rem; font-weight: 700; color: #ffffff; letter-spacing: 0.05em; background: #059669; padding: 0.2rem 0.6rem; border-radius: 20px; }

.ai-headline-box { background: rgba(255, 255, 255, 0.06); padding: 0.85rem 1.15rem; border-radius: 10px; margin-bottom: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.12); }
.ai-headline-box h4 { font-size: 0.95rem; font-weight: 600; color: #F8FAFC; margin: 0; line-height: 1.5; }

.ai-insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 768px) { .ai-insights-grid { grid-template-columns: 1fr; } }
.ai-col h5 { font-size: 0.85rem; font-weight: 700; color: #94A3B8; margin: 0 0 0.6rem 0; text-transform: uppercase; letter-spacing: 0.05em; }
.ai-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.ai-col li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.82rem; color: #E2E8F0; line-height: 1.5; }

/* ── Section 4: Data Table ── */
.va-table-container {
  background: #ffffff; border-radius: 14px; padding: 1.5rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}
.table-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
.table-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.table-desc { font-size: 0.8rem; color: #6B7280; margin: 0; }

.table-responsive { overflow-x: auto; }
.va-data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; }
.va-data-table th { padding: 0.75rem 1rem; font-weight: 700; color: #4B5563; border-bottom: 2px solid #E5E7EB; background: #F9FAFB; }
.va-data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }

.sev-badge { display: inline-block; padding: 0.15rem 0.5rem; font-weight: 700; border-radius: 6px; font-size: 0.72rem; }
.sev-badge.critical { background: #FEF2F2; color: #EF4444; }
.sev-badge.high { background: #FFF7ED; color: #EA580C; }
.sev-badge.medium { background: #FEF3C7; color: #D97706; }
.sev-badge.low { background: #ECFDF5; color: #059669; }

.status-pill { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
.status-balanced { background: #ECFDF5; color: #059669; }
.status-at-risk { background: #FEE2E2; color: #EF4444; }

.sla-badge { display: inline-block; padding: 0.15rem 0.5rem; font-weight: 700; border-radius: 6px; font-size: 0.72rem; }
.sla-badge.overdue { background: #FEF2F2; color: #EF4444; }
.sla-badge.normal { background: #ECFDF5; color: #059669; }

/* Modals */
.export-modal-body { display: flex; flex-direction: column; gap: 1rem; }
.export-desc { font-size: 0.85rem; color: #4B5563; margin: 0; }
.modal-actions-row { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
</style>
