<template>
  <div class="member-profile-analytics-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="nav-back-wrap">
          <NuxtLink to="/team/leaderboard" class="back-link-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Leaderboard
          </NuxtLink>
        </div>
        <div class="title-with-badge">
          <h1 class="page-main-title">{{ member?.name || memberId }}</h1>
          <span v-if="member" class="tier-pill" :class="getTierClass(member.tier)">
            {{ member.tier }}
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
          <span v-if="member">{{ member.role }} • {{ member.companyName }}</span>
          <span v-if="member"> · {{ member.email }}</span>
        </p>
      </div>

      <div class="topbar-right">
        <!-- Report Period Pills -->
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

        <!-- History Range Selector -->
        <div class="range-pills">
          <button
            v-for="r in [5, 10, 20]"
            :key="r"
            class="range-btn"
            :class="{ active: selectedRange === r }"
            @click="setRange(r)"
          >
            Last {{ r }}
          </button>
        </div>

        <!-- Date Badge -->
        <div class="gen-date-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Active Sprint
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchMemberData" :disabled="pending" title="Refresh Profile">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <!-- Export Profile Report Button -->
        <button class="action-btn primary-btn" @click="openReportModal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Profile PDF
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
    <div v-else-if="!member && !pending" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h2>Engineer Profile Not Found</h2>
      <p>No performance record found for <strong>{{ memberId }}</strong>.</p>
      <NuxtLink to="/team/leaderboard" class="action-btn primary-btn" style="text-decoration:none;display:inline-flex;margin-top:1rem;">← Return to Leaderboard</NuxtLink>
    </div>

    <!-- ── MAIN CONTENT VIEW ── -->
    <template v-else-if="member">

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 0 — Engineer Profile Hero Banner      -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="hero-profile-banner">
          <div class="hp-left">
            <div class="hp-avatar-wrap">
              <div class="hp-avatar">{{ getInitials(member.name) }}</div>
            </div>

            <div class="hp-details">
              <div class="hp-title-row">
                <h2 class="hp-name">{{ member.name }}</h2>
                <span class="status-pill" :class="getStatusClass(member.status)">{{ member.status }}</span>
              </div>
              <p class="hp-role">{{ member.role }} • <strong class="co-name">{{ member.companyName }}</strong></p>
              <div class="hp-meta-tags">
                <span class="m-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> {{ member.sprintName }}</span>
                <span class="m-tag"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> {{ member.email }}</span>
              </div>
            </div>
          </div>

          <div class="hp-right">
            <div class="xp-score-ring">
              <div class="score-num">{{ member.sprintlyticsScore }}</div>
              <div class="score-lbl">XP SCORE</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Executive Overview (8 KPI Cards)  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Member Performance Indicators</h2>
            <span class="sec-subtitle">Key engineering output, completion accuracy &amp; bandwidth metrics</span>
          </div>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="(kpi, key) in member.executiveKpis" :key="key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="key === 'spDelivered'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <svg v-else-if="key === 'completionRate'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  <svg v-else-if="key === 'tasksFinished'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <svg v-else-if="key === 'bandwidthUtilization'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else-if="key === 'qualityIndex'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  <svg v-else-if="key === 'sprintlyticsScore'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg v-else-if="key === 'teamStanding'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
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
      <!-- SECTION 2 — Sprint-over-Sprint Trend Chart     -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Sprint-over-Sprint Velocity &amp; Capacity Trend</h3>
              <p class="card-desc">Historical story points delivered vs capacity utilization % across recent sprints</p>
            </div>
          </div>

          <!-- Interactive SVG Line & Area Chart -->
          <div class="line-chart-area" @mousemove="handleTrendHover" @mouseleave="hoveredIdx = null">
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="trend-svg">
              <defs>
                <linearGradient id="spGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563EB" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#2563EB" stop-opacity="0.00"/>
                </linearGradient>
              </defs>

              <!-- Grid Y Lines -->
              <g class="grid-y">
                <g v-for="tick in yGridTicks" :key="'yt-'+tick.val">
                  <line :x1="margin.left" :y1="tick.y" :x2="chartWidth - margin.right" :y2="tick.y" stroke="#E5E7EB" stroke-dasharray="4,4"/>
                  <text :x="margin.left - 10" :y="tick.y + 4" text-anchor="end" fill="#9CA3AF" font-size="11" font-weight="600">{{ tick.val }}</text>
                </g>
              </g>

              <!-- Area under SP path -->
              <path :d="spAreaPath" fill="url(#spGrad)" />

              <!-- Line SP path (Blue) -->
              <path :d="spLinePath" fill="none" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/>

              <!-- Line Utilization path (Emerald) -->
              <path :d="utilLinePath" fill="none" stroke="#10B981" stroke-width="2.5" stroke-dasharray="5,4" stroke-linecap="round"/>

              <!-- Hover Vertical Line & Points -->
              <g v-if="hoveredIdx !== null && trendPoints[hoveredIdx]">
                <line
                  :x1="trendPoints[hoveredIdx].x"
                  :y1="margin.top"
                  :x2="trendPoints[hoveredIdx].x"
                  :y2="chartHeight - margin.bottom"
                  stroke="#64748B"
                  stroke-width="1.5"
                  stroke-dasharray="4,4"
                />
                <circle :cx="trendPoints[hoveredIdx].x" :cy="trendPoints[hoveredIdx].spY" r="5" fill="#2563EB" stroke="#ffffff" stroke-width="2"/>
                <circle :cx="trendPoints[hoveredIdx].x" :cy="trendPoints[hoveredIdx].utilY" r="5" fill="#10B981" stroke="#ffffff" stroke-width="2"/>
              </g>

              <!-- X-Axis Sprint Labels -->
              <g class="grid-x">
                <text
                  v-for="(pt, idx) in trendPoints"
                  :key="'xt-'+idx"
                  :x="pt.x"
                  :y="chartHeight - 10"
                  text-anchor="middle"
                  fill="#6B7280"
                  font-size="11"
                  font-weight="600"
                >
                  {{ pt.sprint }}
                </text>
              </g>
            </svg>

            <!-- Floating Hover Tooltip Popup -->
            <div v-if="hoveredIdx !== null && trendPoints[hoveredIdx]" class="chart-tooltip-popup" :style="tooltipStyle">
              <div class="tooltip-header">{{ trendPoints[hoveredIdx].sprint }}</div>
              <div class="tooltip-row blue">
                <span class="dot"></span>
                <span>Story Points: <strong>{{ trendPoints[hoveredIdx].spDelivered }} SP</strong></span>
              </div>
              <div class="tooltip-row emerald">
                <span class="dot"></span>
                <span>Utilization: <strong>{{ trendPoints[hoveredIdx].utilizationPct }}%</strong></span>
              </div>
              <div class="tooltip-row purple">
                <span class="dot"></span>
                <span>Completion: <strong>{{ trendPoints[hoveredIdx].completionPct }}%</strong></span>
              </div>
            </div>
          </div>

          <!-- Bottom Chart Legend -->
          <div class="chart-legend-row">
            <div class="leg-item"><span class="leg-color-dot blue"></span><span>Story Points Delivered</span></div>
            <div class="leg-item"><span class="leg-color-dot emerald-dashed"></span><span>Capacity Utilization %</span></div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 — Dual Grid (Task Breakdown & Capacity) -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container dual-grid">

        <!-- Task Status Breakdown Card -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <h3 class="card-title">Task Delivery Breakdown</h3>
            <p class="card-desc">Active sprint issue distribution by status</p>
          </div>

          <div class="task-breakdown-list">
            <div class="tb-item">
              <div class="tb-info">
                <span class="tb-lbl"><span class="status-dot green"></span> Completed / Done</span>
                <span class="tb-val">{{ member.taskBreakdown?.done || 0 }} Tasks</span>
              </div>
              <div class="tb-bar-wrap">
                <div class="tb-bar-fill green" :style="{ width: `${getTaskPct(member.taskBreakdown?.done)}%` }"></div>
              </div>
            </div>

            <div class="tb-item">
              <div class="tb-info">
                <span class="tb-lbl"><span class="status-dot blue"></span> In Progress</span>
                <span class="tb-val">{{ member.taskBreakdown?.inProgress || 0 }} Tasks</span>
              </div>
              <div class="tb-bar-wrap">
                <div class="tb-bar-fill blue" :style="{ width: `${getTaskPct(member.taskBreakdown?.inProgress)}%` }"></div>
              </div>
            </div>

            <div class="tb-item">
              <div class="tb-info">
                <span class="tb-lbl"><span class="status-dot amber"></span> To Do / Backlog</span>
                <span class="tb-val">{{ member.taskBreakdown?.todo || 0 }} Tasks</span>
              </div>
              <div class="tb-bar-wrap">
                <div class="tb-bar-fill amber" :style="{ width: `${getTaskPct(member.taskBreakdown?.todo)}%` }"></div>
              </div>
            </div>

            <div class="tb-item">
              <div class="tb-info">
                <span class="tb-lbl"><span class="status-dot red"></span> Active Blockers</span>
                <span class="tb-val">{{ member.taskBreakdown?.blocked || 0 }} Tasks</span>
              </div>
              <div class="tb-bar-wrap">
                <div class="tb-bar-fill red" :style="{ width: `${getTaskPct(member.taskBreakdown?.blocked)}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Hours Logged & Bandwidth Distribution Card -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <h3 class="card-title">Bandwidth &amp; Logged Hours</h3>
            <p class="card-desc">Weekly capacity allocation vs 40-hour baseline</p>
          </div>

          <div class="bandwidth-box">
            <div class="bw-metric-row">
              <div class="bw-num">{{ member.loggedHours }} <small>/ 40 Hours</small></div>
              <div class="bw-status" :class="getStatusClass(member.status)">{{ member.utilizationPct }}% {{ member.status }}</div>
            </div>

            <div class="segmented-bar-wrap">
              <div class="seg-bar">
                <div class="seg-fill" :style="{ width: `${Math.min(100, member.utilizationPct)}%`, backgroundColor: getStatusColor(member.status) }"></div>
              </div>
            </div>

            <div class="bw-details-grid">
              <div class="bwd-item">
                <span class="bwd-lbl">Available Baseline</span>
                <span class="bwd-val">40.0 Hrs</span>
              </div>
              <div class="bwd-item">
                <span class="bwd-lbl">Logged Committed</span>
                <span class="bwd-val">{{ member.loggedHours }}.0 Hrs</span>
              </div>
              <div class="bwd-item">
                <span class="bwd-lbl">Story Points Capacity</span>
                <span class="bwd-val">{{ member.storyPointsDelivered }} / {{ member.storyPointsAssigned }} SP</span>
              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 4 — AI Career & Performance Insights   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="ai-insights-card">
          <div class="ai-card-header">
            <div class="ai-badge-group">
              <span class="ai-spark-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </span>
              <h3 class="ai-card-title">AI Performance &amp; Career Evaluation</h3>
            </div>
            <span class="ai-tag-sm">REAL-TIME EVALUATION</span>
          </div>

          <div class="ai-headline-box">
            <h4>💡 {{ member.aiFeedback?.headline }}</h4>
          </div>

          <div class="ai-insights-grid">
            <div class="ai-col">
              <h5>🏆 Core Engineering Strengths</h5>
              <ul>
                <li v-for="(s, idx) in (member.aiFeedback?.strengths || [])" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ s }}</span>
                </li>
              </ul>
            </div>

            <div class="ai-col">
              <h5>🎯 Recommended Focus &amp; Growth Areas</h5>
              <ul>
                <li v-for="(i, idx) in (member.aiFeedback?.improvements || [])" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>{{ i }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </template>

    <!-- ══════════════════════════════════════════════ -->
    <!-- MODAL: Export Member Profile PDF Report       -->
    <!-- ══════════════════════════════════════════════ -->
    <AppModal
      :show="showReportModal"
      type="info"
      title="Export Member Profile Report"
      @close="showReportModal = false"
    >
      <div class="export-modal-body">
        <p class="export-desc">Generate detailed performance scorecard for <strong>{{ member?.name }}</strong>.</p>

        <div class="form-group">
          <label class="form-label">Report Format</label>
          <select v-model="exportFormat" class="modal-input">
            <option value="PDF">Engineer Profile PDF Report</option>
            <option value="CSV">Sprint-over-Sprint CSV Export</option>
            <option value="JSON">Detailed JSON Payload</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Recipient Email (Optional)</label>
          <input v-model="exportEmail" type="email" :placeholder="member?.email || 'manager@sprintlytics.com'" class="modal-input" />
        </div>

        <div class="modal-actions-row">
          <button class="action-btn secondary-btn" @click="showReportModal = false">Cancel</button>
          <button class="action-btn primary-btn" @click="handleExportReport" :disabled="isExporting">
            {{ isExporting ? 'Generating Report...' : 'Download Profile PDF' }}
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
const memberId = computed(() => route.params.id ? decodeURIComponent(route.params.id) : 'M. Tahir Irshad');

const selectedPeriod = ref('daily');
const selectedRange  = ref(10);

const pending = ref(false);
const member  = ref(null);

const showReportModal = ref(false);
const exportFormat    = ref('PDF');
const exportEmail     = ref('');
const isExporting     = ref(false);

const toast = ref({ show: false, message: '', type: 'success' });

// ── Chart Dimensions & SVG Calculations ────────────────────────────────────
const chartWidth  = 800;
const chartHeight = 240;
const margin = { top: 20, right: 30, bottom: 40, left: 40 };

const hoveredIdx = ref(null);

const trendPoints = computed(() => {
  const list = member.value?.historicalTrends || [];
  if (!list.length) return [];

  const maxVal = Math.max(...list.map(s => Math.max(s.spDelivered, s.utilizationPct)), 50);
  const w = chartWidth - margin.left - margin.right;
  const h = chartHeight - margin.top - margin.bottom;

  return list.map((pt, idx) => {
    const x = margin.left + (idx / Math.max(1, list.length - 1)) * w;
    const spY = chartHeight - margin.bottom - (pt.spDelivered / maxVal) * h;
    const utilY = chartHeight - margin.bottom - (pt.utilizationPct / maxVal) * h;

    return {
      ...pt,
      x,
      spY,
      utilY
    };
  });
});

const yGridTicks = computed(() => {
  const list = member.value?.historicalTrends || [];
  const maxVal = Math.max(...list.map(s => Math.max(s.spDelivered, s.utilizationPct)), 100);
  const h = chartHeight - margin.top - margin.bottom;
  const step = Math.round(maxVal / 4);

  const ticks = [];
  for (let i = 0; i <= 4; i++) {
    const val = i * step;
    const y = chartHeight - margin.bottom - (val / maxVal) * h;
    ticks.push({ val, y });
  }
  return ticks;
});

const spLinePath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.spY}`).join(' ');
});

const spAreaPath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  const firstX = pts[0].x;
  const lastX  = pts[pts.length - 1].x;
  const baseY  = chartHeight - margin.bottom;

  let d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.spY}`).join(' ');
  d += ` L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  return d;
});

const utilLinePath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.utilY}`).join(' ');
});

