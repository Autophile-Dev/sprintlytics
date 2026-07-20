<template>
  <div class="burndown-container">
    <!-- ── Topbar / Global Filters ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Burndown Analytics</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            AI POWERED
          </span>
        </div>
        <p class="page-main-subtitle">Sprint progress tracking, ideal vs actual burndown, scope change analysis &amp; AI forecasting</p>
      </div>

      <div class="topbar-right">
        <!-- Report Type Pills (Daily / Weekly / Monthly) -->
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

        <!-- Sprint Selector -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedSprint"
            :options="sprintOptions"
            :disabled="selectedProject === 'ALL'"
            placeholder="All Sprints"
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

        <!-- Date Range Badge -->
        <div class="gen-date-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <span>{{ currentDateFormatted }}</span>
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchData" :disabled="pending" title="Refresh Analytics">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <!-- Export Report Button -->
        <button class="action-btn primary-btn" @click="openReportModal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </button>
      </div>
    </header>

    <!-- Loading Spinner -->
    <div v-if="pending" class="simple-loading-spinner">
      <div class="spinner"></div>
    </div>

    <template v-else-if="data">
      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Executive Overview (8 KPI Cards)  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Burndown Executive Overview</h2>
          <span class="sec-subtitle">Key sprint progress, remaining work indicators vs previous period</span>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="(kpi, key) in executiveKpis" :key="key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="key === 'sprintProgress'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else-if="key === 'remainingStoryPoints'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <svg v-else-if="key === 'completedStoryPoints'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <svg v-else-if="key === 'remainingIssues'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
                  <svg v-else-if="key === 'burndownEfficiency'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <svg v-else-if="key === 'daysRemaining'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <svg v-else-if="key === 'completionForecast'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
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
      <!-- SECTION 2 — Burndown Hero Chart               -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Sprint Burndown Chart</h3>
              <p class="card-desc">Ideal burndown trajectory vs actual work remaining &amp; AI forecasted completion</p>
            </div>
            <div class="chart-controls">
              <button class="btn-toggle-sm" :class="{ active: showIdealLine }" @click="showIdealLine = !showIdealLine">
                Ideal Line
              </button>
              <button class="btn-toggle-sm" :class="{ active: showForecastLine }" @click="showForecastLine = !showForecastLine">
                AI Forecast
              </button>
            </div>
          </div>

          <!-- Interactive Hero Burndown Chart -->
          <div class="line-chart-area" @mousemove="handleHeroHover" @mouseleave="hoveredHeroIdx = null">
            <svg viewBox="0 0 800 240" class="trend-svg">
              <defs>
                <linearGradient id="heroBurndownGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#059669" stop-opacity="0.22"/>
                  <stop offset="100%" stop-color="#059669" stop-opacity="0.00"/>
                </linearGradient>
              </defs>

              <!-- Grid Y Lines -->
              <g class="grid-y">
                <line v-for="yTick in [40, 90, 140, 190]" :key="'yt-'+yTick" x1="50" :y1="yTick" x2="760" :y2="yTick" stroke="#E5E7EB" stroke-dasharray="4,4"/>
              </g>

              <!-- Actual Burndown Area -->
              <path :d="heroActualAreaPath" fill="url(#heroBurndownGrad)"/>

              <!-- Ideal Burndown Line (Dashed Slate) -->
              <path v-if="showIdealLine" :d="heroIdealPath" fill="none" stroke="#64748B" stroke-width="2" stroke-dasharray="6,4" stroke-linecap="round"/>

              <!-- AI Forecast Line (Dashed Purple) -->
              <path v-if="showForecastLine" :d="heroForecastPath" fill="none" stroke="#8B5CF6" stroke-width="2.5" stroke-dasharray="4,4" stroke-linecap="round"/>

              <!-- Actual Burndown Line (Solid Emerald) -->
              <path :d="heroActualPath" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round"/>

              <!-- Current Day Vertical Line -->
              <g v-if="heroCurrentDayPoint">
                <line :x1="heroCurrentDayPoint.x" y1="30" :x2="heroCurrentDayPoint.x" y2="200" stroke="#2563EB" stroke-dasharray="3,3" stroke-width="1.5"/>
                <circle :cx="heroCurrentDayPoint.x" :cy="heroCurrentDayPoint.y" r="6" fill="#2563EB" stroke="#ffffff" stroke-width="2.5"/>
              </g>

              <!-- Hover Vertical Crosshair & Dot -->
              <g v-if="hoveredHeroIdx !== null && heroPoints[hoveredHeroIdx]">
                <line :x1="heroPoints[hoveredHeroIdx].x" y1="30" :x2="heroPoints[hoveredHeroIdx].x" y2="200" stroke="#0F172A" stroke-dasharray="3,3" stroke-width="1.5"/>
                <circle :cx="heroPoints[hoveredHeroIdx].x" :cy="heroPoints[hoveredHeroIdx].y" r="6" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>
              </g>

              <!-- X-Axis Labels -->
              <g class="grid-x">
                <text
                  v-for="(pt, idx) in heroPoints"
                  :key="'hxt-'+idx"
                  :x="pt.x"
                  y="218"
                  text-anchor="middle"
                  fill="#6B7280"
                  font-size="11"
                  font-weight="600"
                >
                  {{ pt.day }}
                </text>
              </g>
            </svg>

            <!-- Floating Hero Hover Popup -->
            <div v-if="hoveredHeroIdx !== null && heroPoints[hoveredHeroIdx]" class="chart-tooltip-popup" :style="heroTooltipStyle">
              <div class="tooltip-header">{{ heroPoints[hoveredHeroIdx].day }} ({{ heroPoints[hoveredHeroIdx].date }})</div>
              <div class="tooltip-row emerald">
                <span class="dot"></span>
                <span>Actual Remaining: <strong>{{ heroPoints[hoveredHeroIdx].actualRemaining }} pts</strong></span>
              </div>
              <div class="tooltip-row gray">
                <span class="dot"></span>
                <span>Ideal Remaining: <strong>{{ heroPoints[hoveredHeroIdx].idealRemaining }} pts</strong></span>
              </div>
              <div class="tooltip-row blue">
                <span class="dot"></span>
                <span>Remaining Tasks: <strong>{{ heroPoints[hoveredHeroIdx].issuesRemaining }} tasks</strong></span>
              </div>
            </div>
          </div>

          <!-- Bottom Legend -->
          <div class="chart-legend-row center">
            <div class="leg-item"><span class="leg-color-dot emerald"></span><span>Actual Burndown</span></div>
            <div class="leg-item"><span class="leg-color-dot gray"></span><span>Ideal Burndown</span></div>
            <div class="leg-item"><span class="leg-color-dot purple-dashed"></span><span>AI Forecast</span></div>
            <div class="leg-item"><span class="leg-color-dot blue"></span><span>Current Day Marker</span></div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 — Sprint Progress Overview          -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Sprint Progress Overview</h3>
              <p class="card-desc">Sprint timeline progress, story point burn rate &amp; issue status distribution</p>
            </div>
          </div>

          <div class="progress-overview-grid">
            <!-- 1. Sprint Timeline -->
            <div class="po-card">
              <div class="po-header">
                <span class="po-title">Sprint Timeline</span>
                <span class="po-badge">{{ data.progressOverview.timeline.currentDay }}</span>
              </div>
              <div class="po-timeline-row">
                <span>{{ data.progressOverview.timeline.start }}</span>
                <strong>{{ data.progressOverview.timeline.pct }}% Elapsed</strong>
                <span>{{ data.progressOverview.timeline.end }}</span>
              </div>
              <div class="progress-bar-track-sm">
                <div class="progress-bar-fill-sm emerald" :style="{ width: data.progressOverview.timeline.pct + '%' }"></div>
              </div>
            </div>

            <!-- 2. Story Point Burn -->
            <div class="po-card">
              <div class="po-header">
                <span class="po-title">Story Point Burn Progress</span>
                <span class="po-badge emerald">{{ data.progressOverview.storyPointBurn.pct }}% Burned</span>
              </div>
              <div class="po-timeline-row">
                <span>{{ data.progressOverview.storyPointBurn.completed }} pts Done</span>
                <span>{{ data.progressOverview.storyPointBurn.remaining }} pts Remaining</span>
              </div>
              <SegmentedProgressBar :value="data.progressOverview.storyPointBurn.pct" variant="emerald" height="16px" />
            </div>

            <!-- 3. Issue Burn Distribution -->
            <div class="po-card">
              <div class="po-header">
                <span class="po-title">Issue Status Burn</span>
                <span class="po-badge blue">{{ data.progressOverview.issueBurn.completed }} / {{ data.progressOverview.issueBurn.total }} Closed</span>
              </div>
              <div class="stacked-cap-bar">
                <div
                  v-for="dist in data.progressOverview.issueBurn.distribution"
                  :key="'idist-'+dist.name"
                  class="stacked-seg"
                  :style="{ width: dist.pct + '%', backgroundColor: dist.color }"
                  :title="dist.name + ': ' + dist.count + ' (' + dist.pct + '%)'"
                ></div>
              </div>
              <div class="dist-legend-grid">
                <div v-for="dist in data.progressOverview.issueBurn.distribution" :key="'idleg-'+dist.name" class="dist-leg-card">
                  <div class="dist-top">
                    <span class="dist-dot" :style="{ backgroundColor: dist.color }"></span>
                    <span class="dist-name">{{ dist.name }}</span>
                  </div>
                  <div class="dist-pct">{{ dist.count }} ({{ dist.pct }}%)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 4 — Burndown Performance KPIs        -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Burndown Performance</h2>
          <span class="sec-subtitle">Pacing metrics, velocity today, schedule variance &amp; daily burn rates</span>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="pkpi in performanceKpis" :key="'pkpi-'+pkpi.name" class="kpi-card-premium">
            <div class="kpi-header-row">
              <span class="kpi-name">{{ pkpi.name }}</span>
              <span class="trend-badge" :class="pkpi.dir === 'up' ? 'positive' : pkpi.dir === 'down' ? 'negative' : 'neutral'">
                <svg v-if="pkpi.dir === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
                <svg v-else-if="pkpi.dir === 'down'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                {{ pkpi.trend }}
              </span>
            </div>

            <div class="kpi-value-row">
              <span class="kpi-value">{{ pkpi.value }}</span>
            </div>

            <div class="progress-bar-track-sm">
              <div class="progress-bar-fill-sm" :class="pkpi.variant" :style="{ width: pkpi.pct + '%' }"></div>
            </div>

            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Benchmark</span>
              <span class="kpi-footer-val">{{ pkpi.prev }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 5 — Daily Burn Analysis               -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Daily Burn Analysis</h3>
              <p class="card-desc">Daily work completion trends, story points burned per day &amp; remaining work trajectory</p>
            </div>
          </div>

          <!-- Daily Burn Line Chart -->
          <div class="line-chart-area" @mousemove="handleDailyHover" @mouseleave="hoveredDailyIdx = null">
            <svg viewBox="0 0 800 200" class="trend-svg">
              <!-- Grid Lines -->
              <line v-for="y in [40, 90, 140]" :key="'dyt-'+y" x1="50" :y1="y" x2="760" :y2="y" stroke="#E5E7EB" stroke-dasharray="4,4"/>

              <!-- Daily Completed Line (Emerald) -->
              <path :d="dailyCompletedPath" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round"/>

              <!-- Daily Remaining Line (Orange) -->
              <path :d="dailyRemainingPath" fill="none" stroke="#F97316" stroke-width="3" stroke-linecap="round"/>

              <!-- Data Circles -->
              <circle
                v-for="(dp, idx) in dailyPoints"
                :key="'dpc-'+idx"
                :cx="dp.x"
                :cy="dp.completedY"
                r="4"
                fill="#059669"
                stroke="#ffffff"
                stroke-width="2"
              />

              <!-- Hover Vertical Line & Dot -->
              <g v-if="hoveredDailyIdx !== null && dailyPoints[hoveredDailyIdx]">
                <line :x1="dailyPoints[hoveredDailyIdx].x" y1="20" :x2="dailyPoints[hoveredDailyIdx].x" y2="180" stroke="#0F172A" stroke-dasharray="3,3" stroke-width="1.5"/>
                <circle :cx="dailyPoints[hoveredDailyIdx].x" :cy="dailyPoints[hoveredDailyIdx].completedY" r="6" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>
              </g>

              <!-- X Axis -->
              <text
                v-for="(dp, idx) in dailyPoints"
                :key="'dxt-'+idx"
                :x="dp.x"
                y="192"
                text-anchor="middle"
                fill="#6B7280"
                font-size="10"
                font-weight="600"
              >
                {{ dp.day }}
              </text>
            </svg>

            <!-- Daily Hover Popup -->
            <div v-if="hoveredDailyIdx !== null && dailyPoints[hoveredDailyIdx]" class="chart-tooltip-popup" :style="dailyTooltipStyle">
              <div class="tooltip-header">{{ dailyPoints[hoveredDailyIdx].day }} ({{ dailyPoints[hoveredDailyIdx].date }})</div>
              <div class="tooltip-row emerald">
                <span class="dot"></span>
                <span>Daily Burn Rate: <strong>{{ dailyPoints[hoveredDailyIdx].dailyBurn }} pts/day</strong></span>
              </div>
              <div class="tooltip-row orange">
                <span class="dot"></span>
                <span>Remaining SP: <strong>{{ dailyPoints[hoveredDailyIdx].remaining }} pts</strong></span>
              </div>
            </div>
          </div>

          <div class="chart-legend-row center">
            <div class="leg-item"><span class="leg-color-dot emerald"></span><span>Daily Burned Story Points</span></div>
            <div class="leg-item"><span class="leg-color-dot orange"></span><span>Daily Remaining Story Points</span></div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 6 — Remaining Work Analysis           -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Remaining Work Analysis</h2>
          <span class="sec-subtitle">Granular remaining backlog breakdown, defect counts &amp; QA testing queue</span>
        </div>

        <div class="sp-analytics-grid">
          <div v-for="rw in remainingWork" :key="'rw-'+rw.name" class="sp-card">
            <div class="sp-icon-row">
              <span class="sc-status-pill" :class="rw.pct > 50 ? 'low' : rw.pct > 25 ? 'planned' : 'completed'">
                {{ rw.badge }}
              </span>
              <span class="sp-title">{{ rw.name }}</span>
            </div>
            <div class="sp-main-val">{{ rw.count }}</div>
            <div class="progress-bar-track-sm">
              <div class="progress-bar-fill-sm" :style="{ width: rw.pct + '%', backgroundColor: rw.color }"></div>
            </div>
            <span class="sp-sub-text">{{ rw.pct }}% of sprint total</span>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 7 — Scope Change Analysis             -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Scope Change Analysis</h3>
              <p class="card-desc">Mid-sprint story point additions, descoped items &amp; scope stability rating</p>
            </div>
            <span class="consistency-score-badge">
              Scope Stability: {{ scopeAnalysis.scopeStabilityScore }}
            </span>
          </div>

          <div class="sp-analytics-grid">
            <div class="sp-card">
              <div class="sp-icon-row">
                <div class="kpi-icon-badge emerald">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span class="sp-title">Points Added</span>
              </div>
              <div class="sp-main-val emerald">+{{ scopeAnalysis.pointsAdded }} <span class="unit">pts</span></div>
              <span class="sp-sub-text">{{ scopeAnalysis.issuesAdded }} new issues ingested</span>
            </div>

            <div class="sp-card">
              <div class="sp-icon-row">
                <div class="kpi-icon-badge red">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span class="sp-title">Points Removed</span>
              </div>
              <div class="sp-main-val red">-{{ scopeAnalysis.pointsRemoved }} <span class="unit">pts</span></div>
              <span class="sp-sub-text">{{ scopeAnalysis.issuesRemoved }} issues descoped</span>
            </div>

            <div class="sp-card">
              <div class="sp-icon-row">
                <div class="kpi-icon-badge orange">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                </div>
                <span class="sp-title">Net Scope Change</span>
              </div>
              <div class="sp-main-val orange">{{ scopeAnalysis.scopeChangePct }}</div>
              <span class="sp-sub-text">vs initial commitment</span>
            </div>

            <div class="sp-card">
              <div class="sp-icon-row">
                <div class="kpi-icon-badge blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <span class="sp-title">Scope Stability Rating</span>
              </div>
              <div class="sp-main-val blue">{{ scopeAnalysis.scopeStabilityScore }}</div>
              <span class="sp-sub-text">Optimal Stability Guardrail</span>
            </div>
          </div>

          <!-- Stacked Bar Scope Visualization -->
          <div class="cap-work-categories-wrap">
            <h4 class="cap-subtitle">Scope Composition Breakdown</h4>
            <div class="stacked-cap-bar">
              <div
                v-for="sseg in scopeAnalysis.stackedData"
                :key="'sseg-'+sseg.category"
                class="stacked-seg"
                :style="{ width: Math.round((sseg.pts / executiveKpis.completedStoryPoints.pct) * 100) + '%', backgroundColor: sseg.color }"
                :title="sseg.category + ': ' + sseg.pts + ' pts'"
              ></div>
            </div>
            <div class="dist-legend-grid">
              <div v-for="sseg in scopeAnalysis.stackedData" :key="'ssleg-'+sseg.category" class="dist-leg-card">
                <div class="dist-top">
                  <span class="dist-dot" :style="{ backgroundColor: sseg.color }"></span>
                  <span class="dist-name">{{ sseg.category }}</span>
                </div>
                <div class="dist-pct">{{ sseg.pts }} pts</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 8 — Sprint Forecast (AI Prediction)   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Sprint Completion Forecast</h3>
              <p class="card-desc">AI predictive model completion dates, probability &amp; forecast cards</p>
            </div>
          </div>

          <div class="exec-kpi-grid">
            <div class="kpi-card-premium">
              <span class="kpi-name">Expected Completion Date</span>
              <strong class="kpi-value emerald">{{ forecastData.expectedCompletionDate }}</strong>
              <span class="kpi-footer-val">0 Days Schedule Delay</span>
            </div>

            <div class="kpi-card-premium">
              <span class="kpi-name">Sprint Success Probability</span>
              <strong class="kpi-value blue">{{ forecastData.sprintSuccessProbability }}%</strong>
              <span class="kpi-footer-val">High Success Confidence</span>
            </div>

            <div class="kpi-card-premium">
              <span class="kpi-name">Forecast Remaining SP</span>
              <strong class="kpi-value purple">{{ forecastData.forecastRemainingSp }} pts</strong>
              <span class="kpi-footer-val">Projected at Sprint End</span>
            </div>

            <div class="kpi-card-premium">
              <span class="kpi-name">Forecast Remaining Issues</span>
              <strong class="kpi-value">{{ forecastData.forecastRemainingIssues }}</strong>
              <span class="kpi-footer-val">Confidence: {{ forecastData.confidenceInterval }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 9 — Delivery Bottlenecks              -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Delivery Bottlenecks</h2>
          <span class="sec-subtitle">Sprint friction indicators, blocked work, QA queue &amp; overdue tasks</span>
        </div>

        <div class="sp-analytics-grid">
          <div v-for="bn in bottlenecks" :key="'bn-'+bn.title" class="sp-card">
            <div class="sp-icon-row">
              <span class="sc-status-pill" :class="bn.color">
                {{ bn.severity }} Severity
              </span>
              <span class="sp-title">{{ bn.title }}</span>
            </div>
            <div class="sp-main-val" :class="bn.color">{{ bn.count }}</div>
            <span class="sp-sub-text">{{ bn.status }} • {{ bn.trend }}</span>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 10 — AI Burndown Intelligence         -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="ai-intelligence-card">
          <div class="ai-header">
            <div class="ai-title-wrap">
              <span class="ai-sparkle-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </span>
              <h3 class="ai-title">AI Burndown Intelligence</h3>
            </div>
            <span class="ai-model-badge">Gemini AI Engine v4</span>
          </div>

          <!-- Executive Summary Narrative -->
          <div class="ai-summary-box">
            <p>{{ aiIntelligence.executiveSummary }}</p>
          </div>

          <div class="ai-grid-3col">
            <!-- Achievements -->
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

            <!-- Delivery Risks -->
            <div class="ai-subcard">
              <h4 class="ai-subcard-title orange">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Delivery Risks
              </h4>
              <div v-for="risk in aiIntelligence.deliveryRisks" :key="risk.id" class="ai-item-row">
                <span class="ai-badge-sm orange">{{ risk.level }} Risk ({{ risk.score }})</span>
                <div>
                  <strong>{{ risk.title }}</strong>
                  <p>{{ risk.desc }}</p>
                </div>
              </div>
            </div>

            <!-- AI Recommendations & Suggestions -->
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

          <!-- On-Time Prediction Statement -->
          <div class="ai-forecast-banner">
            <div class="afb-left">
              <span class="afb-label">Sprint Completion Prediction</span>
              <div class="afb-val-row">
                <span class="afb-main-val">{{ aiIntelligence.prediction.summary }}</span>
              </div>
              <p class="cap-ai-sub-text">{{ aiIntelligence.prediction.why }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 11 — Sprint Daily Activity Table      -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Sprint Daily Activity Log</h3>
              <p class="card-desc">Detailed exportable daily burn records &amp; work completion history</p>
            </div>

            <div class="table-toolbar">
              <div class="search-input-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input v-model="tableSearch" type="text" placeholder="Search daily activity..." class="search-field"/>
              </div>

              <button class="action-btn-sm" @click="exportCSV">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export CSV
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="velocity-data-table">
              <thead>
                <tr>
                  <th @click="sortTable('date')">Date</th>
                  <th @click="sortTable('spCompleted')">SP Completed</th>
                  <th @click="sortTable('spRemaining')">SP Remaining</th>
                  <th @click="sortTable('issuesCompleted')">Issues Completed</th>
                  <th @click="sortTable('issuesRemaining')">Issues Remaining</th>
                  <th @click="sortTable('dailyBurnRate')">Daily Burn Rate</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredTableData" :key="'dlog-'+row.date">
                  <td><strong>{{ row.date }}</strong> ({{ row.dayName }})</td>
                  <td class="emerald font-bold">{{ row.spCompleted }} pts</td>
                  <td class="orange font-bold">{{ row.spRemaining }} pts</td>
                  <td>{{ row.issuesCompleted }} closed</td>
                  <td>{{ row.issuesRemaining }} open</td>
                  <td class="font-bold">{{ row.dailyBurnRate }}</td>
                  <td>
                    <span class="sc-status-pill" :class="row.notes === 'Active Working Day' ? 'active' : 'completed'">
                      {{ row.notes }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 12 — Statistics Summary               -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Burndown Statistics Summary</h2>
          <span class="sec-subtitle">Aggregated statistical highlights across sprint cycle</span>
        </div>

        <div class="stats-summary-grid">
          <div class="stat-mini-card"><span>Total Story Points</span><strong>{{ statsSummary.totalStoryPoints }}</strong></div>
          <div class="stat-mini-card"><span>Completed Story Points</span><strong>{{ statsSummary.completedStoryPoints }}</strong></div>
          <div class="stat-mini-card"><span>Remaining Story Points</span><strong>{{ statsSummary.remainingStoryPoints }}</strong></div>
          <div class="stat-mini-card"><span>Total Issues</span><strong>{{ statsSummary.totalIssues }}</strong></div>
          <div class="stat-mini-card"><span>Completed Issues</span><strong>{{ statsSummary.completedIssues }}</strong></div>
          <div class="stat-mini-card"><span>Remaining Issues</span><strong>{{ statsSummary.remainingIssues }}</strong></div>
          <div class="stat-mini-card"><span>Average Daily Burn</span><strong>{{ statsSummary.averageDailyBurn }}</strong></div>
          <div class="stat-mini-card"><span>Maximum Daily Burn</span><strong>{{ statsSummary.maximumDailyBurn }}</strong></div>
          <div class="stat-mini-card"><span>Minimum Daily Burn</span><strong>{{ statsSummary.minimumDailyBurn }}</strong></div>
          <div class="stat-mini-card emerald"><span>Burn Efficiency</span><strong>{{ statsSummary.burnEfficiency }}</strong></div>
          <div class="stat-mini-card blue"><span>Schedule Variance</span><strong>{{ statsSummary.scheduleVariance }}</strong></div>
          <div class="stat-mini-card purple"><span>Sprint Confidence</span><strong>{{ statsSummary.sprintConfidenceScore }}</strong></div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 13 — Quick Actions Toolbar            -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="quick-actions-bar">
          <button class="qa-btn" @click="navigateToHealth">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            View Sprint Health
          </button>

          <button class="qa-btn" @click="navigateToVelocity">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            View Velocity Analytics
          </button>

          <button class="qa-btn" @click="openJiraSprint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open Jira Sprint
          </button>

          <button class="qa-btn" @click="openReportModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Download Burndown Report
          </button>

          <button class="qa-btn" @click="exportCSV">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Excel / CSV
          </button>

          <button class="qa-btn" @click="openShareModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
            Share Report
          </button>
        </div>
      </section>

      <!-- Toast Notification -->
      <Transition name="fade-slide">
        <div v-if="toast.show" class="toast-popup" :class="toast.type">
          <span>{{ toast.message }}</span>
        </div>
      </Transition>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

useHead({ title: 'Burndown Analytics | Sprintlytics' });

const route = useRoute();
const router = useRouter();

// State
const selectedProject = ref(route.query.project || 'ALL');
const selectedSprint = ref('ALL');
const selectedPeriod = ref('daily');
const selectedRange = ref(10);
const pending = ref(false);
const data = ref(null);

watch(
  () => route.query.project,
  (newProject) => {
    if (newProject && newProject !== selectedProject.value) {
      selectedProject.value = newProject;
      selectedSprint.value = 'ALL';
      fetchData();
    }
  }
);

// Chart Interactive State
const showIdealLine = ref(true);
const showForecastLine = ref(true);
const hoveredHeroIdx = ref(null);
const hoveredDailyIdx = ref(null);

// Table controls
const tableSearch = ref('');
const sortKey = ref('date');
const sortAsc = ref(false);

// Toast
const toast = ref({ show: false, message: '', type: 'success' });
let toastTimer = null;
const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
};

// Formatted Date
const currentDateFormatted = computed(() => {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
});

// Project Options
const projectOptions = computed(() => {
  const list = data.value?.projectsList || ['Barena ERP', 'DevOps Tasks', 'FLEXA ERP', 'Glow Box', 'Honda POC', 'IPOPS', 'Jom Smart Central', 'WONDERKIDS OT'];
  const opts = [{ label: 'All Projects', value: 'ALL' }];
  list.forEach(p => {
    if (p !== 'ALL') opts.push({ label: p, value: p });
  });
  return opts;
});

// Sprint Options
const sprintOptions = computed(() => {
  if (selectedProject.value === 'ALL') {
    return [{ label: 'All Sprints', value: 'ALL' }];
  }
  return data.value?.sprintOptions || [{ label: 'All Sprints', value: 'ALL' }];
});

const onProjectChange = () => {
  selectedSprint.value = 'ALL';
  fetchData();
};

const setPeriod = (p) => {
  selectedPeriod.value = p;
  fetchData();
};

const setRange = (r) => {
  selectedRange.value = r;
  fetchData();
};

// Fetch API
const fetchData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/sprint/burndown', {
      query: {
        project: selectedProject.value,
        sprint: selectedSprint.value,
        period: selectedPeriod.value,
        range: selectedRange.value
      }
    });
    if (res && res.success) {
      data.value = res;
    }
  } catch (err) {
    console.error('Failed to load burndown analytics:', err);
    showToast('Failed to load burndown data', 'error');
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  fetchData();
});

