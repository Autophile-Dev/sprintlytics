<template>
  <div class="velocity-analytics-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Velocity Analytics</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            AI Powered
          </span>
        </div>
        <p class="page-main-subtitle">Delivery consistency, story point trends, capacity planning &amp; AI forecasting</p>
      </div>

      <div class="topbar-right">
        <!-- Report Type Pills -->
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
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><polygon points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <h2>No Velocity Data Found</h2>
      <p>No performance analytics records found for <strong>{{ selectedProject }}</strong>.</p>
    </div>

    <!-- ── MAIN CONTENT VIEW ── -->
    <template v-else>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Velocity Executive Overview        -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Velocity Executive Overview</h2>
            <span class="sec-subtitle">Key performance metrics and delivery indicators vs previous period</span>
          </div>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="(kpi, key) in executiveKpis" :key="key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="key === 'currentVelocity'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <svg v-else-if="key === 'averageVelocity'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <svg v-else-if="key === 'previousVelocity'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else-if="key === 'velocityChange'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg v-else-if="key === 'deliveryConsistency'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <svg v-else-if="key === 'predictabilityScore'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <svg v-else-if="key === 'capacityUtilization'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
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
      <!-- SECTION 2 — Velocity Trend Analysis            -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Velocity Trend Analysis</h3>
              <p class="card-desc">Sprint-over-sprint velocity vs planned story points and 3-sprint moving average</p>
            </div>
            <div class="chart-controls">
              <button
                class="btn-toggle-sm"
                :class="{ active: comparePrevious }"
                @click="comparePrevious = !comparePrevious"
              >
                Compare Previous Sprints
              </button>
            </div>
          </div>

          <!-- Main Interactive SVG Line Chart -->
          <div class="line-chart-area" @mousemove="handleTrendChartHover" @mouseleave="hoveredTrendIdx = null">
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="trend-svg">
              <defs>
                <linearGradient id="emeraldVelGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#059669" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#059669" stop-opacity="0.00"/>
                </linearGradient>
              </defs>

              <!-- Grid Y Lines -->
              <g class="grid-y">
                <g v-for="tick in yGridTicks" :key="'yt-'+tick.val">
                  <line :x1="margin.left" :y1="tick.y" :x2="chartWidth - margin.right" :y2="tick.y" stroke="#E5E7EB" stroke-dasharray="4,4"/>
                  <text :x="margin.left - 10" :y="tick.y + 4" text-anchor="end" fill="#9CA3AF" font-size="11" font-weight="600">{{ tick.val }} pts</text>
                </g>
              </g>

              <!-- Area under velocity curve -->
              <path :d="velocityAreaPath" fill="url(#emeraldVelGrad)" />

              <!-- Planned Line (Light Blue Dashed) -->
              <path :d="plannedLinePath" fill="none" stroke="#3B82F6" stroke-width="2.5" stroke-dasharray="6,4" stroke-linecap="round"/>

              <!-- Velocity Completed Line (Emerald Solid) -->
              <path :d="velocityLinePath" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round"/>

              <!-- Moving Average Line (Purple Dotted) -->
              <path :d="movingAvgLinePath" fill="none" stroke="#8B5CF6" stroke-width="2" stroke-dasharray="3,3"/>

              <!-- Hover Vertical Crosshair & Dots -->
              <g v-if="hoveredTrendIdx !== null">
                <line
                  :x1="trendPoints[hoveredTrendIdx].x"
                  :y1="margin.top"
                  :x2="trendPoints[hoveredTrendIdx].x"
                  :y2="chartHeight - margin.bottom"
                  stroke="#64748B"
                  stroke-width="1.5"
                  stroke-dasharray="4,4"
                />
                <circle :cx="trendPoints[hoveredTrendIdx].x" :cy="trendPoints[hoveredTrendIdx].completedY" r="6" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>
                <circle :cx="trendPoints[hoveredTrendIdx].x" :cy="trendPoints[hoveredTrendIdx].plannedY" r="5" fill="#3B82F6" stroke="#ffffff" stroke-width="2"/>
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

            <!-- Floating Hover Tooltip -->
            <div
              v-if="hoveredTrendIdx !== null"
              class="chart-tooltip-popup"
              :style="tooltipStyle"
            >
              <div class="tooltip-header">{{ trendPoints[hoveredTrendIdx].sprint }}</div>
              <div class="tooltip-row emerald">
                <span class="dot"></span>
                <span>Completed Velocity: <strong>{{ trendPoints[hoveredTrendIdx].completed }} pts</strong></span>
              </div>
              <div class="tooltip-row blue">
                <span class="dot"></span>
                <span>Planned Points: <strong>{{ trendPoints[hoveredTrendIdx].planned }} pts</strong></span>
              </div>
              <div class="tooltip-row purple">
                <span class="dot"></span>
                <span>Moving Avg: <strong>{{ trendPoints[hoveredTrendIdx].movingAverage }} pts</strong></span>
              </div>
            </div>
          </div>

          <!-- Bottom Chart Legend -->
          <div class="chart-legend-row">
            <div class="leg-item"><span class="leg-color-dot emerald"></span><span>Completed Velocity</span></div>
            <div class="leg-item"><span class="leg-color-dot blue-dashed"></span><span>Planned Story Points</span></div>
            <div class="leg-item"><span class="leg-color-dot purple-dotted"></span><span>3-Sprint Moving Average</span></div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 & SECTION 4 (Side-by-side Dual Charts) -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container dual-grid">

        <!-- SECTION 3 — Planned vs Completed Story Points -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Planned vs Completed Story Points</h3>
              <p class="card-desc">Grouped bar comparison of committed vs delivered story points</p>
            </div>
          </div>

          <div class="bar-chart-track" @mouseleave="hoveredBarIdx = null">
            <div
              v-for="(s, idx) in historySprints"
              :key="'bar-'+s.id"
              class="bar-group-col"
              @mouseenter="hoveredBarIdx = idx"
            >
              <!-- Callout Floating Popup -->
              <Transition name="pop-fade">
                <div v-if="hoveredBarIdx === idx" class="bar-callout-popup">
                  <div class="bc-title">{{ s.sprintName }}</div>
                  <div class="bc-row emerald">
                    <span class="dot"></span>
                    <span>Delivered: <strong>{{ s.completedStoryPoints }} pts</strong></span>
                  </div>
                  <div class="bc-row blue">
                    <span class="dot"></span>
                    <span>Planned: <strong>{{ s.plannedStoryPoints }} pts</strong></span>
                  </div>
                  <div class="bc-row purple">
                    <span class="dot"></span>
                    <span>Completion Rate: <strong>{{ s.completionPct }}%</strong></span>
                  </div>
                </div>
              </Transition>

              <!-- Grouped Bars -->
              <div class="dual-bars-wrapper">
                <!-- Planned Bar -->
                <div class="bar-track">
                  <div class="bar-fill planned" :style="{ height: getBarHeightPct(s.plannedStoryPoints) }"></div>
                </div>
                <!-- Completed Bar -->
                <div class="bar-track">
                  <div class="bar-fill completed" :style="{ height: getBarHeightPct(s.completedStoryPoints) }"></div>
                </div>
              </div>
              <span class="bar-x-label">{{ s.sprintName.replace('Sprint ', 'S') }}</span>
            </div>
          </div>

          <div class="chart-legend-row center">
            <div class="leg-item"><span class="leg-color-dot gray"></span><span>Planned Story Points</span></div>
            <div class="leg-item"><span class="leg-color-dot emerald"></span><span>Completed Story Points</span></div>
          </div>
        </div>

        <!-- SECTION 4 — Velocity Consistency Analysis -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Velocity Consistency Analysis</h3>
              <p class="card-desc">Delivery stability band, highest/lowest variance &amp; consistency score</p>
            </div>
            <span class="consistency-score-badge">
              Consistency Score: {{ statsSummary.averageCompletionPct }}
            </span>
          </div>

          <div class="consistency-area-wrapper" @mousemove="handleConsistencyHover" @mouseleave="hoveredConsistencyIdx = null">
            <svg viewBox="0 0 500 180" class="consistency-svg">
              <defs>
                <linearGradient id="stabilityBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#2563EB" stop-opacity="0.18"/>
                  <stop offset="100%" stop-color="#2563EB" stop-opacity="0.02"/>
                </linearGradient>
              </defs>

              <!-- Stability Area Band -->
              <path :d="consistencyAreaPath" fill="url(#stabilityBandGrad)"/>

              <!-- Max Line (Green Dashed) -->
              <line x1="40" :y1="maxVelY" x2="460" :y2="maxVelY" stroke="#059669" stroke-dasharray="5,4" stroke-width="1.5"/>
              <text x="465" :y="maxVelY + 4" fill="#059669" font-size="10" font-weight="700">Max {{ statsSummary.highestVelocity }}</text>

              <!-- Min Line (Red Dashed) -->
              <line x1="40" :y1="minVelY" x2="460" :y2="minVelY" stroke="#EF4444" stroke-dasharray="5,4" stroke-width="1.5"/>
              <text x="465" :y="minVelY + 4" fill="#EF4444" font-size="10" font-weight="700">Min {{ statsSummary.lowestVelocity }}</text>

              <!-- Avg Line (Blue Solid) -->
              <line x1="40" :y1="avgVelY" x2="460" :y2="avgVelY" stroke="#2563EB" stroke-width="2"/>
              <text x="465" :y="avgVelY + 4" fill="#2563EB" font-size="10" font-weight="700">Avg {{ statsSummary.averageVelocity }}</text>

              <!-- Actual Velocity Path -->
              <path :d="actualVelPath" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/>

              <!-- Hover Vertical Crosshair & Dot -->
              <g v-if="hoveredConsistencyIdx !== null && consistencyPoints[hoveredConsistencyIdx]">
                <line :x1="consistencyPoints[hoveredConsistencyIdx].x" y1="20" :x2="consistencyPoints[hoveredConsistencyIdx].x" y2="160" stroke="#64748B" stroke-dasharray="3,3" stroke-width="1.5"/>
                <circle :cx="consistencyPoints[hoveredConsistencyIdx].x" :cy="consistencyPoints[hoveredConsistencyIdx].y" r="6" fill="#2563EB" stroke="#ffffff" stroke-width="2"/>
              </g>
            </svg>

            <!-- Floating Consistency Hover Tooltip -->
            <div v-if="hoveredConsistencyIdx !== null && consistencyPoints[hoveredConsistencyIdx]" class="chart-tooltip-popup" :style="consistencyTooltipStyle">
              <div class="tooltip-header">{{ consistencyPoints[hoveredConsistencyIdx].sprintName }}</div>
              <div class="tooltip-row blue">
                <span class="dot"></span>
                <span>Velocity: <strong>{{ consistencyPoints[hoveredConsistencyIdx].velocity }} pts</strong></span>
              </div>
              <div class="tooltip-row emerald">
                <span class="dot"></span>
                <span>Stability: <strong>{{ consistencyPoints[hoveredConsistencyIdx].completionPct }}% (Optimal)</strong></span>
              </div>
            </div>
          </div>

          <div class="consistency-metrics-row">
            <div class="c-metric-pill"><span>Highest:</span> <strong>{{ statsSummary.highestVelocity }}</strong></div>
            <div class="c-metric-pill"><span>Lowest:</span> <strong>{{ statsSummary.lowestVelocity }}</strong></div>
            <div class="c-metric-pill"><span>Average:</span> <strong>{{ statsSummary.averageVelocity }}</strong></div>
            <div class="c-metric-pill emerald"><span>Stability Rating:</span> <strong>High (92.4%)</strong></div>
          </div>
        </div>

      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 5 — Sprint Velocity Comparison Grid   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Sprint Velocity Comparison</h2>
            <span class="sec-subtitle">Sprint-by-sprint analytics cards with health scores, trends &amp; drill-down</span>
          </div>
        </div>

        <div class="sprint-cards-grid">
          <div
            v-for="sprintItem in historySprints"
            :key="'sc-'+sprintItem.id"
            class="sprint-analytics-card"
            @click="navigateToHealth(sprintItem)"
          >
            <div class="sc-header">
              <div class="sc-name-group">
                <h4 class="sc-name">{{ sprintItem.sprintName }}</h4>
                <span class="sc-status-pill" :class="sprintItem.status.toLowerCase()">{{ sprintItem.status }}</span>
              </div>
              <span class="sc-health-badge" :class="sprintItem.healthScore >= 85 ? 'high' : sprintItem.healthScore >= 75 ? 'mid' : 'low'">
                {{ sprintItem.healthScore }}% Health
              </span>
            </div>

            <div class="sc-body-metrics">
              <div class="sc-metric-col">
                <span class="sc-m-label">Velocity</span>
                <span class="sc-m-val green">{{ sprintItem.velocity }} <span class="unit">pts</span></span>
              </div>
              <div class="sc-metric-col">
                <span class="sc-m-label">Planned / Done</span>
                <span class="sc-m-val">{{ sprintItem.plannedStoryPoints }} / {{ sprintItem.completedStoryPoints }}</span>
              </div>
              <div class="sc-metric-col">
                <span class="sc-m-label">Completion</span>
                <span class="sc-m-val blue">{{ sprintItem.completionPct }}%</span>
              </div>
            </div>

            <!-- Mini Sparkline -->
            <div class="sc-sparkline-wrap">
              <SparklineChart :variant="sprintItem.trendDirection === 'up' ? 'positive' : 'negative'" :height="28" :points="sprintItem.sparkline" />
            </div>

            <div class="sc-footer">
              <span class="sc-trend-txt" :class="sprintItem.trendDirection">
                <svg v-if="sprintItem.trendDirection === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                </svg>
                <svg v-else-if="sprintItem.trendDirection === 'down'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
                </svg>
                {{ sprintItem.velocityTrend }} vs prev
              </span>
              <span class="sc-drilldown-link">View Health →</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 6 — Story Point Analytics             -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Story Point Analytics</h2>
            <span class="sec-subtitle">Granular story point breakdown, carryover work &amp; scope changes</span>
          </div>
        </div>

        <div class="sp-analytics-grid">
          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <span class="sp-title">Total Planned SP</span>
            </div>
            <div class="sp-main-val">{{ storyPointAnalytics.totalPlanned }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="100" variant="blue" height="14px"/>
            <span class="sp-sub-text">Committed story points total</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge emerald">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <span class="sp-title">Completed SP</span>
            </div>
            <div class="sp-main-val emerald">{{ storyPointAnalytics.totalCompleted }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="Math.round((storyPointAnalytics.totalCompleted / storyPointAnalytics.totalPlanned) * 100)" variant="emerald" height="14px"/>
            <span class="sp-sub-text">{{ Math.round((storyPointAnalytics.totalCompleted / storyPointAnalytics.totalPlanned) * 100) }}% delivery rate</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge orange">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <span class="sp-title">Remaining SP</span>
            </div>
            <div class="sp-main-val orange">{{ storyPointAnalytics.remainingPoints }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="Math.round((storyPointAnalytics.remainingPoints / storyPointAnalytics.totalPlanned) * 100)" variant="orange" height="14px"/>
            <span class="sp-sub-text">In progress / To do</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge purple">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <span class="sp-title">Avg SP per Sprint</span>
            </div>
            <div class="sp-main-val purple">{{ storyPointAnalytics.avgPerSprint }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="85" variant="purple" height="14px"/>
            <span class="sp-sub-text">Based on last {{ selectedRange }} sprints</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <span class="sp-title">Avg SP per Dev</span>
            </div>
            <div class="sp-main-val">{{ storyPointAnalytics.avgPerDev }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="88" variant="blue" height="14px"/>
            <span class="sp-sub-text">Individual developer velocity</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge orange">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              </div>
              <span class="sp-title">Carry Forward SP</span>
            </div>
            <div class="sp-main-val orange">{{ storyPointAnalytics.carryForwardPoints }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="25" variant="orange" height="14px"/>
            <span class="sp-sub-text">Rolled over to next sprint</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge emerald">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span class="sp-title">Scope Added</span>
            </div>
            <div class="sp-main-val emerald">{{ storyPointAnalytics.scopeAddedPoints }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="15" variant="emerald" height="14px"/>
            <span class="sp-sub-text">Mid-sprint scope changes</span>
          </div>

          <div class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge red">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span class="sp-title">Scope Removed</span>
            </div>
            <div class="sp-main-val red">{{ storyPointAnalytics.scopeRemovedPoints }} <span class="unit">pts</span></div>
            <SegmentedProgressBar :value="10" variant="red" height="14px"/>
            <span class="sp-sub-text">Descoped story points</span>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 7 — Team Delivery Performance         -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Team Delivery Performance</h2>
            <span class="sec-subtitle">Individual team contribution, utilization &amp; velocity impact (Sorted by contribution)</span>
          </div>
        </div>

        <div class="team-cards-grid">
          <div v-for="member in teamPerformance" :key="'tm-'+member.name" class="team-card">
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
                <span class="val">{{ member.assigned }} pts</span>
              </div>
              <div class="tc-stat">
                <span class="label">Delivered</span>
                <span class="val emerald">{{ member.delivered }} pts</span>
              </div>
              <div class="tc-stat">
                <span class="label">Contribution</span>
                <span class="val blue">{{ member.contributionPct }}%</span>
              </div>
            </div>

            <!-- Horizontal Progress Bars -->
            <div class="tc-bars-section">
              <div class="tc-bar-group">
                <div class="tc-bar-label"><span>Completion Rate</span><strong>{{ member.completionPct }}%</strong></div>
                <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm emerald" :style="{ width: member.completionPct + '%' }"></div></div>
              </div>
              <div class="tc-bar-group">
                <div class="tc-bar-label"><span>Capacity Utilization</span><strong>{{ member.utilizationPct }}%</strong></div>
                <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm blue" :style="{ width: member.utilizationPct + '%' }"></div></div>
              </div>
            </div>

            <!-- Mini Trend Sparkline -->
            <div class="tc-sparkline-row">
              <span class="sparkline-label">Recent Trend:</span>
              <SparklineChart variant="positive" :height="22" :points="member.sparkline" />
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 8 — Capacity Planning                 -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Capacity Planning &amp; Resource Bandwidth</h3>
              <p class="card-desc">Sprint workload capacity allocation, engineer bandwidth, focus factor &amp; work category breakdown</p>
            </div>
          </div>

          <!-- AI Capacity Banner -->
          <div class="cap-ai-banner">
            <div class="cap-ai-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div class="cap-ai-content">
              <strong>Capacity Intelligence Summary</strong>
              <p>{{ capacityPlanning.aiRecommendation }}</p>
            </div>
          </div>

          <div class="capacity-grid-enhanced">
            <!-- 1. Capacity Breakdown Cards -->
            <div class="cap-metric-cards-grid">
              <div class="cap-kpi-card">
                <span class="cap-kpi-label">Gross Team Hours</span>
                <strong class="cap-kpi-val">{{ capacityPlanning.grossCapacityHours }} hrs</strong>
                <span class="cap-kpi-sub">Total Working Hours</span>
              </div>

              <div class="cap-kpi-card">
                <span class="cap-kpi-label">PTO &amp; Leave Deductions</span>
                <strong class="cap-kpi-val orange">-{{ capacityPlanning.ptoDeductionHours }} hrs</strong>
                <span class="cap-kpi-sub">Planned Time Off</span>
              </div>

              <div class="cap-kpi-card">
                <span class="cap-kpi-label">Net Usable Capacity</span>
                <strong class="cap-kpi-val emerald">{{ capacityPlanning.netUsableCapacityHours }} hrs</strong>
                <span class="cap-kpi-sub">{{ capacityPlanning.focusFactorPct }}% Focus Factor</span>
              </div>

              <div class="cap-kpi-card">
                <span class="cap-kpi-label">Target SP Commitment</span>
                <strong class="cap-kpi-val purple">{{ capacityPlanning.recommendedSpCommitment }}</strong>
                <span class="cap-kpi-sub">Recommended Range</span>
              </div>
            </div>

            <!-- 2. Work Category Allocation -->
            <div class="cap-work-categories-wrap">
              <h4 class="cap-subtitle">Work Category Distribution (Story Points &amp; Effort)</h4>
              
              <!-- Multi-color Stacked Bar -->
              <div class="stacked-cap-bar">
                <div
                  v-for="cat in capacityPlanning.workCategories"
                  :key="'wcat-'+cat.name"
                  class="stacked-seg"
                  :style="{ width: cat.pct + '%', backgroundColor: cat.color }"
                  :title="cat.name + ': ' + cat.pct + '% (' + cat.storyPoints + ' pts)'"
                ></div>
              </div>

              <div class="work-cat-grid">
                <div v-for="cat in capacityPlanning.workCategories" :key="'wcc-'+cat.name" class="work-cat-card">
                  <div class="wcc-header">
                    <span class="dist-dot" :style="{ backgroundColor: cat.color }"></span>
                    <span class="wcc-name">{{ cat.name }}</span>
                  </div>
                  <div class="wcc-body">
                    <strong class="wcc-pct">{{ cat.pct }}%</strong>
                    <span class="wcc-pts">{{ cat.storyPoints }} pts</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Member Individual Capacity Load Table -->
            <div v-if="capacityPlanning.teamCapacityList && capacityPlanning.teamCapacityList.length" class="cap-team-load-wrap">
              <h4 class="cap-subtitle">Individual Engineer Bandwidth Load</h4>
              <div class="table-responsive">
                <table class="velocity-data-table">
                  <thead>
                    <tr>
                      <th>Engineer Name</th>
                      <th>Role</th>
                      <th>Available Hrs</th>
                      <th>Allocated Hrs</th>
                      <th>Capacity Load</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="mem in capacityPlanning.teamCapacityList" :key="'tc-'+mem.name">
                      <td><strong>{{ mem.name }}</strong></td>
                      <td>{{ mem.role }}</td>
                      <td>{{ mem.availableHours }}h</td>
                      <td class="font-bold">{{ mem.allocatedHours }}h</td>
                      <td>
                        <div class="tbl-pct-cell">
                          <span>{{ mem.loadPct }}%</span>
                          <div class="progress-bar-track-xs">
                            <div
                              class="progress-bar-fill-sm"
                              :class="mem.loadPct > 100 ? 'red' : mem.loadPct >= 85 ? 'emerald' : 'blue'"
                              :style="{ width: Math.min(100, mem.loadPct) + '%' }"
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          class="sc-status-pill"
                          :class="mem.status === 'Over-committed' ? 'low' : mem.status === 'Optimal' ? 'completed' : 'planned'"
                        >
                          {{ mem.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 9 — AI Velocity Intelligence          -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="ai-intelligence-card">
          <div class="ai-header">
            <div class="ai-title-wrap">
              <span class="ai-sparkle-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
              </span>
              <h3 class="ai-title">AI Velocity Intelligence</h3>
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

          <!-- AI Forecast Box -->
          <div class="ai-forecast-banner">
            <div class="afb-left">
              <span class="afb-label">AI Predicted Next Velocity (Sprint 35)</span>
              <div class="afb-val-row">
                <span class="afb-main-val">{{ aiIntelligence.forecast.expectedNextVelocity }} pts</span>
                <span class="afb-conf-badge">Confidence: {{ aiIntelligence.forecast.confidenceScore }}%</span>
              </div>
            </div>

            <div class="afb-right-metrics">
              <div class="afb-sub"><span>Best Case:</span> <strong>{{ aiIntelligence.forecast.bestCase }} pts</strong></div>
              <div class="afb-sub"><span>Worst Case:</span> <strong>{{ aiIntelligence.forecast.worstCase }} pts</strong></div>
              <div class="afb-sub"><span>Recommended Commitment:</span> <strong>{{ aiIntelligence.forecast.commitmentRange }}</strong></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 10 — Velocity Forecast Analytics     -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Velocity Forecast Analytics</h3>
              <p class="card-desc">Predictive velocity line chart into future sprints with confidence interval bands</p>
            </div>
          </div>

          <div class="forecast-chart-container" @mousemove="handleForecastHover" @mouseleave="hoveredForecastIdx = null">
            <svg viewBox="0 0 700 200" class="forecast-svg">
              <defs>
                <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#8B5CF6" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#8B5CF6" stop-opacity="0.02"/>
                </linearGradient>
              </defs>

              <!-- Confidence Band Shading for Forecast Sprints -->
              <path :d="forecastBandPath" fill="url(#forecastBandGrad)"/>

              <!-- Historical Velocity Line (Solid Emerald) -->
              <path :d="forecastHistPath" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round"/>

              <!-- AI Forecast Line (Dashed Purple) -->
              <path :d="forecastPredPath" fill="none" stroke="#8B5CF6" stroke-width="3" stroke-dasharray="5,4" stroke-linecap="round"/>

              <!-- Data Points -->
              <circle
                v-for="(fp, idx) in forecastPoints"
                :key="'fpt-'+idx"
                :cx="fp.x"
                :cy="fp.y"
                :r="fp.isForecast ? 5 : 4"
                :fill="fp.isForecast ? '#8B5CF6' : '#059669'"
                stroke="#ffffff"
                stroke-width="2"
              />

              <!-- Hover Vertical Crosshair & Dot -->
              <g v-if="hoveredForecastIdx !== null && forecastPoints[hoveredForecastIdx]">
                <line :x1="forecastPoints[hoveredForecastIdx].x" y1="20" :x2="forecastPoints[hoveredForecastIdx].x" y2="180" stroke="#8B5CF6" stroke-dasharray="3,3" stroke-width="1.5"/>
                <circle :cx="forecastPoints[hoveredForecastIdx].x" :cy="forecastPoints[hoveredForecastIdx].y" r="7" :fill="forecastPoints[hoveredForecastIdx].isForecast ? '#8B5CF6' : '#059669'" stroke="#ffffff" stroke-width="2.5"/>
              </g>

              <!-- X Labels -->
              <text
                v-for="(fp, idx) in forecastPoints"
                :key="'flbl-'+idx"
                :x="fp.x"
                y="190"
                text-anchor="middle"
                fill="#6B7280"
                font-size="10"
                font-weight="600"
              >
                {{ fp.sprintName.replace(' (AI)', '') }}
              </text>
            </svg>
          </div>

          <div class="chart-legend-row center">
            <div class="leg-item"><span class="leg-color-dot emerald"></span><span>Historical Velocity</span></div>
            <div class="leg-item"><span class="leg-color-dot purple-dashed"></span><span>AI Predicted Forecast</span></div>
            <div class="leg-item"><span class="leg-color-dot purple-band"></span><span>Confidence Interval Band</span></div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 11 — Delivery Efficiency               -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Delivery Efficiency KPIs</h2>
            <span class="sec-subtitle">Sprint execution efficiency, work completion ratio &amp; friction indicators</span>
          </div>
        </div>

        <div class="efficiency-grid">
          <div v-for="eff in deliveryEfficiency" :key="'eff-'+eff.name" class="kpi-card-premium">
            <div class="kpi-header-row">
              <span class="kpi-name">{{ eff.name }}</span>
              <span class="trend-badge" :class="eff.dir === 'up' ? 'positive' : 'neutral'">
                {{ eff.trend }}
              </span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ eff.value }}</span>
            </div>
            <div class="progress-bar-track-sm">
              <div class="progress-bar-fill-sm" :class="eff.variant" :style="{ width: eff.pct + '%' }"></div>
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Prev Snapshot</span>
              <span class="kpi-footer-val">{{ eff.prev }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 12 — Historical Velocity Table         -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Historical Velocity Table</h3>
              <p class="card-desc">Detailed exportable tabular data for all recorded sprints</p>
            </div>

            <!-- Table Search & Filter Toolbar -->
            <div class="table-toolbar">
              <div class="search-input-wrap">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" v-model="tableSearch" placeholder="Search sprint..." class="search-field"/>
              </div>

              <select v-model="tableStatusFilter" class="status-select">
                <option value="ALL">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Active">Active</option>
              </select>

              <button class="action-btn-sm" @click="exportCSV">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                CSV Export
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="velocity-data-table">
              <thead>
                <tr>
                  <th @click="sortTable('sprintName')">Sprint {{ getSortIcon('sprintName') }}</th>
                  <th @click="sortTable('plannedStoryPoints')">Planned SP {{ getSortIcon('plannedStoryPoints') }}</th>
                  <th @click="sortTable('completedStoryPoints')">Completed SP {{ getSortIcon('completedStoryPoints') }}</th>
                  <th @click="sortTable('velocity')">Velocity {{ getSortIcon('velocity') }}</th>
                  <th @click="sortTable('difference')">Difference {{ getSortIcon('difference') }}</th>
                  <th @click="sortTable('completionPct')">Completion % {{ getSortIcon('completionPct') }}</th>
                  <th @click="sortTable('healthScore')">Health Score {{ getSortIcon('healthScore') }}</th>
                  <th>Trend</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in filteredTableData" :key="'row-'+row.id" @click="navigateToHealth(row)" class="clickable-row">
                  <td><strong>{{ row.sprintName }}</strong></td>
                  <td>{{ row.plannedStoryPoints }} pts</td>
                  <td class="emerald font-bold">{{ row.completedStoryPoints }} pts</td>
                  <td class="font-bold">{{ row.velocity }}</td>
                  <td :class="row.difference >= 0 ? 'emerald' : 'red'">
                    {{ row.difference >= 0 ? '+' : '' }}{{ row.difference }}
                  </td>
                  <td>
                    <div class="tbl-pct-cell">
                      <span>{{ row.completionPct }}%</span>
                      <div class="progress-bar-track-xs"><div class="progress-bar-fill-sm emerald" :style="{ width: row.completionPct + '%' }"></div></div>
                    </div>
                  </td>
                  <td>
                    <span class="tbl-health-pill" :class="row.healthScore >= 85 ? 'high' : row.healthScore >= 75 ? 'mid' : 'low'">
                      {{ row.healthScore }}%
                    </span>
                  </td>
                  <td :class="row.trendDirection">
                    {{ row.velocityTrend }}
                  </td>
                  <td>
                    <span class="sc-status-pill" :class="row.status.toLowerCase()">{{ row.status }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 13 — Velocity Statistics Summary       -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Velocity Statistics Summary</h2>
            <span class="sec-subtitle">Aggregated statistical highlights across historical sprint cycles</span>
          </div>
        </div>

        <div class="stats-summary-grid">
          <div class="stat-mini-card"><span>Highest Velocity</span><strong>{{ statsSummary.highestVelocity }}</strong></div>
          <div class="stat-mini-card"><span>Lowest Velocity</span><strong>{{ statsSummary.lowestVelocity }}</strong></div>
          <div class="stat-mini-card"><span>Average Velocity</span><strong>{{ statsSummary.averageVelocity }}</strong></div>
          <div class="stat-mini-card"><span>Median Velocity</span><strong>{{ statsSummary.medianVelocity }}</strong></div>
          <div class="stat-mini-card"><span>Total SP Delivered</span><strong>{{ statsSummary.totalDelivered }}</strong></div>
          <div class="stat-mini-card"><span>Total SP Planned</span><strong>{{ statsSummary.totalPlanned }}</strong></div>
          <div class="stat-mini-card"><span>Completed Sprints</span><strong>{{ statsSummary.totalCompletedSprints }}</strong></div>
          <div class="stat-mini-card"><span>Avg Completion %</span><strong>{{ statsSummary.averageCompletionPct }}</strong></div>
          <div class="stat-mini-card"><span>Delivery Success Rate</span><strong>{{ statsSummary.deliverySuccessRate }}</strong></div>
          <div class="stat-mini-card emerald"><span>Velocity Health</span><strong>{{ statsSummary.overallVelocityHealth }}</strong></div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 14 — Quick Actions Toolbar             -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="quick-actions-bar">
          <button class="qa-btn" @click="openJiraSprint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open Jira Sprint
          </button>

          <button class="qa-btn" @click="navigateToHealthCurrent">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            View Sprint Health
          </button>

          <button class="qa-btn" @click="openReportModal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Download Velocity Report
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
          <h3>Velocity Analytics Report</h3>
          <button @click="showReportModal = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>Download comprehensive Velocity &amp; Capacity Report for <strong>{{ selectedProject }}</strong>.</p>
          <div class="report-options">
            <button class="report-opt-btn" @click="downloadReport('excel')">📊 Download Excel / CSV</button>
            <button class="report-opt-btn" @click="downloadReport('pdf')">📄 Print / Export PDF</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Share Modal -->
    <div v-if="showShareModal" class="modal-backdrop" @click.self="showShareModal = false">
      <div class="modal-card-custom">
        <div class="modal-header">
          <h3>Share Velocity Report</h3>
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

useHead({ title: 'Velocity Analytics | Sprintlytics' });

const route = useRoute();
const router = useRouter();

// State
const selectedProject = ref(route.query.project || 'ALL');
const selectedSprint = ref('ALL');
const selectedPeriod = ref('daily');
const selectedRange = ref(10);
const pending = ref(false);
const data = ref(null);
const comparePrevious = ref(true);

// Hover indexes
const hoveredTrendIdx = ref(null);
const hoveredBarIdx = ref(null);

// Table controls
const tableSearch = ref('');
const tableStatusFilter = ref('ALL');
const sortKey = ref('sprintNumber');
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

// Project Options
const projectOptions = computed(() => {
  const list = data.value?.projectsList || ['Barena ERP', 'DevOps Tasks', 'FLEXA ERP', 'Glow Box', 'Honda POC', 'IPOPS', 'Jom Smart Central', 'WONDERKIDS OT'];
  const opts = [{ label: 'All Projects', value: 'ALL' }];
  list.forEach(p => {
    if (p !== 'ALL') opts.push({ label: p, value: p });
  });
  return opts;
});

// Sprint Options (Dynamically calculated for selected project)
const sprintOptions = computed(() => {
  if (selectedProject.value === 'ALL') {
    return [{ label: 'All Sprints', value: 'ALL' }];
  }
  if (data.value?.sprintOptions?.length) {
    return data.value.sprintOptions;
  }
  const history = data.value?.sprintsHistory || [];
  const options = [{ label: 'All Sprints', value: 'ALL' }];
  history.forEach(s => {
    options.push({ label: `${s.sprintName}${s.status === 'Active' ? ' (Active)' : ''}`, value: s.sprintName });
  });
  return options;
});

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
  selectedSprint.value = 'ALL';
  fetchData();
};

// Fetch Data from API
const fetchData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/sprint/velocity', {
      query: {
        project: selectedProject.value,
        sprint: selectedSprint.value,
        period: selectedPeriod.value,
        range: selectedRange.value
      }
    });

    if (res && res.success) {
      data.value = res;
      if (!selectedProject.value) {
        selectedProject.value = 'ALL';
      }
    } else {
      showToast(res.error || 'Failed to load velocity data', 'warn');
    }
  } catch (err) {
    console.error('Error loading velocity analytics:', err);
    showToast('Failed to connect to velocity endpoint', 'warn');
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
const historySprints = computed(() => data.value?.sprintsHistory || []);
const storyPointAnalytics = computed(() => data.value?.storyPointAnalytics || {});
const teamPerformance = computed(() => data.value?.teamPerformance || []);
const capacityPlanning = computed(() => data.value?.capacityPlanning || { distribution: [] });
const aiIntelligence = computed(() => data.value?.aiIntelligence || { keyAchievements: [], deliveryRisks: [], recommendations: [], forecast: {} });
const deliveryEfficiency = computed(() => data.value?.deliveryEfficiency || []);
const statsSummary = computed(() => data.value?.statsSummary || {});

// SVG Line Chart Dimensions & Coordinate Mapping
const chartWidth = 750;
const chartHeight = 220;
const margin = { top: 20, right: 30, bottom: 40, left: 55 };

const yGridTicks = computed(() => {
  const max = 60;
  return [
    { val: 60, y: margin.top },
    { val: 45, y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.25 },
    { val: 30, y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.5 },
    { val: 15, y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.75 },
    { val: 0,  y: chartHeight - margin.bottom }
  ];
});

const trendPoints = computed(() => {
  const sprints = historySprints.value;
  if (!sprints.length) return [];
  const maxVal = 60;
  const availWidth = chartWidth - margin.left - margin.right;
  const step = sprints.length > 1 ? availWidth / (sprints.length - 1) : availWidth / 2;

  return sprints.map((s, i) => {
    const x = margin.left + i * step;
    const completedY = chartHeight - margin.bottom - (Math.min(s.completedStoryPoints, maxVal) / maxVal) * (chartHeight - margin.top - margin.bottom);
    const plannedY = chartHeight - margin.bottom - (Math.min(s.plannedStoryPoints, maxVal) / maxVal) * (chartHeight - margin.top - margin.bottom);
    
    // Moving average point
    const window = sprints.slice(Math.max(0, i - 2), i + 1);
    const ma = Math.round((window.reduce((acc, curr) => acc + curr.completedStoryPoints, 0) / window.length) * 10) / 10;
    const maY = chartHeight - margin.bottom - (Math.min(ma, maxVal) / maxVal) * (chartHeight - margin.top - margin.bottom);

    return {
      sprint: s.sprintName.replace('Sprint ', 'S'),
      planned: s.plannedStoryPoints,
      completed: s.completedStoryPoints,
      movingAverage: ma,
      x,
      completedY,
      plannedY,
      maY
    };
  });
});

const velocityLinePath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.completedY}`).join(' L ');
});

const velocityAreaPath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  const line = pts.map(p => `${p.x},${p.completedY}`).join(' L ');
  const lastX = pts[pts.length - 1].x;
  const firstX = pts[0].x;
  const bottomY = chartHeight - margin.bottom;
  return `M ${firstX},${bottomY} L ${line} L ${lastX},${bottomY} Z`;
});

const plannedLinePath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.plannedY}`).join(' L ');
});

const movingAvgLinePath = computed(() => {
  const pts = trendPoints.value;
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.maY}`).join(' L ');
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
    top: `${pt.completedY - 20}px`
  };
});

// Bar Height Helper for Grouped Bar Chart
const getBarHeightPct = (val) => {
  const max = 60;
  const pct = Math.min(100, Math.max(6, (val / max) * 100));
  return `${pct}%`;
};

// Section 4 Consistency Area Chart Paths
const maxVelY = 30;
const minVelY = 130;
const avgVelY = 80;
const consistencyAreaPath = `M 40,${maxVelY} L 460,${maxVelY} L 460,${minVelY} L 40,${minVelY} Z`;

const actualVelPath = computed(() => {
  const sprints = historySprints.value;
  if (!sprints.length) return 'M 40,80 L 460,80';
  const width = 420;
  const step = width / Math.max(1, sprints.length - 1);
  const max = 55;
  const min = 25;
  
  const coords = sprints.map((s, idx) => {
    const x = 40 + idx * step;
    const norm = Math.min(1, Math.max(0, (s.velocity - min) / (max - min)));
    const y = minVelY - norm * (minVelY - maxVelY);
    return `${x},${y}`;
  });
  return 'M ' + coords.join(' L ');
});

// Section 10 Forecast SVG Coordinates
const forecastPoints = computed(() => {
  const raw = data.value?.forecastSprints || [];
  if (!raw.length) return [];
  const width = 600;
  const step = width / Math.max(1, raw.length - 1);
  const max = 60;

  return raw.map((s, i) => {
    const x = 50 + i * step;
    const y = 170 - (Math.min(s.velocity, max) / max) * 130;
    const lowY = s.confidenceLow ? 170 - (Math.min(s.confidenceLow, max) / max) * 130 : y + 15;
    const highY = s.confidenceHigh ? 170 - (Math.min(s.confidenceHigh, max) / max) * 130 : y - 15;
    return {
      sprintName: s.sprintName,
      velocity: s.velocity,
      isForecast: !!s.isForecast,
      x,
      y,
      lowY,
      highY
    };
  });
});

const forecastHistPath = computed(() => {
  const pts = forecastPoints.value.filter(p => !p.isForecast);
  if (!pts.length) return '';
  return 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
});

const forecastPredPath = computed(() => {
  const pts = forecastPoints.value;
  if (pts.length < 2) return '';
  const startIdx = pts.findIndex(p => p.isForecast) - 1;
  const predPts = pts.slice(Math.max(0, startIdx));
  return 'M ' + predPts.map(p => `${p.x},${p.y}`).join(' L ');
});

// Section 4 Consistency Hover Handler & Tooltip Style
const hoveredConsistencyIdx = ref(null);

const consistencyPoints = computed(() => {
  const sprints = historySprints.value;
  if (!sprints.length) return [];
  const width = 420;
  const step = width / Math.max(1, sprints.length - 1);
  const max = 55;
  const min = 25;

  return sprints.map((s, idx) => {
    const x = 40 + idx * step;
    const norm = Math.min(1, Math.max(0, (s.velocity - min) / (max - min)));
    const y = minVelY - norm * (minVelY - maxVelY);
    return {
      sprintName: s.sprintName,
      velocity: s.velocity,
      completionPct: s.completionPct,
      x,
      y
    };
  });
});

const handleConsistencyHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = consistencyPoints.value;
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
  hoveredConsistencyIdx.value = closestIdx;
};

const consistencyTooltipStyle = computed(() => {
  if (hoveredConsistencyIdx.value === null || !consistencyPoints.value[hoveredConsistencyIdx.value]) return {};
  const pt = consistencyPoints.value[hoveredConsistencyIdx.value];
  const isRightHalf = pt.x > 250;
  return {
    left: `${(pt.x / 500) * 100}%`,
    top: `20px`,
    transform: isRightHalf ? 'translateX(-105%)' : 'translateX(5%)'
  };
});

// Section 10 Forecast Hover Handler & Tooltip Style
const hoveredForecastIdx = ref(null);

const handleForecastHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = forecastPoints.value;
  if (!pts.length) return;

  let closestIdx = 0;
  let minDiff = Infinity;
  pts.forEach((p, idx) => {
    const diff = Math.abs((p.x / 700) * rect.width - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });
  hoveredForecastIdx.value = closestIdx;
};

const forecastTooltipStyle = computed(() => {
  if (hoveredForecastIdx.value === null || !forecastPoints.value[hoveredForecastIdx.value]) return {};
  const pt = forecastPoints.value[hoveredForecastIdx.value];
  const isRightHalf = pt.x > 350;
  return {
    left: `${(pt.x / 700) * 100}%`,
    top: `20px`,
    transform: isRightHalf ? 'translateX(-105%)' : 'translateX(5%)'
  };
});

const forecastBandPath = computed(() => {
  const fPts = forecastPoints.value.filter(p => p.isForecast);
  if (!fPts.length) return '';
  const topCoords = fPts.map(p => `${p.x},${p.highY}`).join(' L ');
  const botCoords = fPts.slice().reverse().map(p => `${p.x},${p.lowY}`).join(' L ');
  return `M ${topCoords} L ${botCoords} Z`;
});

// Section 12 Historical Table Filter & Sort
const filteredTableData = computed(() => {
  let list = [...historySprints.value];

  if (tableSearch.value.trim()) {
    const q = tableSearch.value.toLowerCase().trim();
    list = list.filter(s =>
      s.sprintName.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q) ||
      String(s.plannedStoryPoints).includes(q) ||
      String(s.completedStoryPoints).includes(q) ||
      String(s.velocity).includes(q) ||
      String(s.healthScore).includes(q) ||
      String(s.completionPct).includes(q)
    );
  }

  if (tableStatusFilter.value !== 'ALL') {
    list = list.filter(s => s.status === tableStatusFilter.value);
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

const getSortIcon = (key) => {
  if (sortKey.value !== key) return '↕';
  return sortAsc.value ? '↑' : '↓';
};

// Navigation & Actions
const navigateToHealth = (sprintObj) => {
  router.push({
    path: '/sprint/health',
    query: {
      project: selectedProject.value,
      sprint: sprintObj?.sprintName || 'Active Sprint'
    }
  });
};

const navigateToHealthCurrent = () => {
  router.push({
    path: '/sprint/health',
    query: { project: selectedProject.value }
  });
};

const openJiraSprint = () => {
  showToast(`Opening Jira Sprint Board for ${selectedProject.value}...`, 'info');
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
    ['Sprint', 'Planned Story Points', 'Completed Story Points', 'Velocity', 'Difference', 'Completion Pct', 'Health Score', 'Status']
  ];
  historySprints.value.forEach(s => {
    rows.push([s.sprintName, s.plannedStoryPoints, s.completedStoryPoints, s.velocity, s.difference, `${s.completionPct}%`, `${s.healthScore}%`, s.status]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `velocity_report_${selectedProject.value}.csv`);
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

.velocity-analytics-page {
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

/* Executive KPI Cards Grid */
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

.kpi-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.kpi-title-with-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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

.kpi-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4B5563;
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
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-toggle-sm.active {
  background: #ECFDF5;
  color: #059669;
  border-color: #A7F3D0;
}

/* Interactive Line Chart */
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

.bar-callout-popup {
  position: absolute;
  top: -70px;
  background: #0F172A;
  color: #ffffff;
  padding: 0.55rem 0.8rem;
  border-radius: 8px;
  font-size: 0.72rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.25);
  pointer-events: none;
  z-index: 40;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.bc-title { font-weight: 700; color: #94A3B8; border-bottom: 1px solid #334155; padding-bottom: 2px; }
.bc-row { display: flex; align-items: center; gap: 0.35rem; }
.bc-row .dot { width: 6px; height: 6px; border-radius: 50%; }
.bc-row.emerald .dot { background: #059669; }
.bc-row.blue .dot { background: #3B82F6; }
.bc-row.purple .dot { background: #8B5CF6; }

.chart-legend-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4B5563;
}

.chart-legend-row.center { justify-content: center; }

.leg-item { display: flex; align-items: center; gap: 0.4rem; }
.leg-color-dot { width: 10px; height: 10px; border-radius: 50%; }
.leg-color-dot.emerald { background: #059669; }
.leg-color-dot.blue-dashed { background: #3B82F6; }
.leg-color-dot.purple-dotted { background: #8B5CF6; }
.leg-color-dot.gray { background: #E5E7EB; }
.leg-color-dot.purple-dashed { background: #8B5CF6; }
.leg-color-dot.purple-band { background: rgba(139, 92, 246, 0.3); border-radius: 2px; }

/* Dual Grid Section 3 & 4 */
.dual-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  align-items: start;
  gap: 1.5rem;
}

/* Grouped Bar Chart Track */
.bar-chart-track {
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 180px;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 0.5rem;
}

.bar-group-col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  height: 100%;
  justify-content: flex-end;
}

.dual-bars-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 140px;
}

.bar-track {
  width: 14px;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.bar-fill.planned { background: #E5E7EB; }
.bar-fill.completed { background: #059669; }

.bar-x-label { font-size: 0.72rem; font-weight: 600; color: #6B7280; }

.bar-callout {
  position: absolute;
  top: -30px;
  background: #111827;
  color: #ffffff;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  white-space: nowrap;
  z-index: 20;
}

/* Consistency Analysis */
.consistency-score-badge {
  background: #ECFDF5;
  color: #059669;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  border: 1px solid #A7F3D0;
}

.consistency-area-wrapper {
  width: 100%;
  height: 180px;
}

.consistency-svg { width: 100%; height: 100%; }

.consistency-metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.c-metric-pill {
  background: #F3F4F6;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  color: #374151;
}

.c-metric-pill.emerald { background: #ECFDF5; color: #059669; }

/* Sprint Velocity Comparison Grid */
.sprint-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  align-items: start;
  gap: 1rem;
}

.sprint-analytics-card {
  background: #ffffff;
  border: none;
  outline: none;
  border-radius: 12px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.sprint-analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.22) 0px 8px 20px 0px;
}

.sc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sc-name { font-size: 0.92rem; font-weight: 700; margin: 0; color: #111827; }

.sc-status-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.sc-status-pill.completed { background: #ECFDF5; color: #059669; }
.sc-status-pill.active { background: #EFF6FF; color: #2563EB; }
.sc-status-pill.planned { background: #F3F4F6; color: #6B7280; }

.sc-health-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
}

.sc-health-badge.high { background: #ECFDF5; color: #059669; }
.sc-health-badge.mid { background: #FFFBEB; color: #D97706; }
.sc-health-badge.low { background: #FEF2F2; color: #EF4444; }

.sc-body-metrics {
  display: flex;
  justify-content: space-between;
}

.sc-metric-col { display: flex; flex-direction: column; gap: 0.15rem; }
.sc-m-label { font-size: 0.7rem; color: #6B7280; }
.sc-m-val { font-size: 0.85rem; font-weight: 700; color: #111827; }
.sc-m-val.green { color: #059669; }
.sc-m-val.blue { color: #2563EB; }

.sc-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.72rem;
}

.sc-trend-txt { display: flex; align-items: center; gap: 0.2rem; font-weight: 700; }
.sc-trend-txt.up { color: #059669; }
.sc-trend-txt.down { color: #EF4444; }

.sc-drilldown-link { font-weight: 600; color: #2563EB; }

/* Story Point Analytics Grid */
.sp-analytics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: start;
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
.sp-sub-text { font-size: 0.72rem; color: #6B7280; }

/* Team Delivery Performance Grid */
.team-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  align-items: start;
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
  gap: 0.75rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.tc-header { display: flex; align-items: center; gap: 0.75rem; }
.tc-avatar-initials {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.92rem;
  font-weight: 700;
  flex-shrink: 0;
}
.tc-info { flex: 1; display: flex; flex-direction: column; }
.tc-name { font-size: 0.88rem; font-weight: 700; margin: 0; color: #111827; }
.tc-role { font-size: 0.72rem; color: #6B7280; }

.tc-status-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.tc-status-badge.high-performer { background: #ECFDF5; color: #059669; }
.tc-status-badge.optimal { background: #EFF6FF; color: #2563EB; }
.tc-status-badge.watch { background: #FFFBEB; color: #D97706; }

.tc-stats-row {
  display: flex;
  justify-content: space-between;
  background: #F9FAFB;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}

.tc-stat { display: flex; flex-direction: column; }
.tc-stat .label { font-size: 0.68rem; color: #6B7280; }
.tc-stat .val { font-size: 0.8rem; font-weight: 700; color: #111827; }
.tc-stat .val.emerald { color: #059669; }
.tc-stat .val.blue { color: #2563EB; }

.tc-bars-section { display: flex; flex-direction: column; gap: 0.5rem; }
.tc-bar-group { display: flex; flex-direction: column; gap: 0.2rem; }
.tc-bar-label { display: flex; justify-content: space-between; font-size: 0.72rem; color: #4B5563; }

.progress-bar-track-sm {
  width: 100%;
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-track-xs {
  width: 60px;
  height: 5px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill-sm {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-bar-fill-sm.emerald { background: #059669; }
.progress-bar-fill-sm.blue { background: #2563EB; }
.progress-bar-fill-sm.orange { background: #F97316; }
.progress-bar-fill-sm.purple { background: #7C3AED; }

.tc-sparkline-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.sparkline-label { font-size: 0.72rem; color: #6B7280; }

/* Capacity Planning Section 8 */
.cap-ai-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  background: #EFF6FF;
  border-left: 4px solid #2563EB;
  padding: 0.9rem 1.15rem;
  border-radius: 8px;
}

.cap-ai-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
}

.cap-ai-content strong {
  font-size: 0.85rem;
  color: #1E40AF;
  display: block;
}

.cap-ai-content p {
  margin: 0.2rem 0 0 0;
  font-size: 0.8rem;
  color: #1E3A8A;
  line-height: 1.45;
}

.capacity-grid-enhanced {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cap-metric-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.cap-kpi-card {
  background: #F9FAFB;
  border-radius: 10px;
  padding: 0.9rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cap-kpi-label { font-size: 0.75rem; color: #6B7280; font-weight: 500; }
.cap-kpi-val { font-size: 1.35rem; font-weight: 700; color: #111827; }
.cap-kpi-val.orange { color: #EA580C; }
.cap-kpi-val.emerald { color: #059669; }
.cap-kpi-val.purple { color: #7C3AED; }
.cap-kpi-sub { font-size: 0.7rem; color: #9CA3AF; }

.cap-work-categories-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.cap-subtitle { font-size: 0.88rem; font-weight: 700; color: #374151; margin: 0; }

.stacked-cap-bar {
  display: flex;
  height: 20px;
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
}

.work-cat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
}

.work-cat-card {
  background: #F9FAFB;
  border-radius: 10px;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.wcc-header { display: flex; align-items: center; gap: 0.4rem; }
.wcc-name { font-size: 0.78rem; font-weight: 600; color: #4B5563; }
.wcc-body { display: flex; align-items: baseline; justify-content: space-between; }
.wcc-pct { font-size: 1.15rem; font-weight: 700; color: #111827; }
.wcc-pts { font-size: 0.75rem; font-weight: 600; color: #6B7280; }

.cap-team-load-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.dist-legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 0.75rem;
}

.dist-leg-card {
  background: #F9FAFB;
  padding: 0.6rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.dist-top { display: flex; align-items: center; gap: 0.35rem; }
.dist-dot { width: 8px; height: 8px; border-radius: 50%; }
.dist-name { font-size: 0.72rem; color: #4B5563; font-weight: 600; }
.dist-pct { font-size: 1rem; font-weight: 700; color: #111827; }

/* AI Velocity Intelligence Section 9 */
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
.ai-sparkle-icon { font-size: 1.2rem; }
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

.ai-badge-sm {
  align-self: flex-start;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.ai-badge-sm.green { background: rgba(52, 211, 153, 0.2); color: #34D399; }
.ai-badge-sm.orange { background: rgba(251, 146, 60, 0.2); color: #FB923C; }

.ai-forecast-banner {
  background: linear-gradient(90deg, #3B82F6 0%, #1D4ED8 100%);
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.afb-left { display: flex; flex-direction: column; gap: 0.25rem; }
.afb-label { font-size: 0.78rem; font-weight: 600; color: #DBEAFE; }
.afb-val-row { display: flex; align-items: center; gap: 0.75rem; }
.afb-main-val { font-size: 1.6rem; font-weight: 800; color: #ffffff; }

.afb-conf-badge {
  background: rgba(255,255,255,0.2);
  color: #ffffff;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
  border-radius: 12px;
}

.afb-right-metrics { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.afb-sub { display: flex; flex-direction: column; font-size: 0.75rem; color: #DBEAFE; }
.afb-sub strong { font-size: 0.95rem; color: #ffffff; }

/* Section 10 Forecast Chart */
.forecast-chart-container { width: 100%; height: 200px; }
.forecast-svg { width: 100%; height: 100%; }

/* Section 11 Efficiency Grid */
.efficiency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

/* Section 12 Table */
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
.status-select { border: 1px solid #D1D5DB; border-radius: 8px; padding: 0.45rem 0.75rem; font-size: 0.8rem; outline: none; }

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

.velocity-data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.velocity-data-table th, .velocity-data-table td {
  padding: 0.85rem 1rem;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.velocity-data-table th {
  background: #F9FAFB;
  font-weight: 700;
  color: #4B5563;
  cursor: pointer;
  user-select: none;
}

.clickable-row { cursor: pointer; transition: background 0.15s ease; }
.clickable-row:hover { background: #F9FAFB; }

.emerald { color: #059669; }
.red { color: #EF4444; }
.font-bold { font-weight: 700; }

.tbl-pct-cell { display: flex; align-items: center; gap: 0.5rem; }

.tbl-health-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
}

.tbl-health-pill.high { background: #ECFDF5; color: #059669; }
.tbl-health-pill.mid { background: #FFFBEB; color: #D97706; }
.tbl-health-pill.low { background: #FEF2F2; color: #EF4444; }

/* Section 13 Statistics Summary Grid */
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

/* Section 14 Quick Actions Bar */
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
  transition: all 0.2s ease;
}

.qa-btn:hover { background: #F9FAFB; border-color: #9CA3AF; }

.qa-btn.primary {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
}

.qa-btn.primary:hover { background: #047857; }

/* Loading & Empty States */
.simple-loading-spinner {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
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
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1rem;
  text-align: center;
}

/* Modal Styling */
.modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card-custom {
  background: #ffffff;
  border-radius: 14px;
  width: 90%;
  max-width: 460px;
  padding: 1.5rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-header { display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin: 0; font-size: 1.1rem; }
.btn-close { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; }

.report-options { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
.report-opt-btn {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background: #F9FAFB;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}
.report-opt-btn:hover { background: #ECFDF5; border-color: #059669; color: #059669; }

.share-link-input-row { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
.share-field { flex: 1; border: 1px solid #D1D5DB; border-radius: 8px; padding: 0.5rem; font-size: 0.8rem; }

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #1E293B;
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 1100;
}

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>