const tooltipStyle = computed(() => {
  if (hoveredIdx.value === null || !trendPoints.value[hoveredIdx.value]) return {};
  const pt = trendPoints.value[hoveredIdx.value];
  const left = Math.min(Math.max(pt.x, 120), chartWidth - 120);
  return {
    left: `${left}px`,
    top: `${pt.spY - 60}px`
  };
});

const handleTrendHover = (evt) => {
  const rect = evt.currentTarget.getBoundingClientRect();
  const mouseX = evt.clientX - rect.left;
  const pts = trendPoints.value;
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

// ── Fetch Member Data ──────────────────────────────────────────────────────
const fetchMemberData = async () => {
  pending.value = true;
  try {
    const res = await fetch(`/api/team/member?id=${encodeURIComponent(memberId.value)}&period=${selectedPeriod.value}&range=${selectedRange.value}`);
    const json = await res.json();
    if (json.success && json.member) {
      member.value = json.member;
    } else {
      showToast(json.error || 'Failed to load member profile', 'error');
    }
  } catch (err) {
    showToast('Network error while loading member profile', 'error');
  } finally {
    pending.value = false;
  }
};

const setPeriod = (p) => {
  selectedPeriod.value = p;
  fetchMemberData();
};

const setRange = (r) => {
  selectedRange.value = r;
  fetchMemberData();
};

const openReportModal = () => {
  showReportModal.value = true;
};

const handleExportReport = () => {
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
    showReportModal.value = false;
    showToast(`Profile report exported as ${exportFormat.value} successfully!`, 'success');
  }, 1200);
};

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