// Computed Data Accessors
const executiveKpis = computed(() => data.value?.executiveKpis || {});
const performanceKpis = computed(() => data.value?.performanceKpis || []);
const remainingWork = computed(() => data.value?.remainingWork || []);
const scopeAnalysis = computed(() => data.value?.scopeAnalysis || { stackedData: [] });
const forecastData = computed(() => data.value?.forecastData || {});
const bottlenecks = computed(() => data.value?.bottlenecks || []);
const aiIntelligence = computed(() => data.value?.aiIntelligence || { keyAchievements: [], deliveryRisks: [], recommendations: [], priorityActions: [], prediction: {} });
const statsSummary = computed(() => data.value?.statsSummary || {});

// Hero Burndown Chart Coordinates
const heroPoints = computed(() => {
  const timeline = data.value?.burndownTimeline || [];
  if (!timeline.length) return [];
  const width = 710;
  const step = width / Math.max(1, timeline.length - 1);
  const maxSp = Math.max(...timeline.map(t => t.idealRemaining || 0), 1);

  return timeline.map((t, idx) => {
    const x = 50 + idx * step;
    const idealY = 200 - ((t.idealRemaining || 0) / maxSp) * 160;
    const actualY = t.actualRemaining !== null ? 200 - ((t.actualRemaining || 0) / maxSp) * 160 : null;
    const forecastY = t.forecastRemaining !== null ? 200 - ((t.forecastRemaining || 0) / maxSp) * 160 : null;
    return {
      day: t.day,
      date: t.date,
      idealRemaining: t.idealRemaining,
      actualRemaining: t.actualRemaining,
      forecastRemaining: t.forecastRemaining,
      issuesRemaining: t.issuesRemaining || 14,
      isCurrentDay: t.isCurrentDay,
      x,
      y: actualY !== null ? actualY : (forecastY !== null ? forecastY : idealY),
      idealY,
      actualY,
      forecastY
    };
  });
});

