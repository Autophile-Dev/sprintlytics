<template>
  <div class="utilization-analytics-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Team Utilization Analytics</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
            AI POWERED
          </span>
        </div>
        <p class="page-main-subtitle">Developer bandwidth, capacity load distribution, burnout risk &amp; AI workload balancing</p>
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

        <!-- Project Selector -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedProject"
            :options="projectOptions"
            @change="onProjectChange"
          />
        </div>

        <!-- Status Filter -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedStatus"
            :options="statusOptions"
            @change="fetchData"
          />
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
        <div v-if="data" class="gen-date-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ formatDate(data.generatedAt) }}
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchData" :disabled="pending" title="Refresh Analytics">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <!-- Export Report Button -->
        <button class="action-btn primary-btn" @click="openReportModal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
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
    <div v-else-if="!data && !pending" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      </div>
      <h2>No Team Utilization Data Found</h2>
      <p>No utilization records found for <strong>{{ selectedProject }}</strong>.</p>
    </div>

    <!-- ── MAIN CONTENT VIEW ── -->
    <template v-else>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Executive Overview (8 KPI Cards)  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Utilization Executive Overview</h2>
            <span class="sec-subtitle">Key engineering bandwidth indicators and team load vs previous period</span>
          </div>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="(kpi, key) in executiveKpis" :key="key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="key === 'avgUtilization'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16 12-4-4-4 4"/><path d="M12 16V8"/></svg>
                  <svg v-else-if="key === 'capacityLoad'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
                  <svg v-else-if="key === 'overloadedDevs'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <svg v-else-if="key === 'balancedDevs'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <svg v-else-if="key === 'underutilizedDevs'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else-if="key === 'blockedDevs'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <svg v-else-if="key === 'spDelivered'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <span class="kpi-name">{{ kpi.name }}</span>
              </div>
            </div>

            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="trend-badge" :class="kpi.trendDir === 'up' ? 'positive' : kpi.trendDir === 'down' ? 'negative' : 'neutral'">
                <svg v-if="kpi.trendDir === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
                <svg v-else-if="kpi.trendDir === 'down'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                {{ kpi.trend }}
              </span>
            </div>

            <!-- Segmented Progress Bar -->
            <div class="segmented-bar-wrap">
              <SegmentedProgressBar :value="kpi.pct" :variant="kpi.variant" height="18px" />
            </div>

            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Previous Period</span>
              <span class="kpi-footer-val">{{ kpi.prevPeriod }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 2 — Utilization Trend Analysis         -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Utilization &amp; Capacity Trend Analysis</h3>
              <p class="card-desc">Sprint-over-sprint team capacity utilization % vs 85% optimal workload threshold</p>
            </div>
            <div class="chart-controls">
              <button
                class="btn-toggle-sm"
                :class="{ active: showTargetBand }"
                @click="showTargetBand = !showTargetBand"
              >
                Show Optimal Threshold Band
              </button>
            </div>
          </div>

          <!-- Main Interactive SVG Line Chart -->
          <div class="line-chart-area" @mousemove="handleTrendChartHover" @mouseleave="hoveredTrendIdx = null">
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="trend-svg">
              <defs>
                <linearGradient id="emeraldUtilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#059669" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#059669" stop-opacity="0.00"/>
                </linearGradient>
                <linearGradient id="optimalBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563EB" stop-opacity="0.10"/>
                  <stop offset="100%" stop-color="#2563EB" stop-opacity="0.02"/>
                </linearGradient>
              </defs>

              <!-- Grid Y Lines -->
              <g class="grid-y">
                <g v-for="tick in yGridTicks" :key="'yt-'+tick.val">
                  <line :x1="margin.left" :y1="tick.y" :x2="chartWidth - margin.right" :y2="tick.y" stroke="#E5E7EB" stroke-dasharray="4,4"/>
                  <text :x="margin.left - 10" :y="tick.y + 4" text-anchor="end" fill="#9CA3AF" font-size="11" font-weight="600">{{ tick.val }}%</text>
                </g>
              </g>

              <!-- Shaded Optimal Capacity Target Band (70% - 85%) -->
              <rect
                v-if="showTargetBand"
                :x="margin.left"
                :y="optimalBandYTop"
                :width="chartWidth - margin.left - margin.right"
                :height="optimalBandHeight"
                fill="url(#optimalBandGrad)"
                stroke="#BFDBFE"
                stroke-dasharray="3,3"
              />

              <!-- Target 85% Line (Blue Dashed) -->
              <line :x1="margin.left" :y1="target85Y" :x2="chartWidth - margin.right" :y2="target85Y" stroke="#2563EB" stroke-width="1.8" stroke-dasharray="5,4"/>

              <!-- Area under utilization curve -->
              <path :d="utilizationAreaPath" fill="url(#emeraldUtilGrad)" />

              <!-- Utilization Line (Emerald Solid) -->
              <path :d="utilizationLinePath" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round"/>

              <!-- Hover Vertical Crosshair & Dots -->
              <g v-if="hoveredTrendIdx !== null && trendPoints[hoveredTrendIdx]">
                <line
                  :x1="trendPoints[hoveredTrendIdx].x"
                  :y1="margin.top"
                  :x2="trendPoints[hoveredTrendIdx].x"
                  :y2="chartHeight - margin.bottom"
                  stroke="#64748B"
                  stroke-width="1.5"
                  stroke-dasharray="4,4"
                />
                <circle :cx="trendPoints[hoveredTrendIdx].x" :cy="trendPoints[hoveredTrendIdx].y" r="6" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>
              </g>

              <!-- X-Axis Sprint Labels -->
              <g class="grid-x">
                <text
                  v-for="(pt, idx) in trendPoints"
                  :key="'xt-'+idx"
                  :x="pt.x"
                  :y="chartHeight - 20"
                  text-anchor="end"
                  fill="#4B5563"
                  font-size="10"
                  font-weight="600"
                  :transform="`rotate(-30, ${pt.x}, ${chartHeight - 20})`"
                >
                  {{ formatAxisLabel(pt.sprint) }}
                </text>
              </g>
            </svg>

            <!-- Floating Hover Tooltip -->
            <div
              v-if="hoveredTrendIdx !== null && trendPoints[hoveredTrendIdx]"
              class="chart-tooltip-popup"
              :style="tooltipStyle"
            >
              <div class="tooltip-header">{{ trendPoints[hoveredTrendIdx].sprint }}</div>
              <div class="tooltip-row emerald">
                <span class="dot"></span>
                <span>Avg Utilization: <strong>{{ trendPoints[hoveredTrendIdx].utilizationPct }}%</strong></span>
              </div>
              <div class="tooltip-row blue">
                <span class="dot"></span>
                <span>Target Buffer: <strong>85.0% Optimal</strong></span>
              </div>
              <div class="tooltip-row purple">
                <span class="dot"></span>
                <span>Overloaded Engineers: <strong>{{ trendPoints[hoveredTrendIdx].overloadedCount }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Bottom Chart Legend -->
          <div class="chart-legend-row">
            <div class="leg-item"><span class="leg-color-dot emerald"></span><span>Team Capacity Utilization %</span></div>
            <div class="leg-item"><span class="leg-color-dot blue-dashed"></span><span>Optimal Target Threshold (85%)</span></div>
            <div class="leg-item"><span class="leg-color-dot blue-shaded"></span><span>70% - 85% Healthy Buffer Zone</span></div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 & SECTION 4 (Side-by-side Dual Grid)  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container dual-grid">

        <!-- SECTION 3 — Role Capacity Breakdown -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Role-Based Bandwidth &amp; Capacity</h3>
              <p class="card-desc">Developer bandwidth distribution and committed hours per engineering role</p>
            </div>
          </div>

          <div class="role-bars-wrapper">
            <div v-for="r in roleBreakdown" :key="r.role" class="role-bar-card">
              <div class="rb-header">
                <span class="rb-title">{{ r.role }}</span>
                <span class="rb-val">{{ r.allocatedHours }}h / {{ r.availableHours }}h ({{ r.pct }}%)</span>
              </div>
              <div class="progress-bar-track">
                <div
                  class="progress-bar-fill emerald"
                  :style="{ width: Math.min(100, (r.allocatedHours / r.availableHours) * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>

          <div class="chart-legend-row center">
            <div class="leg-item"><span class="leg-color-dot emerald"></span><span>Committed Hours</span></div>
            <div class="leg-item"><span class="leg-color-dot gray"></span><span>Available Standard Capacity</span></div>
          </div>
        </div>

        <!-- SECTION 4 — Workload Stability & Burnout Risk -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Capacity Stability &amp; Load Rating</h3>
              <p class="card-desc">Workload variance band, min/max team load &amp; health rating</p>
            </div>
            <span class="consistency-score-badge">
              Stability Rating: 94.2%
            </span>
          </div>

          <div class="consistency-area-wrapper" @mousemove="handleStabilityHover" @mouseleave="hoveredStabilityIdx = null">
            <svg viewBox="0 0 500 180" class="consistency-svg">
              <defs>
                <linearGradient id="utilStabilityBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563EB" stop-opacity="0.18"/>
                  <stop offset="100%" stop-color="#2563EB" stop-opacity="0.02"/>
                </linearGradient>
              </defs>

              <!-- Stability Area Band -->
              <rect x="40" y="30" width="420" height="100" fill="url(#utilStabilityBandGrad)"/>

              <!-- Max Load Line (Red Dashed) -->
              <line x1="40" y1="30" x2="460" y2="30" stroke="#EF4444" stroke-dasharray="5,4" stroke-width="1.5"/>
              <text x="465" y="34" fill="#EF4444" font-size="10" font-weight="700">Max {{ statsSummary.highestUtilization }}</text>

              <!-- Min Load Line (Orange Dashed) -->
              <line x1="40" y1="130" x2="460" y2="130" stroke="#F97316" stroke-dasharray="5,4" stroke-width="1.5"/>
              <text x="465" y="134" fill="#F97316" font-size="10" font-weight="700">Min {{ statsSummary.lowestUtilization }}</text>

              <!-- Avg Load Line (Blue Solid) -->
              <line x1="40" y1="80" x2="460" y2="80" stroke="#2563EB" stroke-width="2"/>
              <text x="465" y="84" fill="#2563EB" font-size="10" font-weight="700">Avg {{ statsSummary.averageUtilization }}</text>

              <!-- Actual Line Path -->
              <path :d="stabilityPath" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>

              <!-- Hover Vertical Crosshair & Dot -->
              <g v-if="hoveredStabilityIdx !== null && stabilityPoints[hoveredStabilityIdx]">
                <line :x1="stabilityPoints[hoveredStabilityIdx].x" y1="20" :x2="stabilityPoints[hoveredStabilityIdx].x" y2="160" stroke="#64748B" stroke-dasharray="3,3" stroke-width="1.5"/>
                <circle :cx="stabilityPoints[hoveredStabilityIdx].x" :cy="stabilityPoints[hoveredStabilityIdx].y" r="6" fill="#2563EB" stroke="#ffffff" stroke-width="2"/>
              </g>
            </svg>

            <!-- Floating Hover Tooltip -->
            <div v-if="hoveredStabilityIdx !== null && stabilityPoints[hoveredStabilityIdx]" class="chart-tooltip-popup" :style="stabilityTooltipStyle">
              <div class="tooltip-header">{{ stabilityPoints[hoveredStabilityIdx].sprint }}</div>
              <div class="tooltip-row blue">
                <span class="dot"></span>
                <span>Team Load: <strong>{{ stabilityPoints[hoveredStabilityIdx].utilizationPct }}%</strong></span>
              </div>
              <div class="tooltip-row emerald">
                <span class="dot"></span>
                <span>Status: <strong>Optimal Load</strong></span>
              </div>
            </div>
          </div>

          <div class="consistency-metrics-row">
            <div class="c-metric-pill"><span>Highest Load:</span> <strong>{{ statsSummary.highestUtilization }}</strong></div>
            <div class="c-metric-pill"><span>Lowest Load:</span> <strong>{{ statsSummary.lowestUtilization }}</strong></div>
            <div class="c-metric-pill"><span>Average Load:</span> <strong>{{ statsSummary.averageUtilization }}</strong></div>
            <div class="c-metric-pill emerald"><span>Workload Rating:</span> <strong>Optimal (94.2%)</strong></div>
          </div>
        </div>

      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 5 — Individual Team Performance Cards  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Team Member Analytics Cards</h2>
            <span class="sec-subtitle">Individual engineer contribution, capacity utilization &amp; workload health status</span>
          </div>
        </div>

        <div class="team-cards-grid">
          <div v-for="member in members" :key="'tm-'+member.email" class="team-card" style="cursor: pointer" @click="openMemberProfile(member)">
            <div class="tc-header">
              <div
                class="tc-avatar-initials"
                :style="{
                  backgroundColor: avatarBgColor(member.name).bg,
                  color: avatarBgColor(member.name).text,
                  border: '1px solid ' + avatarBgColor(member.name).border
                }"
              >
                {{ getInitials(member.name) }}
              </div>
              <div class="tc-info">
                <h4 class="tc-name">{{ member.name }}</h4>
                <span class="tc-role">{{ member.role }}</span>
              </div>
              <span class="tc-status-badge" :class="member.status.toLowerCase().replace(' ', '-')">
                {{ member.status }}
              </span>
            </div>

            <div class="tc-stats-row">
              <div class="tc-stat">
                <span class="label">Assigned</span>
                <span class="val">{{ member.allocatedHours }}h</span>
              </div>
              <div class="tc-stat">
                <span class="label">SP Delivered</span>
                <span class="val emerald">{{ member.storyPointsDelivered }} pts</span>
              </div>
              <div class="tc-stat">
                <span class="label">Utilization</span>
                <span class="val blue">{{ member.utilizationPct }}%</span>
              </div>
            </div>

            <!-- Horizontal Progress Bars -->
            <div class="tc-bars-section">
              <div class="tc-bar-group">
                <div class="tc-bar-label"><span>Story Point Completion Rate</span><strong>{{ member.completionPct }}%</strong></div>
                <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm emerald" :style="{ width: member.completionPct + '%' }"></div></div>
              </div>
              <div class="tc-bar-group">
                <div class="tc-bar-label"><span>Capacity Load</span><strong>{{ member.utilizationPct }}%</strong></div>
                <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm blue" :style="{ width: Math.min(100, member.utilizationPct) + '%' }"></div></div>
              </div>
            </div>

            <!-- Mini Sparkline Row -->
            <div class="tc-sparkline-row">
              <span class="sparkline-label">Workload Trend:</span>
              <SparklineChart variant="positive" :height="22" :points="member.sparkline" />
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 6 — Engineering Capacity Breakdown    -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Engineering Capacity Analytics</h2>
            <span class="sec-subtitle">Granular capacity breakdown, focus factor &amp; unused bandwidth metrics</span>
          </div>
        </div>

        <div class="sp-analytics-grid">
          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <span class="sp-title">Gross Team Capacity</span>
            </div>
            <div class="sp-main-val">{{ summary.totalAvailable }} <span class="unit">hrs</span></div>
            <SegmentedProgressBar :value="100" variant="blue" height="14px"/>
            <span class="sp-sub-text">Standard available engineering hours</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge emerald">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span class="sp-title">Net Allocated Hours</span>
            </div>
            <div class="sp-main-val emerald">{{ summary.totalAllocated }} <span class="unit">hrs</span></div>
            <SegmentedProgressBar :value="summary.capacityLoadPct" variant="emerald" height="14px"/>
            <span class="sp-sub-text">{{ summary.capacityLoadPct }}% total committed load</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge orange">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span class="sp-title">Unused Bandwidth</span>
            </div>
            <div class="sp-main-val orange">{{ summary.unusedCapacityHours }} <span class="unit">hrs</span></div>
            <SegmentedProgressBar :value="Math.round((summary.unusedCapacityHours / Math.max(1, summary.totalAvailable)) * 100)" variant="orange" height="14px"/>
            <span class="sp-sub-text">Emergency bug buffer reserve</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge purple">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <span class="sp-title">Avg SP Delivered</span>
            </div>
            <div class="sp-main-val purple">{{ summary.totalSPDelivered }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="88" variant="purple" height="14px"/>
            <span class="sp-sub-text">Story points delivered total</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <span class="sp-title">Avg Hrs per Engineer</span>
            </div>
            <div class="sp-main-val">{{ summary.totalMembers > 0 ? Math.round(summary.totalAllocated / summary.totalMembers) : 0 }} <span class="unit">hrs</span></div>
            <SegmentedProgressBar :value="90" variant="blue" height="14px"/>
            <span class="sp-sub-text">Individual developer commitment</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge orange">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <span class="sp-title">Overloaded Count</span>
            </div>
            <div class="sp-main-val red">{{ summary.overloadedCount }} <span class="unit">devs</span></div>
            <SegmentedProgressBar :value="Math.round((summary.overloadedCount / Math.max(1, summary.totalMembers)) * 100)" variant="red" height="14px"/>
            <span class="sp-sub-text">Engineers operating above 90% load</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge emerald">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span class="sp-title">Balanced Count</span>
            </div>
            <div class="sp-main-val emerald">{{ summary.balancedCount }} <span class="unit">devs</span></div>
            <SegmentedProgressBar :value="Math.round((summary.balancedCount / Math.max(1, summary.totalMembers)) * 100)" variant="emerald" height="14px"/>
            <span class="sp-sub-text">Engineers in 70% - 90% target range</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge red">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span class="sp-title">At Risk / Blocked</span>
            </div>
            <div class="sp-main-val red">{{ summary.atRiskCount }} <span class="unit">devs</span></div>
            <SegmentedProgressBar :value="Math.round((summary.atRiskCount / Math.max(1, summary.totalMembers)) * 100)" variant="red" height="14px"/>
            <span class="sp-sub-text">Has active delivery impediments</span>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 7 — Team Roster & Utilization Table   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Team Roster &amp; Utilization Data</h3>
              <p class="card-desc">Detailed engineer workload records, assigned story points &amp; capacity status</p>
            </div>

            <!-- Search & Filter Controls -->
            <div class="table-filter-row">
              <div class="table-search-input">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" v-model="tableSearch" placeholder="Search engineer, role, project..." />
              </div>

              <div class="filter-group-sm">
                <CustomSelect
                  v-model="tableStatusFilter"
                  :options="statusOptions"
                />
              </div>
            </div>
          </div>

          <div class="table-responsive">
            <table class="velocity-data-table">
              <thead>
                <tr>
                  <th @click="sortTable('name')">Engineer Name {{ getSortIcon('name') }}</th>
                  <th @click="sortTable('role')">Role {{ getSortIcon('role') }}</th>
                  <th @click="sortTable('companyName')">Company {{ getSortIcon('companyName') }}</th>
                  <th @click="sortTable('sprintName')">Sprint {{ getSortIcon('sprintName') }}</th>
                  <th @click="sortTable('availableHours')">Available Hrs {{ getSortIcon('availableHours') }}</th>
                  <th @click="sortTable('allocatedHours')">Allocated Hrs {{ getSortIcon('allocatedHours') }}</th>
                  <th @click="sortTable('storyPointsDelivered')">SP Delivered {{ getSortIcon('storyPointsDelivered') }}</th>
                  <th @click="sortTable('utilizationPct')">Utilization % {{ getSortIcon('utilizationPct') }}</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredTableData" :key="'row-'+row.id" class="clickable-row">
                  <td><strong>{{ row.name }}</strong></td>
                  <td>{{ row.role }}</td>
                  <td>{{ row.companyName }}</td>
                  <td>{{ row.sprintName }}</td>
                  <td>{{ row.availableHours }}h</td>
                  <td class="font-bold">{{ row.allocatedHours }}h</td>
                  <td class="emerald font-bold">{{ row.storyPointsDelivered }} pts</td>
                  <td>
                    <div class="tbl-pct-cell">
                      <span>{{ row.utilizationPct }}%</span>
                      <div class="progress-bar-track-xs">
                        <div
                          class="progress-bar-fill-sm"
                          :class="row.utilizationPct > 90 ? 'red' : row.utilizationPct >= 70 ? 'emerald' : 'orange'"
                          :style="{ width: Math.min(100, row.utilizationPct) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="sc-status-pill" :class="row.status.toLowerCase().replace(' ', '-')">{{ row.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 8 — AI Utilization Intelligence       -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="ai-intelligence-card">
          <div class="ai-header">
            <div class="ai-title-wrap">
              <span class="ai-sparkle-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </span>
              <h3 class="ai-title">AI Utilization Intelligence</h3>
            </div>
            <span class="ai-model-badge">Gemini AI Engine v4</span>
          </div>

          <!-- Executive Summary Narrative -->
          <div class="ai-summary-box">
            <p>{{ aiIntelligence.executiveSummary }}</p>
          </div>

          <div class="ai-grid-3col">
            <!-- Key Achievements -->
            <div class="ai-subcard">
              <h4 class="ai-subcard-title emerald">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                Key Achievements
              </h4>
              <div v-for="ach in aiIntelligence.keyAchievements" :key="ach.id" class="ai-item-row">
                <span class="ai-badge-sm green">{{ ach.badge }}</span>
                <div>
                  <strong>{{ ach.title }}</strong>
                  <p>{{ ach.desc }}</p>
                </div>
              </div>
            </div>

            <!-- Delivery & Burnout Risks -->
            <div class="ai-subcard">
              <h4 class="ai-subcard-title orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Delivery &amp; Burnout Risks
              </h4>
              <div v-for="risk in aiIntelligence.deliveryRisks" :key="risk.id" class="ai-item-row">
                <span class="ai-badge-sm orange">{{ risk.level }} Risk ({{ risk.score }})</span>
                <div>
                  <strong>{{ risk.title }}</strong>
                  <p>{{ risk.desc }}</p>
                </div>
              </div>
            </div>

            <!-- AI Recommendations -->
            <div class="ai-subcard">
              <h4 class="ai-subcard-title blue">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                Recommendations
              </h4>
              <div v-for="rec in aiIntelligence.recommendations" :key="rec.id" class="ai-item-row">
                <div>
                  <strong>{{ rec.title }}</strong>
                  <p>{{ rec.desc }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- AI Capacity Forecast Banner -->
          <div class="ai-forecast-banner">
            <div class="afb-left">
              <span class="afb-label">AI Predicted Next Capacity Load</span>
              <div class="afb-val-row">
                <span class="afb-main-val">{{ aiIntelligence.forecast.expectedCapacityLoad }}</span>
                <span class="afb-conf-badge">Confidence: {{ aiIntelligence.forecast.confidenceScore }}%</span>
              </div>
            </div>

            <div class="afb-right-metrics">
              <div class="afb-sub"><span>Best Case:</span> <strong>{{ aiIntelligence.forecast.bestCase }}</strong></div>
              <div class="afb-sub"><span>Worst Case:</span> <strong>{{ aiIntelligence.forecast.worstCase }}</strong></div>
              <div class="afb-sub"><span>Recommended SP Commitment:</span> <strong>{{ aiIntelligence.forecast.commitmentRange }}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 9 — Utilization Statistics Summary    -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Utilization Statistics Summary</h2>
            <span class="sec-subtitle">Aggregated statistical highlights across historical sprint cycles</span>
          </div>
        </div>

        <div class="stats-summary-grid">
          <div class="stat-mini-card"><span>Highest Member Load</span><strong>{{ statsSummary.highestUtilization }}</strong></div>
          <div class="stat-mini-card"><span>Lowest Member Load</span><strong>{{ statsSummary.lowestUtilization }}</strong></div>
          <div class="stat-mini-card"><span>Average Utilization</span><strong>{{ statsSummary.averageUtilization }}</strong></div>
          <div class="stat-mini-card"><span>Median Utilization</span><strong>{{ statsSummary.medianUtilization }}</strong></div>
          <div class="stat-mini-card"><span>Total Allocated Hrs</span><strong>{{ statsSummary.totalAllocatedHours }}</strong></div>
          <div class="stat-mini-card"><span>Total Gross Capacity</span><strong>{{ statsSummary.totalAvailableCapacity }}</strong></div>
          <div class="stat-mini-card"><span>Overloaded Engineers</span><strong>{{ statsSummary.overloadedCount }}</strong></div>
          <div class="stat-mini-card"><span>Underutilized Engineers</span><strong>{{ statsSummary.underutilizedCount }}</strong></div>
          <div class="stat-mini-card"><span>Workload Health Score</span><strong>{{ statsSummary.workloadHealthScore }}</strong></div>
          <div class="stat-mini-card emerald"><span>Capacity Rating</span><strong>{{ statsSummary.capacityRating }}</strong></div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 10 — Quick Actions Toolbar            -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="quick-actions-bar">
          <button class="qa-btn" @click="openJiraSchedule">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Open Team Schedule
          </button>

          <button class="qa-btn" @click="navigateToHealthCurrent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            View Sprint Health
          </button>

          <button class="qa-btn" @click="openReportModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Download Utilization Report
          </button>

          <button class="qa-btn" @click="exportCSV">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Excel
          </button>

          <button class="qa-btn" @click="triggerPrintPDF">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Export PDF
          </button>

          <button class="qa-btn" @click="openShareModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share Report
          </button>

          <button class="qa-btn primary" @click="fetchData">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh Analytics
          </button>
        </div>
      </section>

    </template>

    <!-- Report Modal -->
    <div v-if="showReportModal" class="modal-backdrop" @click.self="showReportModal = false">
      <div class="modal-card-custom">
        <div class="modal-header">
          <h3>Team Utilization Report</h3>
          <button @click="showReportModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>Download comprehensive Team Utilization &amp; Capacity Load Report for <strong>{{ selectedProject }}</strong>.</p>
          <div class="report-options">
            <button class="report-opt-btn" @click="downloadReport('excel')" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Download Excel / CSV
            </button>
            <button class="report-opt-btn" @click="downloadReport('pdf')" style="display: inline-flex; align-items: center; gap: 0.4rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Print / Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-backdrop" @click.self="showShareModal = false">
      <div class="modal-card-custom">
        <div class="modal-header">
          <h3>Share Utilization Dashboard</h3>
          <button @click="showShareModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>Copy sharable dashboard link to email or Slack:</p>
          <div class="share-link-input-row">
            <input type="text" readonly :value="shareUrl" class="share-field"/>
            <button class="action-btn" @click="copyShareUrl">Copy Link</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CustomSelect from '~/components/CustomSelect.vue';
import SegmentedProgressBar from '~/components/SegmentedProgressBar.vue';
import SparklineChart from '~/components/SparklineChart.vue';

useHead({ title: 'Team Utilization Analytics | Sprintlytics' });

const route = useRoute();
const router = useRouter();

const openMemberProfile = (member) => {
  if (!member) return;
  const targetId = member.id || (member.companyName ? `${member.companyName}__${member.email || member.name}` : member.email || member.name);
  router.push(`/team/member/${encodeURIComponent(targetId)}`);
};

// State
const selectedProject = ref(route.query.project || 'ALL');
const selectedStatus = ref('ALL');
const selectedPeriod = ref('daily');
const selectedRange = ref(10);
const pending = ref(false);
const data = ref(null);
const showTargetBand = ref(true);

// Hover states
const hoveredTrendIdx = ref(null);
const hoveredStabilityIdx = ref(null);

// Table controls
const tableSearch = ref('');
const tableStatusFilter = ref('ALL');
const sortKey = ref('utilizationPct');
const sortAsc = ref(false);

// Modals & Toast
const showReportModal = ref(false);
const showShareModal = ref(false);
const shareUrl = computed(() => typeof window !== 'undefined' ? window.location.href : '');

const toast = ref({ show: false, message: '', type: 'success' });
let toastTimer = null;
const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
};

// Project & Status Options
const projectOptions = computed(() => data.value?.projectOptions || [{ label: 'All Projects', value: 'ALL' }]);
const statusOptions = computed(() => data.value?.statusOptions || [{ label: 'All Statuses', value: 'ALL' }]);

const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const avatarBgColor = (name) => {
  const colors = [
    { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
    { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    { bg: '#F3E8FF', text: '#7C3AED', border: '#DDD6FE' },
    { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5' },
    { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
    { bg: '#F0FDFA', text: '#0D9488', border: '#99F6E4' }
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const onProjectChange = () => {
  router.replace({ query: { ...route.query, project: selectedProject.value } });
  fetchData();
};

watch(() => route.query.project, (newProj) => {
  if (newProj && newProj !== selectedProject.value) {
    selectedProject.value = newProj;
    fetchData();
  }
});

// Fetch Data from API
const fetchData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/team/utilization', {
      query: {
        project: selectedProject.value,
        status: selectedStatus.value,
        period: selectedPeriod.value,
        range: selectedRange.value
      }
    });

    if (res && res.success) {
      data.value = res;
    } else {
      showToast(res.error || 'Failed to load utilization data', 'warn');
    }
  } catch (err) {
    console.error('Error loading team utilization analytics:', err);
    showToast('Failed to connect to team utilization endpoint', 'warn');
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  fetchData();
});

const setPeriod = (p) => {
  selectedPeriod.value = p;
  fetchData();
};

const setRange = (r) => {
  selectedRange.value = r;
  fetchData();
};

// Computed analytics data shortcuts
const executiveKpis = computed(() => data.value?.executiveKpis || {});
const summary = computed(() => data.value?.summary || {});
const members = computed(() => data.value?.members || []);
const roleBreakdown = computed(() => data.value?.roleBreakdown || []);
const utilizationTrend = computed(() => data.value?.utilizationTrend || []);
const statsSummary = computed(() => data.value?.statsSummary || {});
const aiIntelligence = computed(() => data.value?.aiIntelligence || { keyAchievements: [], deliveryRisks: [], recommendations: [], forecast: {} });

const formatAxisLabel = (str) => {
  if (!str) return '';
  let s = String(str);
  if (s.length > 14) {
    s = s.replace(/Sprint\s+/i, 'S');
  }
  if (s.length > 16) {
    s = s.slice(0, 14) + '…';
  }
  return s;
};

// SVG Trend Line Chart Coordinates
const chartWidth = 750;
const chartHeight = 250;
const margin = { top: 20, right: 30, bottom: 65, left: 55 };

const yGridTicks = computed(() => [
  { val: 120, y: margin.top },
  { val: 90,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.25 },
  { val: 60,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.5 },
  { val: 30,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.75 },
  { val: 0,   y: chartHeight - margin.bottom }
]);

const optimalBandYTop = margin.top + (chartHeight - margin.top - margin.bottom) * (1 - 85 / 120);
const optimalBandHeight = (chartHeight - margin.top - margin.bottom) * (15 / 120);
const target85Y = margin.top + (chartHeight - margin.top - margin.bottom) * (1 - 85 / 120);

const trendPoints = computed(() => {
  const points = utilizationTrend.value;
  if (!points.length) return [];
  const maxVal = 120;
  const availWidth = chartWidth - margin.left - margin.right;
  const step = points.length > 1 ? availWidth / (points.length - 1) : availWidth / 2;

  return points.map((pt, i) => {
    const x = margin.left + i * step;
    const y = chartHeight - margin.bottom - (Math.min(pt.utilizationPct, maxVal) / maxVal) * (chartHeight - margin.top - margin.bottom);
    return {
      sprint: pt.sprint,
      utilizationPct: pt.utilizationPct,
      overloadedCount: pt.overloadedCount,
      x,
      y
    };
  });
});

const utilizationLinePath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
});

const utilizationAreaPath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  const line = pts.map(p => `${p.x},${p.y}`).join(' L ');
  const lastX = pts[pts.length - 1].x;
  const firstX = pts[0].x;
  const bottomY = chartHeight - margin.bottom;
  return `M ${firstX},${bottomY} L ${line} L ${lastX},${bottomY} Z`;
});

const handleTrendChartHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
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
  hoveredTrendIdx.value = closestIdx;
};

const tooltipStyle = computed(() => {
  if (hoveredTrendIdx.value === null || !trendPoints.value[hoveredTrendIdx.value]) return {};
  const pt = trendPoints.value[hoveredTrendIdx.value];
  const isRightHalf = pt.x > chartWidth / 2;
  return {
    left: `${pt.x + (isRightHalf ? -190 : 15)}px`,
    top: `${pt.y - 20}px`
  };
});

// Section 4 Stability Area Chart Coordinates
const stabilityPoints = computed(() => {
  const points = utilizationTrend.value;
  if (!points.length) return [];
  const width = 420;
  const step = width / Math.max(1, points.length - 1);

  return points.map((p, idx) => {
    const x = 40 + idx * step;
    const norm = Math.min(1, Math.max(0, (p.utilizationPct - 65) / (110 - 65)));
    const y = 130 - norm * (130 - 30);
    return {
      sprint: p.sprint,
      utilizationPct: p.utilizationPct,
      x,
      y
    };
  });
});

const stabilityPath = computed(() => {
  const pts = stabilityPoints.value;
  if (!pts.length) return 'M 40,80 L 460,80';
  return 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
});

const handleStabilityHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = stabilityPoints.value;
  if (!pts.length) return;

  let closestIdx = 0;
  let minDiff = Infinity;
  pts.forEach((p, idx) => {
    const diff = Math.abs((p.x / 500) * rect.width - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  hoveredStabilityIdx.value = closestIdx;
};

const stabilityTooltipStyle = computed(() => {
  if (hoveredStabilityIdx.value === null || !stabilityPoints.value[hoveredStabilityIdx.value]) return {};
  const pt = stabilityPoints.value[hoveredStabilityIdx.value];
  const isRightHalf = pt.x > 250;
  return {
    left: `${(pt.x / 500) * 100}%`,
    top: `20px`,
    transform: isRightHalf ? 'translateX(-105%)' : 'translateX(5%)'
  };
});

// Table Filter & Sorting
const filteredTableData = computed(() => {
  let list = [...members.value];

  if (tableSearch.value.trim()) {
    const q = tableSearch.value.toLowerCase().trim();
    list = list.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.companyName.toLowerCase().includes(q) ||
      m.status.toLowerCase().includes(q) ||
      String(m.utilizationPct).includes(q) ||
      String(m.allocatedHours).includes(q)
    );
  }

  if (tableStatusFilter.value !== 'ALL') {
    list = list.filter(m => m.status.toLowerCase() === tableStatusFilter.value.toLowerCase());
  }

  list.sort((a, b) => {
    let valA = a[sortKey.value];
    let valB = b[sortKey.value];
    if (typeof valA === 'string') {
      return sortAsc.value ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAsc.value ? valA - valB : valB - valA;
  });

  return list;
});

const sortTable = (key) => {
  if (sortKey.value === key) {
    sortAsc.value = !sortAsc.value;
  } else {
    sortKey.value = key;
    sortAsc.value = false;
  }
};

const getSortIcon = (key) => {
  if (sortKey.value !== key) return '↕';
  return sortAsc.value ? '↑' : '↓';
};

const navigateToHealthCurrent = () => {
  router.push({
    path: '/sprint/health',
    query: { project: selectedProject.value }
  });
};

const openJiraSchedule = () => {
  showToast(`Opening Team Schedule for ${selectedProject.value}...`, 'info');
  window.open(`https://jira.atlassian.com/projects/${encodeURIComponent(selectedProject.value)}`, '_blank');
};

const openReportModal = () => {
  showReportModal.value = true;
};

const openShareModal = () => {
  showShareModal.value = true;
};

const copyShareUrl = () => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl.value);
    showToast('Dashboard link copied to clipboard!', 'success');
    showShareModal.value = false;
  }
};