// ── Helpers ────────────────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'SE';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const getTierClass = (tier) => {
  if (tier?.includes('S-Tier')) return 'tier-s';
  if (tier?.includes('A-Tier')) return 'tier-a';
  if (tier?.includes('B-Tier')) return 'tier-b';
  return 'tier-needs';
};

const getStatusClass = (status) => {
  if (status === 'Balanced') return 'status-balanced';
  if (status === 'Overloaded') return 'status-overloaded';
  if (status === 'Underutilized') return 'status-underutilized';
  if (status === 'At Risk') return 'status-at-risk';
  return 'status-default';
};

const getStatusColor = (status) => {
  if (status === 'Balanced') return '#10B981';
  if (status === 'Overloaded') return '#EF4444';
  if (status === 'Underutilized') return '#F59E0B';
  return '#2563EB';
};

const getTaskPct = (count) => {
  const total = member.value?.assigned || 14;
  return Math.min(100, Math.round(((count || 0) / total) * 100));
};

onMounted(() => {
  fetchMemberData();
});
</script>

<style scoped>
/* ── Page Layout ── */
.member-profile-analytics-page {
  padding: 1.5rem;
  background-color: #F9FAFB;
  min-height: 100vh;
  color: #111827;
  font-family: inherit;
}

/* ── Topbar ── */
.va-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.nav-back-wrap {
  margin-bottom: 0.2rem;
}