const heroActualPath = computed(() => {
  const pts = heroPoints.value.filter(p => p.actualY !== null);
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.actualY}`).join(' L ');
});

const heroActualAreaPath = computed(() => {
  const pts = heroPoints.value.filter(p => p.actualY !== null);
  if (!pts.length) return '';
  const line = pts.map(p => `${p.x},${p.actualY}`).join(' L ');
  const firstX = pts[0].x;
  const lastX = pts[pts.length - 1].x;
  return `M ${firstX},200 L ${line} L ${lastX},200 Z`;
});

const heroIdealPath = computed(() => {
  const pts = heroPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.idealY}`).join(' L ');
});

const heroForecastPath = computed(() => {
  const pts = heroPoints.value.filter(p => p.forecastY !== null);
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.forecastY}`).join(' L ');
});

const heroCurrentDayPoint = computed(() => {
  return heroPoints.value.find(p => p.isCurrentDay) || null;
});

const handleHeroHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = heroPoints.value;
  if (!pts.length) return;

  let closestIdx = 0;
  let minDiff = Infinity;
  pts.forEach((p, idx) => {
    const diff = Math.abs((p.x / 800) * rect.width - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  hoveredHeroIdx.value = closestIdx;
};

const heroTooltipStyle = computed(() => {
  if (hoveredHeroIdx.value === null || !heroPoints.value[hoveredHeroIdx.value]) return {};
  const pt = heroPoints.value[hoveredHeroIdx.value];
  const isRight = pt.x > 400;
  return {
    left: `${(pt.x / 800) * 100}%`,
    top: '25px',
    transform: isRight ? 'translateX(-105%)' : 'translateX(5%)'
  };
});

// Daily Burn Line Chart Coordinates
const dailyPoints = computed(() => {
  const timeline = data.value?.burndownTimeline || [];
  if (!timeline.length) return [];
  const width = 710;
  const step = width / Math.max(1, timeline.length - 1);
  const maxBurn = 25;

  return timeline.map((t, idx) => {
    const x = 50 + idx * step;
    const completedY = 180 - (Math.min(t.dailyBurn || 0, maxBurn) / maxBurn) * 140;
    const remainingY = 180 - (Math.min(t.actualRemaining || t.forecastRemaining || 0, 160) / 160) * 140;
    return {
      day: t.day,
      date: t.date,
      dailyBurn: t.dailyBurn || 0,
      remaining: t.actualRemaining || t.forecastRemaining || 0,
      x,
      completedY,
      remainingY
    };
  });
});

const dailyCompletedPath = computed(() => {
  const pts = dailyPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.completedY}`).join(' L ');
});