const downloadReport = (type) => {
  showReportModal.value = false;
  if (type === 'excel') {
    exportCSV();
  } else {
    triggerPrintPDF();
  }
};

const exportCSV = () => {
  const rows = [
    ['Engineer Name', 'Role', 'Company', 'Sprint', 'Available Hours', 'Allocated Hours', 'SP Delivered', 'Utilization Pct', 'Status']
  ];
  members.value.forEach(m => {
    rows.push([m.name, m.role, m.companyName, m.sprintName, m.availableHours, m.allocatedHours, m.storyPointsDelivered, `${m.utilizationPct}%`, m.status]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `team_utilization_report_${selectedProject.value}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Exported CSV report successfully!', 'success');
};

const triggerPrintPDF = () => {
  showToast('Opening print/PDF export preview...', 'info');
  setTimeout(() => {
    window.print();
  }, 500);
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap');

.utilization-analytics-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  font-family: 'Open Sans', sans-serif;
  color: #111827;
  padding-bottom: 3rem;
}

/* ── Topbar Filters ── */
.va-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  background: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  border: none;
  outline: none;
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
}

.ai-live-tag {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.page-main-subtitle {
  font-size: 0.85rem;
  color: #6B7280;
  margin: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.period-pills, .range-pills {
  display: flex;
  background: #F3F4F6;
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
}

.pill-btn, .range-btn {
  border: none;
  background: transparent;
  padding: 0.4rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4B5563;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn.active, .range-btn.active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filter-group {
  min-width: 140px;
}

.gen-date-badge {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
}

.icon-btn {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  color: #4B5563;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover { background: #F9FAFB; color: #059669; }
.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #E5E7EB;
  background: #ffffff;
  color: #374151;
}

.action-btn.primary-btn {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
}

.action-btn.primary-btn:hover { background: #047857; }

/* ── Section Containers ── */
.section-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.sec-subtitle {
  font-size: 0.8rem;
  color: #6B7280;
}

/* Executive KPI Cards Grid (4 per row) */
.exec-kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

@media (max-width: 1200px) {
  .exec-kpi-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .exec-kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 580px) {
  .exec-kpi-grid {
    grid-template-columns: 1fr;
  }
}

.kpi-card-premium {
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 12px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.kpi-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  white-space: nowrap;
  min-width: 0;
}

.kpi-title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.kpi-icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon-badge.emerald { background: #ECFDF5; color: #059669; }
.kpi-icon-badge.blue { background: #EFF6FF; color: #2563EB; }
.kpi-icon-badge.purple { background: #F3E8FF; color: #7C3AED; }
.kpi-icon-badge.orange { background: #FFF7ED; color: #F97316; }
.kpi-icon-badge.red { background: #FEF2F2; color: #EF4444; }

.kpi-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4B5563;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kpi-value-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  white-space: nowrap;
  min-width: 0;
}

.kpi-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.kpi-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
}

.trend-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.2rem;
}

.trend-badge.positive { background: #ECFDF5; color: #059669; }
.trend-badge.negative { background: #FEF2F2; color: #EF4444; }
.trend-badge.neutral { background: #F3F4F6; color: #4B5563; }

.kpi-footer-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #6B7280;
}

.kpi-footer-val { font-weight: 600; color: #374151; }

/* ── Card Analytics Wrapper ── */
.card-analytics {
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 14px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.card-analytics-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-desc {
  font-size: 0.78rem;
  color: #6B7280;
  margin: 0;
}

.btn-toggle-sm {
  border: 1px solid #D1D5DB;
  background: #ffffff;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-toggle-sm.active {
  background: #EFF6FF;
  color: #2563EB;
  border-color: #BFDBFE;
}

/* Line Chart SVG */
.line-chart-area {
  position: relative;
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart-tooltip-popup {
  position: absolute;
  background: #1E293B;
  color: #ffffff;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.75rem;
}

.tooltip-header {
  font-weight: 700;
  border-bottom: 1px solid #334155;
  padding-bottom: 0.25rem;
  color: #F8FAFC;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tooltip-row .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tooltip-row.emerald .dot { background: #10B981; }
.tooltip-row.blue .dot { background: #3B82F6; }
.tooltip-row.purple .dot { background: #8B5CF6; }

.chart-legend-row {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.78rem;
  color: #4B5563;
  font-weight: 600;
}

.chart-legend-row.center { justify-content: center; }

.leg-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.leg-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.leg-color-dot.emerald { background: #059669; }
.leg-color-dot.blue-dashed { background: #2563EB; }
.leg-color-dot.blue-shaded { background: #BFDBFE; border: 1px solid #2563EB; }
.leg-color-dot.gray { background: #9CA3AF; }

/* Dual Grid Layout */
.dual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1rem;
}

.role-bars-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.role-bar-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.rb-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.rb-val { color: #059669; font-weight: 700; }

.progress-bar-track {
  width: 100%;
  height: 10px;
  background: #F3F4F6;
  border-radius: 5px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.4s ease;
}

.progress-bar-fill.emerald { background: #059669; }

/* Consistency Score Card */
.consistency-score-badge {
  background: #EFF6FF;
  color: #2563EB;
  border: 1px solid #BFDBFE;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
}

.consistency-area-wrapper {
  position: relative;
  width: 100%;
}

.consistency-svg {
  width: 100%;
  height: auto;
}

.consistency-metrics-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.c-metric-pill {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  font-size: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  color: #4B5563;
}

.c-metric-pill.emerald {
  background: #ECFDF5;
  border-color: #A7F3D0;
  color: #059669;
}

/* Team Member Cards Grid */
.team-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.team-card {
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 12px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.tc-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tc-avatar-initials {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  flex-shrink: 0;
}

.tc-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.tc-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.tc-role {
  font-size: 0.75rem;
  color: #6B7280;
}

.tc-status-badge, .sc-status-pill {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  text-transform: capitalize;
}

.tc-status-badge.overloaded, .sc-status-pill.overloaded { background: #FEF2F2; color: #EF4444; border: 1px solid #FCA5A5; }
.tc-status-badge.balanced, .sc-status-pill.balanced { background: #ECFDF5; color: #059669; border: 1px solid #6EE7B7; }
.tc-status-badge.underutilized, .sc-status-pill.underutilized { background: #FFF7ED; color: #EA580C; border: 1px solid #FDBA74; }
.tc-status-badge.at-risk, .sc-status-pill.at-risk { background: #FEF2F2; color: #DC2626; border: 1px solid #F87171; }

.tc-stats-row {
  display: flex;
  justify-content: space-between;
  background: #F9FAFB;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.tc-stat {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.tc-stat .label { font-size: 0.7rem; color: #6B7280; }
.tc-stat .val { font-size: 0.85rem; font-weight: 700; color: #111827; }
.tc-stat .val.emerald { color: #059669; }
.tc-stat .val.blue { color: #2563EB; }

.tc-bars-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tc-bar-group {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.tc-bar-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #4B5563;
}

.progress-bar-track-sm {
  width: 100%;
  height: 6px;
  background: #F3F4F6;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill-sm {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.progress-bar-fill-sm.emerald { background: #059669; }
.progress-bar-fill-sm.blue { background: #2563EB; }
.progress-bar-fill-sm.red { background: #EF4444; }
.progress-bar-fill-sm.orange { background: #F97316; }

.tc-sparkline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #6B7280;
  border-top: 1px solid #F3F4F6;
  padding-top: 0.5rem;
}

/* 8 Capacity Cards Grid */
.sp-analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.sp-card {
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.sp-icon-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sp-title {
  font-size: 0.78rem;
  font-weight: 600;
  color: #4B5563;
}

.sp-main-val {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
}

.sp-main-val.emerald { color: #059669; }
.sp-main-val.orange { color: #EA580C; }
.sp-main-val.purple { color: #7C3AED; }
.sp-main-val.red { color: #DC2626; }

.sp-main-val .unit { font-size: 0.8rem; font-weight: 600; color: #6B7280; }

.sp-sub-text {
  font-size: 0.72rem;
  color: #6B7280;
}

/* Data Table Styling */
.table-filter-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-search-input {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.table-search-input input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 0.8rem;
  color: #111827;
  width: 180px;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
}

.velocity-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  text-align: left;
}

.velocity-data-table th {
  background: #F9FAFB;
  color: #4B5563;
  font-weight: 700;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #E5E7EB;
  cursor: pointer;
  user-select: none;
}

.velocity-data-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #F3F4F6;
  color: #374151;
}

.clickable-row:hover {
  background: #F8FAFC;
}

.tbl-pct-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.progress-bar-track-xs {
  width: 60px;
  height: 5px;
  background: #F3F4F6;
  border-radius: 3px;
  overflow: hidden;
}

.font-bold { font-weight: 700; }
.emerald { color: #059669; }
.red { color: #DC2626; }

/* AI Utilization Intelligence Card */
.ai-intelligence-card {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  color: #ffffff;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 10px 25px -5px;
}

.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ai-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ai-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #F8FAFC;
  margin: 0;
}

.ai-model-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38BDF8;
  border: 1px solid rgba(56, 189, 248, 0.3);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 20px;
}

.ai-summary-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 1rem;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #E2E8F0;
}

.ai-grid-3col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.ai-subcard {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ai-subcard-title {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ai-subcard-title.emerald { color: #34D399; }
.ai-subcard-title.orange { color: #FB923C; }
.ai-subcard-title.blue { color: #38BDF8; }

.ai-item-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding-bottom: 0.5rem;
}

.ai-item-row:last-child { border-bottom: none; padding-bottom: 0; }
.ai-item-row strong { color: #F8FAFC; }
.ai-item-row p { margin: 0; color: #94A3B8; font-size: 0.76rem; }

.ai-badge-sm {
  align-self: flex-start;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.ai-badge-sm.green { background: rgba(52, 211, 153, 0.2); color: #34D399; }
.ai-badge-sm.orange { background: rgba(251, 146, 60, 0.2); color: #FB923C; }

.ai-forecast-banner {
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.afb-left {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.afb-label { font-size: 0.75rem; color: #94A3B8; }

.afb-val-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.afb-main-val {
  font-size: 1.5rem;
  font-weight: 700;
  color: #38BDF8;
}

.afb-conf-badge {
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(52, 211, 153, 0.2);
  color: #34D399;
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
}

.afb-right-metrics {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  font-size: 0.78rem;
  color: #CBD5E1;
}

.afb-sub span { color: #94A3B8; }

/* Stats Mini Summary Grid */
.stats-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
}

.stat-mini-card {
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.stat-mini-card span { font-size: 0.75rem; color: #6B7280; font-weight: 600; }
.stat-mini-card strong { font-size: 1.1rem; color: #111827; font-weight: 700; }
.stat-mini-card.emerald strong { color: #059669; }

/* Quick Actions Bar */
.quick-actions-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: #ffffff;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.qa-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.qa-btn:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.qa-btn.primary {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
}

.qa-btn.primary:hover { background: #047857; }

/* Modal Backdrop & Cards */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-card-custom {
  background: #ffffff;
  width: 90%;
  max-width: 480px;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; color: #111827; }
.btn-close { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; color: #9CA3AF; }

.modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.85rem;
  color: #4B5563;
}

.report-options {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.report-opt-btn {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.report-opt-btn:hover { background: #ECFDF5; border-color: #A7F3D0; color: #059669; }

.share-link-input-row {
  display: flex;
  gap: 0.5rem;
}

.share-field {
  flex: 1;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: #4B5563;
}

/* Toast Notification Floating Banner */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1E293B;
  color: #ffffff;
  padding: 0.75rem 1.15rem;
  border-radius: 10px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  z-index: 1000;
}

.toast-notification.success { border-left: 4px solid #10B981; }
.toast-notification.warn { border-left: 4px solid #F59E0B; }
.toast-notification.info { border-left: 4px solid #3B82F6; }

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(10px); }

/* Simple Loading Spinner */
.simple-loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid #E5E7EB;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.empty-state {
  background: #ffffff;
  border-radius: 14px;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.empty-state h2 { font-size: 1.25rem; font-weight: 700; color: #111827; margin: 0; }
.empty-state p { font-size: 0.85rem; color: #6B7280; margin: 0; }
</style>