.back-link-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #2563EB;
  text-decoration: none;
  transition: color 0.15s ease;
}

.back-link-btn:hover {
  color: #1D4ED8;
  text-decoration: underline;
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
  letter-spacing: -0.02em;
  margin: 0;
}

.ai-live-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  color: #4F46E5;
  font-size: 0.68rem;
  font-weight: 700;
  border-radius: 9999px;
  border: 1px solid #C7D2FE;
  letter-spacing: 0.04em;
}

.page-main-subtitle {
  font-size: 0.85rem;
  color: #6B7280;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.period-pills, .range-pills {
  display: flex;
  background: #F3F4F6;
  padding: 3px;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
}

.pill-btn, .range-btn {
  padding: 0.35rem 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4B5563;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.pill-btn.active, .range-btn.active {
  background: #ffffff;
  color: #111827;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.gen-date-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.78rem;
  color: #4B5563;
  font-weight: 500;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  cursor: pointer;
  color: #4B5563;
  transition: all 0.15s ease;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.primary-btn {
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
}

.secondary-btn {
  background: #ffffff;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Toast */
.toast-notification {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  color: #ffffff;
}
.toast-notification.success { background: #10B981; }
.toast-notification.error { background: #EF4444; }

.section-container { margin-bottom: 1.75rem; }
.section-header { margin-bottom: 1rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem 0; }
.sec-subtitle { font-size: 0.82rem; color: #6B7280; }

/* ── Hero Profile Banner ── */
.hero-profile-banner {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.hp-left { display: flex; align-items: center; gap: 1.25rem; }
.hp-avatar-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%);
  padding: 3px;
  flex-shrink: 0;
}
.hp-avatar {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  font-weight: 800;
  color: #1E293B;
}

.hp-details { display: flex; flex-direction: column; gap: 0.25rem; }
.hp-title-row { display: flex; align-items: center; gap: 0.75rem; }
.hp-name { font-size: 1.35rem; font-weight: 800; color: #111827; margin: 0; }
.hp-role { font-size: 0.88rem; color: #4B5563; margin: 0; }
.co-name { color: #1E293B; }
.hp-meta-tags { display: flex; gap: 0.75rem; font-size: 0.78rem; color: #6B7280; margin-top: 0.2rem; }
.m-tag { display: flex; align-items: center; gap: 0.3rem; }

.hp-right { display: flex; align-items: center; }
.xp-score-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%);
  border: 2px solid #C7D2FE;
  border-radius: 50%;
  color: #4F46E5;
}

.score-num { font-size: 1.7rem; font-weight: 800; line-height: 1; }
.score-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em; margin-top: 2px; }

/* ── 8 Executive KPI Grid ── */
.exec-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 1rem;
}

.kpi-card-premium {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.1rem;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.kpi-header-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.kpi-title-with-icon { display: flex; align-items: center; gap: 0.5rem; }
.kpi-icon-badge { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; }
.kpi-icon-badge.cyan { background: #ECFEFF; color: #0891B2; }
.kpi-icon-badge.emerald { background: #ECFDF5; color: #10B981; }
.kpi-icon-badge.indigo { background: #EEF2FF; color: #4F46E5; }
.kpi-icon-badge.amber { background: #FEF3C7; color: #D97706; }
.kpi-icon-badge.rose { background: #FFE4E6; color: #E11D48; }
.kpi-icon-badge.purple { background: #F3E8FF; color: #9333EA; }
.kpi-icon-badge.teal { background: #F0FDFA; color: #0D9488; }
.kpi-icon-badge.blue { background: #EFF6FF; color: #2563EB; }

.kpi-name { font-size: 0.8rem; font-weight: 600; color: #6B7280; }
.kpi-value-row { display: flex; align-items: baseline; justify-content: space-between; }
.kpi-value { font-size: 1.35rem; font-weight: 700; color: #111827; }

.trend-badge { display: flex; align-items: center; gap: 0.2rem; font-size: 0.72rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px; }
.trend-badge.positive { background: #ECFDF5; color: #059669; }
.trend-badge.negative { background: #FEF2F2; color: #DC2626; }

/* ── Card Analytics & Chart ── */
.card-analytics {
  background: #ffffff;
  border-radius: 14px;
  padding: 1.25rem;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.card-analytics-header { margin-bottom: 1rem; }
.card-title { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0 0 0.15rem 0; }
.card-desc { font-size: 0.8rem; color: #6B7280; margin: 0; }

.line-chart-area { position: relative; width: 100%; }
.trend-svg { width: 100%; height: 240px; display: block; }

.chart-tooltip-popup {
  position: absolute;
  transform: translate(-50%, -100%);
  background: #1E293B;
  color: #ffffff;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  z-index: 10;
}

.tooltip-header { font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 0.25rem; margin-bottom: 0.35rem; color: #94A3B8; }
.tooltip-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; }
.tooltip-row.blue .dot { width: 6px; height: 6px; border-radius: 50%; background: #2563EB; }
.tooltip-row.emerald .dot { width: 6px; height: 6px; border-radius: 50%; background: #10B981; }

.chart-legend-row { display: flex; gap: 1.5rem; justify-content: center; margin-top: 0.75rem; }
.leg-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; color: #4B5563; font-weight: 500; }
.leg-color-dot.blue { width: 10px; height: 10px; border-radius: 50%; background: #2563EB; }
.leg-color-dot.emerald-dashed { width: 12px; height: 3px; background: #10B981; }

/* ── Dual Grid (Section 3) ── */
.dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 768px) { .dual-grid { grid-template-columns: 1fr; } }

.task-breakdown-list { display: flex; flex-direction: column; gap: 0.85rem; }
.tb-info { display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem; }
.tb-lbl { font-weight: 600; color: #374151; display: flex; align-items: center; gap: 0.4rem; }
.tb-val { font-weight: 700; color: #111827; }

.status-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
.status-dot.green { background: #10B981; }
.status-dot.blue { background: #2563EB; }
.status-dot.amber { background: #F59E0B; }
.status-dot.red { background: #EF4444; }

.tb-bar-wrap { height: 8px; background: #F3F4F6; border-radius: 9999px; overflow: hidden; }
.tb-bar-fill { height: 100%; border-radius: 9999px; transition: width 0.3s ease; }
.tb-bar-fill.green { background: #10B981; }
.tb-bar-fill.blue { background: #2563EB; }
.tb-bar-fill.amber { background: #F59E0B; }
.tb-bar-fill.red { background: #EF4444; }

.bandwidth-box { display: flex; flex-direction: column; gap: 1rem; }
.bw-metric-row { display: flex; justify-content: space-between; align-items: baseline; }
.bw-num { font-size: 1.4rem; font-weight: 800; color: #111827; }
.bw-num small { font-size: 0.85rem; color: #6B7280; font-weight: 600; }
.bw-status { font-size: 0.78rem; font-weight: 700; padding: 0.2rem 0.55rem; border-radius: 6px; }

.seg-bar { height: 10px; background: #F3F4F6; border-radius: 9999px; overflow: hidden; }
.seg-fill { height: 100%; border-radius: 9999px; transition: width 0.3s ease; }

.bw-details-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center; background: #F9FAFB; padding: 0.75rem; border-radius: 10px; }
.bwd-lbl { display: block; font-size: 0.68rem; color: #6B7280; }
.bwd-val { display: block; font-size: 0.82rem; font-weight: 700; color: #111827; }

/* ── Section 4: AI Insights Card ── */
.ai-insights-card {
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: #ffffff;
  box-shadow: 0 10px 25px -5px rgba(49, 46, 129, 0.4);
}

.ai-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.ai-badge-group { display: flex; align-items: center; gap: 0.6rem; }
.ai-spark-icon { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; background: rgba(255, 255, 255, 0.15); border-radius: 8px; color: #A5B4FC; }
.ai-card-title { font-size: 1.1rem; font-weight: 700; color: #ffffff; margin: 0; }
.ai-tag-sm { font-size: 0.65rem; font-weight: 700; color: #818CF8; letter-spacing: 0.05em; background: rgba(255, 255, 255, 0.1); padding: 0.2rem 0.5rem; border-radius: 9999px; }

.ai-headline-box { background: rgba(255, 255, 255, 0.08); padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1.25rem; border: 1px solid rgba(255, 255, 255, 0.12); }
.ai-headline-box h4 { font-size: 0.92rem; font-weight: 600; color: #E0E7FF; margin: 0; }

.ai-insights-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
@media (max-width: 768px) { .ai-insights-grid { grid-template-columns: 1fr; } }

.ai-col h5 { font-size: 0.85rem; font-weight: 700; color: #C7D2FE; margin: 0 0 0.6rem 0; }
.ai-col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.ai-col li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: 0.82rem; color: #E0E7FF; line-height: 1.4; }

/* Status Badges */
.tier-pill { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.72rem; font-weight: 700; }
.tier-s { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
.tier-a { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
.tier-b { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
.tier-needs { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }

.status-pill { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
.status-balanced { background: #ECFDF5; color: #047857; }
.status-overloaded { background: #FEF2F2; color: #B91C1C; }
.status-underutilized { background: #FEF3C7; color: #B45309; }
.status-at-risk { background: #FEE2E2; color: #991B1B; }

/* Export Modal */
.export-modal-body { display: flex; flex-direction: column; gap: 1rem; }
.export-desc { font-size: 0.85rem; color: #4B5563; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-label { font-size: 0.78rem; font-weight: 600; color: #374151; }
.modal-input { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #D1D5DB; font-size: 0.85rem; outline: none; }
.modal-actions-row { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }
</style>