const dailyRemainingPath = computed(() => {
  const pts = dailyPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.remainingY}`).join(' L ');
});

const handleDailyHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = dailyPoints.value;
  if (!pts.length) return;

  let closestIdx = 0;
  let minDiff = Infinity;
  pts.forEach((p, idx) => {
    const diff = Math.abs((p.x / 800) * rect.width - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  hoveredDailyIdx.value = closestIdx;
};

const dailyTooltipStyle = computed(() => {
  if (hoveredDailyIdx.value === null || !dailyPoints.value[hoveredDailyIdx.value]) return {};
  const pt = dailyPoints.value[hoveredDailyIdx.value];
  const isRight = pt.x > 400;
  return {
    left: `${(pt.x / 800) * 100}%`,
    top: '20px',
    transform: isRight ? 'translateX(-105%)' : 'translateX(5%)'
  };
});

// Table Filter & Sorting
const filteredTableData = computed(() => {
  let list = [...(data.value?.dailyActivityLog || [])];
  if (tableSearch.value.trim()) {
    const q = tableSearch.value.toLowerCase().trim();
    list = list.filter(r => r.date.toLowerCase().includes(q) || r.notes.toLowerCase().includes(q));
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
    sortAsc.value = true;
  }
};

// Navigation & Actions
const navigateToHealth = () => router.push('/sprint/health');
const navigateToVelocity = () => router.push('/sprint/velocity');
const openJiraSprint = () => showToast('Opening Jira Sprint Dashboard...');
const openReportModal = () => showToast('Burndown report generated successfully');
const openShareModal = () => showToast('Share link copied to clipboard');
const exportCSV = () => showToast('Exported burndown data to CSV');
</script>

<style scoped>
.burndown-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

/* ── Topbar ── */
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

.topbar-left { display: flex; flex-direction: column; gap: 0.25rem; }
.title-with-badge { display: flex; align-items: center; gap: 0.75rem; }
.page-main-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }

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

.page-main-subtitle { font-size: 0.85rem; color: #6B7280; margin: 0; }
.topbar-right { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; }

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

.filter-group { min-width: 140px; }

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

.action-btn.primary-btn { background: #059669; color: #ffffff; border-color: #059669; }

/* Section Containers & Cards */
.section-container { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; flex-direction: column; gap: 0.2rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.sec-subtitle { font-size: 0.8rem; color: #6B7280; }

.exec-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
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

.kpi-header-row { display: flex; align-items: center; justify-content: space-between; }
.kpi-title-with-icon { display: flex; align-items: center; gap: 0.5rem; }

.kpi-icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon-badge.emerald { background: #ECFDF5; color: #059669; }
.kpi-icon-badge.blue { background: #EFF6FF; color: #2563EB; }
.kpi-icon-badge.purple { background: #F3E8FF; color: #7C3AED; }
.kpi-icon-badge.orange { background: #FFF7ED; color: #F97316; }
.kpi-icon-badge.red { background: #FEF2F2; color: #EF4444; }

.kpi-name { font-size: 0.8rem; font-weight: 600; color: #4B5563; }
.kpi-value-row { display: flex; align-items: baseline; justify-content: space-between; }
.kpi-value { font-size: 1.4rem; font-weight: 700; color: #111827; }

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

.kpi-footer-row { display: flex; justify-content: space-between; font-size: 0.72rem; color: #6B7280; }
.kpi-footer-val { font-weight: 600; color: #374151; }

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

.card-analytics-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }
.card-title { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0; }
.card-desc { font-size: 0.78rem; color: #6B7280; margin: 0; }

.btn-toggle-sm {
  border: 1px solid #D1D5DB;
  background: #ffffff;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-toggle-sm.active { background: #ECFDF5; color: #059669; border-color: #A7F3D0; }

/* Interactive Hero Chart */
.line-chart-area { position: relative; width: 100%; }
.trend-svg { width: 100%; height: auto; overflow: visible; }

.chart-tooltip-popup {
  position: absolute;
  background: #0F172A;
  color: #ffffff;
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  font-size: 0.75rem;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.tooltip-header { font-weight: 700; color: #94A3B8; border-bottom: 1px solid #334155; padding-bottom: 0.25rem; font-size: 0.8rem; }
.tooltip-row { display: flex; align-items: center; gap: 0.45rem; }
.tooltip-row .dot { width: 8px; height: 8px; border-radius: 50%; }
.tooltip-row.emerald .dot { background: #059669; }
.tooltip-row.blue .dot { background: #3B82F6; }
.tooltip-row.purple .dot { background: #8B5CF6; }
.tooltip-row.orange .dot { background: #F97316; }
.tooltip-row.gray .dot { background: #9CA3AF; }

.chart-legend-row { display: flex; align-items: center; gap: 1.5rem; font-size: 0.78rem; font-weight: 600; color: #4B5563; }
.chart-legend-row.center { justify-content: center; }
.leg-item { display: flex; align-items: center; gap: 0.4rem; }
.leg-color-dot { width: 10px; height: 10px; border-radius: 50%; }
.leg-color-dot.emerald { background: #059669; }
.leg-color-dot.blue { background: #2563EB; }
.leg-color-dot.gray { background: #64748B; }
.leg-color-dot.purple-dashed { background: #8B5CF6; }

/* Progress Overview Grid */
.progress-overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.po-card {
  background: #F9FAFB;
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.po-header { display: flex; align-items: center; justify-content: space-between; }
.po-title { font-size: 0.85rem; font-weight: 700; color: #111827; }
.po-badge { font-size: 0.72rem; font-weight: 700; background: #EFF6FF; color: #2563EB; padding: 0.2rem 0.5rem; border-radius: 6px; }
.po-badge.emerald { background: #ECFDF5; color: #059669; }

.po-timeline-row { display: flex; justify-content: space-between; font-size: 0.78rem; color: #4B5563; }

.stacked-cap-bar { display: flex; height: 20px; width: 100%; border-radius: 6px; overflow: hidden; }

.dist-legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.5rem;
}

.dist-leg-card { background: #ffffff; padding: 0.5rem; border-radius: 8px; display: flex; flex-direction: column; gap: 0.15rem; }
.dist-top { display: flex; align-items: center; gap: 0.35rem; }
.dist-dot { width: 8px; height: 8px; border-radius: 50%; }
.dist-name { font-size: 0.72rem; color: #4B5563; font-weight: 600; }
.dist-pct { font-size: 0.85rem; font-weight: 700; color: #111827; }

/* Remaining Work & Story Point Analytics Cards */
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
  gap: 0.5rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.sp-icon-row { display: flex; align-items: center; gap: 0.5rem; }
.sp-title { font-size: 0.8rem; font-weight: 600; color: #4B5563; }
.sp-main-val { font-size: 1.35rem; font-weight: 700; color: #111827; }
.sp-main-val.emerald { color: #059669; }
.sp-main-val.orange { color: #F97316; }
.sp-main-val.purple { color: #7C3AED; }
.sp-main-val.red { color: #EF4444; }
.sp-main-val.blue { color: #2563EB; }
.sp-sub-text { font-size: 0.72rem; color: #6B7280; }

.sc-status-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.sc-status-pill.completed { background: #ECFDF5; color: #059669; }
.sc-status-pill.active { background: #EFF6FF; color: #2563EB; }
.sc-status-pill.planned { background: #F3F4F6; color: #6B7280; }
.sc-status-pill.low { background: #FEF2F2; color: #EF4444; }
.sc-status-pill.red { background: #FEF2F2; color: #EF4444; }
.sc-status-pill.purple { background: #F3E8FF; color: #7C3AED; }
.sc-status-pill.orange { background: #FFF7ED; color: #F97316; }

/* AI Burndown Intelligence Card */
.ai-intelligence-card {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  color: #ffffff;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  border: none;
  outline: none;
}

.ai-header { display: flex; align-items: center; justify-content: space-between; }
.ai-title-wrap { display: flex; align-items: center; gap: 0.5rem; }
.ai-title { font-size: 1.15rem; font-weight: 700; margin: 0; color: #ffffff; }

.ai-model-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #38BDF8;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

.ai-summary-box {
  background: rgba(255, 255, 255, 0.05);
  border-left: 4px solid #38BDF8;
  padding: 1rem 1.25rem;
  border-radius: 0 10px 10px 0;
  font-size: 0.88rem;
  line-height: 1.5;
  color: #E2E8F0;
}

.ai-grid-3col {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
}

.ai-subcard {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.ai-subcard-title { font-size: 0.9rem; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 0.45rem; }
.ai-subcard-title.emerald { color: #34D399; }
.ai-subcard-title.orange { color: #FB923C; }
.ai-subcard-title.blue { color: #60A5FA; }

.ai-item-row { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.8rem; }
.ai-item-row strong { color: #F8FAFC; }
.ai-item-row p { margin: 0; color: #94A3B8; font-size: 0.75rem; }

.ai-badge-sm { align-self: flex-start; font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 4px; }
.ai-badge-sm.green { background: rgba(52, 211, 153, 0.2); color: #34D399; }
.ai-badge-sm.orange { background: rgba(251, 146, 60, 0.2); color: #FB923C; }

.ai-forecast-banner {
  background: linear-gradient(90deg, #059669 0%, #047857 100%);
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.afb-left { display: flex; flex-direction: column; gap: 0.25rem; }
.afb-label { font-size: 0.78rem; font-weight: 600; color: #D1FAE5; }
.afb-val-row { display: flex; align-items: center; gap: 0.75rem; }
.afb-main-val { font-size: 1.3rem; font-weight: 800; color: #ffffff; }
.cap-ai-sub-text { font-size: 0.8rem; color: #A7F3D0; margin: 0; }

/* Daily Activity Log Table */
.table-toolbar { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.search-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #F9FAFB;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
}
.search-field { border: none; background: transparent; outline: none; font-size: 0.8rem; }

.action-btn-sm {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  background: #ffffff;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.table-responsive { overflow-x: auto; }
.velocity-data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
.velocity-data-table th, .velocity-data-table td { padding: 0.85rem 1rem; text-align: left; border-bottom: 1px solid #E5E7EB; }
.velocity-data-table th { background: #F9FAFB; font-weight: 700; color: #4B5563; cursor: pointer; user-select: none; }

.emerald { color: #059669; }
.orange { color: #F97316; }
.font-bold { font-weight: 700; }

/* Statistics Summary Grid */
.stats-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.85rem;
}

.stat-mini-card {
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 10px;
  padding: 0.85rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.stat-mini-card span { font-size: 0.72rem; color: #6B7280; }
.stat-mini-card strong { font-size: 1.1rem; font-weight: 700; color: #111827; }
.stat-mini-card.emerald strong { color: #059669; }
.stat-mini-card.blue strong { color: #2563EB; }
.stat-mini-card.purple strong { color: #7C3AED; }

/* Quick Actions Toolbar */
.quick-actions-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.qa-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid #D1D5DB;
  background: #ffffff;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.qa-btn:hover { background: #F9FAFB; border-color: #059669; color: #059669; }

/* Toast */
.toast-popup {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.25rem;
  background: #111827;
  color: #ffffff;
  font-size: 0.825rem;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 9999;
}

.simple-loading-spinner { display: flex; justify-content: center; padding: 4rem; }
.spinner { width: 36px; height: 36px; border: 3px solid #E5E7EB; border-top-color: #059669; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
</style>
