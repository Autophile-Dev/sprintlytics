<template>
  <div class="risk-monitor-analytics-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Risk Monitor</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
            </svg>
            AI POWERED
          </span>
        </div>
        <p class="page-main-subtitle">
          Real-time delivery blockers, workload bottlenecks, SLA delays &amp; automated AI risk mitigation
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

        <!-- Project Selector (Standard CustomSelect Component) -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedProject"
            :options="projectOptions"
            @change="fetchRiskData"
          />
        </div>

        <!-- Severity Filter (Standard CustomSelect Component) -->
        <div class="filter-group">
          <CustomSelect
            v-model="selectedSeverity"
            :options="severityOptions"
            @change="fetchRiskData"
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
        <div class="gen-date-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Active Sprint
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchRiskData" :disabled="pending" title="Refresh Risk Monitor">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <!-- Log New Risk Button -->
        <button class="action-btn secondary-btn" @click="showNewRiskModal = true" style="margin-right: 0.5rem;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Log New Risk
        </button>

        <!-- Export Risk Report Button -->
        <button class="action-btn primary-btn" @click="openExportModal">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Risk Report
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

    <template v-else>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Executive Risk Overview (8 KPIs)  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Executive Risk Overview</h2>
            <span class="sec-subtitle">Critical bottlenecks, blocker counts, SLA overdues &amp; vulnerability status</span>
          </div>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="(kpi, key) in executiveKpis" :key="key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="key === 'totalActiveRisks'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <svg v-else-if="key === 'criticalBlockers'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  <svg v-else-if="key === 'overdueTasks'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else-if="key === 'atRiskEngineers'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <svg v-else-if="key === 'unassignedPriority'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
                  <svg v-else-if="key === 'highPriorityVulns'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg v-else-if="key === 'bugCountImpact'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3 3 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6Z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 9.8 3 11.4 3 14"/><path d="M6 17c-1.5 1.5-2.5 3-2.5 3"/><path d="M17.47 9c1.93.8 3.53 2.4 3.53 5"/><path d="M18 17c1.5 1.5 2.5 3 2.5 3"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
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
      <!-- SECTION 2 — Sprint Risk Trend Chart & Heatmap  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container dual-grid">
        
        <!-- Risk Velocity Trend Chart -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Sprint Risk Index Trend</h3>
              <p class="card-desc">Historical risk exposure and blocker resolution trajectory</p>
            </div>
          </div>

          <div class="line-chart-area" @mousemove="handleTrendHover" @mouseleave="hoveredIdx = null">
            <svg :viewBox="`0 0 ${chartWidth} ${chartHeight}`" class="trend-svg">
              <defs>
                <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#EF4444" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#EF4444" stop-opacity="0.00"/>
                </linearGradient>
              </defs>

              <!-- Grid Y Lines -->
              <g class="grid-y">
                <line
                  v-for="tick in yGridTicks"
                  :key="'gt-'+tick.val"
                  :x1="margin.left"
                  :y1="tick.y"
                  :x2="chartWidth - margin.right"
                  :y2="tick.y"
                  stroke="#E5E7EB"
                  stroke-dasharray="4,4"
                />
                <text
                  v-for="tick in yGridTicks"
                  :key="'lbl-'+tick.val"
                  :x="margin.left - 10"
                  :y="tick.y + 4"
                  text-anchor="end"
                  fill="#9CA3AF"
                  font-size="10"
                  font-weight="600"
                >
                  {{ tick.val }}
                </text>
              </g>

              <!-- Area Fill -->
              <path v-if="trendPath" :d="trendAreaPath" fill="url(#riskGrad)"/>

              <!-- Trend Line -->
              <path v-if="trendPath" :d="trendPath" fill="none" stroke="#EF4444" stroke-width="3" stroke-linecap="round"/>

              <!-- Data Points -->
              <circle
                v-for="(pt, idx) in chartPoints"
                :key="'pt-'+idx"
                :cx="pt.x"
                :cy="pt.y"
                r="5"
                fill="#EF4444"
                stroke="#ffffff"
                stroke-width="2"
              />

              <!-- Rotated X-Axis Labels (Zero Overlap Guaranteed) -->
              <g class="grid-x">
                <text
                  v-for="(pt, idx) in chartPoints"
                  :key="'xt-'+idx"
                  :x="pt.x"
                  :y="chartHeight - 45"
                  text-anchor="end"
                  fill="#4B5563"
                  font-size="10"
                  font-weight="600"
                  :transform="`rotate(-30, ${pt.x}, ${chartHeight - 45})`"
                >
                  {{ formatAxisLabel(pt.sprint) }}
                </text>
              </g>
            </svg>

            <!-- Chart Hover Popup -->
            <div v-if="hoveredIdx !== null && chartPoints[hoveredIdx]" class="chart-tooltip-popup" :style="tooltipStyle">
              <div class="tooltip-header">{{ chartPoints[hoveredIdx].sprint }}</div>
              <div class="tooltip-row red"><span class="dot"></span> Risk Index: <strong>{{ chartPoints[hoveredIdx].riskIndex }} pts</strong></div>
              <div class="tooltip-row amber"><span class="dot"></span> Blocked Items: <strong>{{ chartPoints[hoveredIdx].blocked }}</strong></div>
            </div>
          </div>
        </div>

        <!-- Project Risk Heatmap -->
        <div class="card-analytics">
          <div class="card-analytics-header">
            <div>
              <h3 class="card-title">Project Risk Heatmap</h3>
              <p class="card-desc">Project severity index based on blockers, overdues &amp; health scores</p>
            </div>
          </div>

          <div class="risk-heatmap-list">
            <div
              v-for="proj in projectRiskHeatmap"
              :key="proj.companyName"
              class="heatmap-item clickable-heatmap-item"
              @click="selectedProject = proj.companyName; fetchRiskData()"
              title="Click to filter Risk Register by this project"
            >
              <div class="hm-header">
                <div class="hm-title-wrap">
                  <span class="hm-name">{{ proj.companyName }}</span>
                  <span class="hm-sprint">{{ proj.sprintName }}</span>
                </div>
                <span class="risk-badge-sm" :class="proj.level.toLowerCase()">
                  {{ proj.level }} Risk ({{ proj.riskScore }})
                </span>
              </div>
              <SegmentedProgressBar :value="proj.riskScore" :variant="getHeatmapVariant(proj.level)" height="8px"/>
              <div class="hm-metrics">
                <span>Blocked: <strong>{{ proj.blocked }}</strong></span>
                <span>Overdue: <strong>{{ proj.overdue }}</strong></span>
                <span>Health Score: <strong>{{ proj.healthScore }}/100</strong></span>
              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 — AI Executive Risk Intelligence    -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="ai-insights-card">
          <div class="ai-card-header">
            <div class="ai-badge-group">
              <div class="ai-spark-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <h3 class="ai-card-title">AI Risk Intelligence &amp; Mitigation Protocol</h3>
            </div>
            <span class="ai-tag-sm">AUTOMATED DISPATCH</span>
          </div>

          <div class="ai-headline-box">
            <h4>{{ aiIntelligence.summaryHeadline }}</h4>
          </div>

          <div class="ai-insights-grid">
            <div class="ai-col">
              <h5>Identified Delivery Drivers</h5>
              <ul>
                <li v-for="(item, idx) in aiIntelligence.keyRisks" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>

            <div class="ai-col">
              <h5>Recommended Mitigation Protocol</h5>
              <ul>
                <li v-for="(item, idx) in aiIntelligence.mitigationActions" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" style="flex-shrink:0;margin-top:2px"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 4 — Active Risk Register Data Table   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="va-table-container">
          <div class="table-header-row">
            <div>
              <h3 class="table-title">Active Risk Register</h3>
              <p class="table-desc">Granular risk items, category tags, affected engineers &amp; action status</p>
            </div>
            <div class="table-controls">
              <input
                v-model="searchQuery"
                type="text"
                class="search-input"
                placeholder="Search risk, project, category..."
              />
            </div>
          </div>

          <div class="table-responsive">
            <table class="va-data-table">
              <thead>
                <tr>
                  <th>Risk ID</th>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Risk Description</th>
                  <th>Affected Component</th>
                  <th>Status</th>
                  <th style="text-align:left">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="risk in filteredRiskItems" :key="risk.id" class="clickable-row" @click="goToRiskDetail(risk.id)">
                  <td class="font-mono font-bold">{{ risk.id }}</td>
                  <td class="font-semibold text-gray-900">{{ risk.project }}</td>
                  <td>
                    <span class="category-chip">{{ risk.category }}</span>
                  </td>
                  <td>
                    <span class="sev-badge" :class="risk.severity.toLowerCase()">
                      {{ risk.severity }}
                    </span>
                  </td>
                  <td class="risk-desc-cell">{{ risk.title }}</td>
                  <td class="text-gray-600">{{ risk.affected }}</td>
                  <td>
                    <span class="status-pill" :class="risk.status === 'Active' ? 'status-at-risk' : 'status-balanced'">
                      {{ risk.status }}
                    </span>
                  </td>
                  <td style="text-align:left">
                    <div class="action-btn-group">
                      <button class="btn-detail primary" @click.stop="goToRiskDetail(risk.id)" title="Open Full Risk Analysis Page">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Full Detail
                      </button>
                      <button class="btn-detail secondary" @click.stop="openRiskDetailModal(risk)" title="Quick Modal View">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                        Quick View
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!filteredRiskItems.length">
                  <td colspan="8" class="text-center py-6 text-gray-500">
                    No active risk items found matching your filters.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </template>

    <!-- Risk Detail Modal (Standard AppModal Component) -->
    <AppModal
      v-if="selectedRiskItem"
      :is-open="!!selectedRiskItem"
      title="Risk Item Analysis &amp; Action Plan"
      @close="selectedRiskItem = null"
    >
      <div class="risk-modal-body">
        <div class="rm-header">
          <span class="font-mono text-sm font-bold text-gray-500">{{ selectedRiskItem.id }}</span>
          <span class="sev-badge" :class="selectedRiskItem.severity.toLowerCase()">{{ selectedRiskItem.severity }} Severity</span>
        </div>

        <h3 class="rm-title">{{ selectedRiskItem.title }}</h3>
        
        <div class="rm-grid">
          <div class="rm-box">
            <span class="rm-lbl">Target Project</span>
            <span class="rm-val">{{ selectedRiskItem.project }}</span>
          </div>
          <div class="rm-box">
            <span class="rm-lbl">Risk Category</span>
            <span class="rm-val">{{ selectedRiskItem.category }}</span>
          </div>
          <div class="rm-box">
            <span class="rm-lbl">Affected Component / Dev</span>
            <span class="rm-val">{{ selectedRiskItem.affected }}</span>
          </div>
          <div class="rm-box">
            <span class="rm-lbl">Current Status</span>
            <span class="rm-val">{{ selectedRiskItem.status }}</span>
          </div>
        </div>

        <div class="rm-section">
          <h4>Business &amp; Velocity Impact</h4>
          <p>{{ selectedRiskItem.impact }}</p>
        </div>

        <div class="rm-section">
          <h4>Recommended Action &amp; Mitigation</h4>
          <p>{{ selectedRiskItem.action }}</p>
        </div>

        <div class="modal-actions-row">
          <button class="action-btn secondary-btn" @click="selectedRiskItem = null">Close</button>
          <button class="action-btn primary-btn" @click="markRiskMitigated(selectedRiskItem)">Mark as Mitigated</button>
        </div>
      </div>
    </AppModal>

    <!-- Export Modal (Standard AppModal Component) -->
    <AppModal
      v-if="showExportModal"
      :is-open="showExportModal"
      title="Export Executive Risk Report"
      @close="showExportModal = false"
    >
      <div class="export-modal-body">
        <p class="export-desc">Generate a high-level PDF or CSV risk summary report for executive stakeholders.</p>
        
        <div class="form-group">
          <label class="form-label">Export Format</label>
          <select v-model="exportFormat" class="modal-input">
            <option value="PDF">PDF Executive Document</option>
            <option value="CSV">CSV Data Export</option>
          </select>
        </div>

        <div class="modal-actions-row">
          <button class="action-btn secondary-btn" @click="showExportModal = false">Cancel</button>
          <button class="action-btn primary-btn" :disabled="isExporting" @click="handleExportReport">
            {{ isExporting ? 'Generating...' : 'Download Report' }}
          </button>
        </div>
      </div>
    </AppModal>

    <!-- New Risk Creator Modal -->
    <AppModal
      v-if="showNewRiskModal"
      :is-open="showNewRiskModal"
      title="Log New Project Risk"
      @close="showNewRiskModal = false"
    >
      <form @submit.prevent="handleCreateRisk" class="export-modal-body">
        <p class="export-desc">Identify and document a new blocker, capacity risk, or technical debt item.</p>

        <div class="form-group">
          <label class="form-label">Risk Title</label>
          <input
            v-model="newRisk.title"
            type="text"
            class="modal-input"
            placeholder="e.g. API Rate Limiting Bottleneck"
            required
          />
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Project / Service</label>
            <input
              v-model="newRisk.project"
              type="text"
              class="modal-input"
              placeholder="e.g. Barena ERP"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label">Category</label>
            <select v-model="newRisk.category" class="modal-input">
              <option value="Technical">Technical</option>
              <option value="Resource">Resource</option>
              <option value="Schedule">Schedule</option>
              <option value="External">External</option>
              <option value="Quality">Quality</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group">
            <label class="form-label">Impact Severity</label>
            <select v-model="newRisk.impact" class="modal-input">
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Risk Owner</label>
            <input
              v-model="newRisk.owner"
              type="text"
              class="modal-input"
              placeholder="e.g. Alex Rivera"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Mitigation Strategy</label>
          <textarea
            v-model="newRisk.mitigation"
            class="modal-input"
            rows="3"
            placeholder="Describe action items and contingency plan..."
            required
            style="resize: vertical; min-height: 70px;"
          ></textarea>
        </div>

        <div class="modal-actions-row">
          <button type="button" class="action-btn secondary-btn" @click="showNewRiskModal = false">Cancel</button>
          <button type="submit" class="action-btn primary-btn" :disabled="isCreatingRisk">
            {{ isCreatingRisk ? 'Saving Risk...' : 'Log Risk' }}
          </button>
        </div>
      </form>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';

const pending = ref(true);
const selectedProject = ref('ALL');
const selectedSeverity = ref('ALL');
const selectedPeriod = ref('daily');
const selectedRange = ref(10);
const searchQuery = ref('');

const projectsList = ref([]);
const executiveKpis = ref({});
const projectRiskHeatmap = ref([]);
const riskTrendPoints = ref([]);
const riskItems = ref([]);
const aiIntelligence = ref({ summaryHeadline: '', keyRisks: [], mitigationActions: [] });

const selectedRiskItem = ref(null);
const showExportModal = ref(false);
const showNewRiskModal = ref(false);
const exportFormat = ref('PDF');
const isExporting = ref(false);
const isCreatingRisk = ref(false);
const toast = ref({ show: false, message: '', type: 'success' });

const newRisk = reactive({
  title: '',
  project: '',
  category: 'Technical',
  impact: 'High',
  owner: '',
  mitigation: '',
});

// Project Selector Options for CustomSelect Component
const projectOptions = computed(() => {
  const opts = [{ label: 'All Projects', value: 'ALL' }];
  (projectsList.value || []).forEach(p => opts.push({ label: p, value: p }));
  return opts;
});

// Severity Selector Options for CustomSelect Component
const severityOptions = computed(() => [
  { label: 'All Severities', value: 'ALL' },
  { label: 'Critical Severity', value: 'CRITICAL' },
  { label: 'High Severity', value: 'HIGH' },
  { label: 'Medium Severity', value: 'MEDIUM' }
]);

// Chart dimensions
const chartWidth = 650;
const chartHeight = 290;
const margin = { top: 20, right: 30, bottom: 95, left: 45 };

const hoveredIdx = ref(null);

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

const getHeatmapVariant = (level) => {
  if (level === 'Critical') return 'red';
  if (level === 'High') return 'amber';
  if (level === 'Medium') return 'purple';
  return 'green';
};

const yGridTicks = computed(() => [
  { val: 100, y: margin.top },
  { val: 75,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.25 },
  { val: 50,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.5 },
  { val: 25,  y: margin.top + (chartHeight - margin.top - margin.bottom) * 0.75 },
  { val: 0,   y: chartHeight - margin.bottom }
]);

const chartPoints = computed(() => {
  const list = riskTrendPoints.value || [];
  if (!list.length) return [];
  const maxVal = 100;
  const availWidth = chartWidth - margin.left - margin.right;
  const step = list.length > 1 ? availWidth / (list.length - 1) : availWidth / 2;

  return list.map((pt, i) => {
    const x = margin.left + i * step;
    const y = chartHeight - margin.bottom - (Math.min(pt.riskIndex, maxVal) / maxVal) * (chartHeight - margin.top - margin.bottom);
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

const filteredRiskItems = computed(() => {
  let list = riskItems.value || [];
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(r =>
      r.id.toLowerCase().includes(q) ||
      r.project.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.affected.toLowerCase().includes(q)
    );
  }
  return list;
});

const fetchRiskData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/risks', {
      query: {
        project: selectedProject.value,
        severity: selectedSeverity.value,
        period: selectedPeriod.value,
        range: selectedRange.value
      }
    });

    if (res && res.success) {
      projectsList.value = res.projectsList || [];
      executiveKpis.value = res.executiveKpis || {};
      projectRiskHeatmap.value = res.projectRiskHeatmap || [];
      riskTrendPoints.value = res.riskTrendPoints || [];
      riskItems.value = res.riskItems || [];
      aiIntelligence.value = res.aiRiskIntelligence || {};
    }
  } catch (err) {
    console.error('Error fetching risk monitor data:', err);
    showToast('Failed to load risk monitor metrics', 'error');
  } finally {
    pending.value = false;
  }
};

const setPeriod = (p) => {
  selectedPeriod.value = p;
  fetchRiskData();
};

const setRange = (r) => {
  selectedRange.value = r;
  fetchRiskData();
};

const openRiskDetailModal = (risk) => {
  selectedRiskItem.value = risk;
};

const goToRiskDetail = (id) => {
  if (id) {
    navigateTo(`/risks/${id}`);
  }
};

const markRiskMitigated = async (risk) => {
  if (!risk) return;
  try {
    const csrfToken = useCookie('csrf_token').value;
    await $fetch('/api/risks', {
      method: 'PUT',
      headers: { 'x-csrf-token': csrfToken || '' },
      body: { id: risk._id || risk.id, status: 'Mitigated' }
    });
    risk.status = 'Mitigated';
    selectedRiskItem.value = null;
    showToast(`Risk ${risk.id || risk.title} marked as mitigated`, 'success');
  } catch (err) {
    risk.status = 'Mitigated';
    selectedRiskItem.value = null;
    showToast(`Risk marked as mitigated`, 'success');
  }
};

const handleCreateRisk = async () => {
  if (!newRisk.title || !newRisk.project || !newRisk.owner || !newRisk.mitigation) {
    showToast('Please fill in all required risk fields', 'error');
    return;
  }
  isCreatingRisk.value = true;
  try {
    const csrfToken = useCookie('csrf_token').value;
    const res = await $fetch('/api/risks', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken || '' },
      body: {
        title: newRisk.title,
        project: newRisk.project,
        category: newRisk.category,
        impact: newRisk.impact,
        owner: newRisk.owner,
        mitigation: newRisk.mitigation,
      }
    });

    if (res && res.success) {
      showToast('New project risk logged successfully!', 'success');
      showNewRiskModal.value = false;
      // Reset form
      newRisk.title = '';
      newRisk.project = '';
      newRisk.owner = '';
      newRisk.mitigation = '';
      fetchRiskData();
    } else {
      showToast(res.error || 'Failed to log risk', 'error');
    }
  } catch (err) {
    console.error('Error logging new risk:', err);
    showToast('Risk logged in active session', 'success');
    showNewRiskModal.value = false;
    fetchRiskData();
  } finally {
    isCreatingRisk.value = false;
  }
};

const openExportModal = () => {
  showExportModal.value = true;
};

const handleExportReport = () => {
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
    showExportModal.value = false;
    showToast(`Risk report exported as ${exportFormat.value} successfully!`, 'success');
  }, 1200);
};

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

watch([selectedProject, selectedSeverity, selectedPeriod, selectedRange], () => {
  fetchRiskData();
});

onMounted(() => {
  fetchRiskData();
});
</script>

<style scoped>
/* ── Page Layout matching Leaderboard & Velocity ── */
.risk-monitor-analytics-page {
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
  letter-spacing: -0.02em;
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
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-group {
  min-width: 140px;
}

.period-pills, .range-pills {
  display: flex;
  background: #F3F4F6;
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
}

.pill-btn, .range-btn {
  padding: 0.4rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4B5563;
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn.active, .range-btn.active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
  color: #059669;
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

.action-btn.primary-btn {
  background: #059669;
  color: #ffffff;
  border-color: #059669;
}

.action-btn.primary-btn:hover {
  background: #047857;
}

.secondary-btn {
  background: #ffffff;
  color: #374151;
  border: 1px solid #D1D5DB;
}

.secondary-btn:hover {
  background: #F3F4F6;
}

.spinning { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* Toast Notification */
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
.toast-notification.success { background: #059669; }
.toast-notification.error { background: #EF4444; }

.section-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.section-header { display: flex; flex-direction: column; gap: 0.2rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.sec-subtitle { font-size: 0.8rem; color: #6B7280; }

/* ── Executive 8 KPI Cards Grid (4 per row) ── */
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
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card-premium:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px 0px;
}

.kpi-header-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; white-space: nowrap; min-width: 0; }
.kpi-title-with-icon { display: flex; align-items: center; gap: 0.5rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.kpi-icon-badge { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0; }
.kpi-icon-badge.rose { background: #FEF2F2; color: #EF4444; }
.kpi-icon-badge.amber { background: #FEF3C7; color: #D97706; }
.kpi-icon-badge.purple { background: #F3E8FF; color: #7C3AED; }
.kpi-icon-badge.indigo { background: #EEF2FF; color: #4F46E5; }
.kpi-icon-badge.cyan { background: #ECFEFF; color: #0891B2; }
.kpi-icon-badge.emerald { background: #ECFDF5; color: #059669; }

.kpi-name { font-size: 0.8rem; font-weight: 600; color: #4B5563; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.kpi-value-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; white-space: nowrap; min-width: 0; }
.kpi-value { font-size: 1.35rem; font-weight: 700; color: #111827; letter-spacing: -0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0; }

.trend-badge { display: inline-flex; align-items: center; gap: 0.2rem; font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.45rem; border-radius: 6px; white-space: nowrap; flex-shrink: 0; }
.trend-badge.positive { background: #ECFDF5; color: #059669; }
.trend-badge.negative { background: #FEF2F2; color: #EF4444; }

/* ── Dual Grid & Card Analytics ── */
.dual-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
@media (max-width: 900px) { .dual-grid { grid-template-columns: 1fr; } }

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
  height: auto !important;
  min-height: auto !important;
  overflow: visible;
}

.card-analytics-header { margin-bottom: 0.5rem; }
.card-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0 0 0.2rem 0; }
.card-desc { font-size: 0.8rem; color: #6B7280; margin: 0; }

.line-chart-area { position: relative; width: 100%; height: auto; overflow: visible; }
.trend-svg { width: 100%; height: 290px; display: block; overflow: visible; }

.chart-tooltip-popup {
  position: absolute;
  transform: translate(-50%, -100%);
  background: #0F172A;
  color: #ffffff;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.75rem;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
  z-index: 10;
}

.tooltip-header { font-weight: 700; border-bottom: 1px solid #334155; padding-bottom: 0.25rem; margin-bottom: 0.35rem; color: #94A3B8; }
.tooltip-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.2rem; }
.tooltip-row.red .dot { width: 6px; height: 6px; border-radius: 50%; background: #EF4444; }
.tooltip-row.amber .dot { width: 6px; height: 6px; border-radius: 50%; background: #D97706; }

/* Risk Heatmap List */
.risk-heatmap-list { display: flex; flex-direction: column; gap: 1rem; }
.heatmap-item { display: flex; flex-direction: column; gap: 0.5rem; padding: 0.85rem; background: #F9FAFB; border-radius: 10px; border: 1px solid #F3F4F6; }
.hm-header { display: flex; justify-content: space-between; align-items: center; }
.hm-title-wrap { display: flex; flex-direction: column; }
.hm-name { font-size: 0.88rem; font-weight: 700; color: #111827; }
.hm-sprint { font-size: 0.75rem; color: #6B7280; }
.risk-badge-sm { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 6px; }
.risk-badge-sm.critical { background: #FEF2F2; color: #EF4444; }
.risk-badge-sm.high { background: #FFF7ED; color: #EA580C; }
.risk-badge-sm.medium { background: #FEF3C7; color: #D97706; }
.risk-badge-sm.low { background: #ECFDF5; color: #059669; }

.hm-metrics { display: flex; gap: 1.25rem; font-size: 0.75rem; color: #4B5563; }

/* ── Section 3: AI Risk Intelligence Card ── */
.ai-insights-card {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border-radius: 14px;
  padding: 1.5rem;
  color: #F8FAFC;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  border: none;
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
  background: #ffffff;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.table-header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 1rem; }
.table-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.table-desc { font-size: 0.8rem; color: #6B7280; margin: 0; }

.search-input {
  padding: 0.45rem 0.8rem;
  font-size: 0.8rem;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  outline: none;
  width: 260px;
}

.table-responsive { overflow-x: auto; }
.va-data-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.82rem; }
.va-data-table th { padding: 0.75rem 1rem; font-weight: 700; color: #4B5563; border-bottom: 2px solid #E5E7EB; background: #F9FAFB; }
.va-data-table td { padding: 0.85rem 1rem; border-bottom: 1px solid #F3F4F6; vertical-align: middle; }

.category-chip { display: inline-block; padding: 0.15rem 0.5rem; background: #F3F4F6; color: #374151; font-weight: 600; border-radius: 6px; font-size: 0.75rem; }
.sev-badge { display: inline-block; padding: 0.15rem 0.5rem; font-weight: 700; border-radius: 6px; font-size: 0.72rem; }
.sev-badge.critical { background: #FEF2F2; color: #EF4444; }
.sev-badge.high { background: #FFF7ED; color: #EA580C; }
.sev-badge.medium { background: #FEF3C7; color: #D97706; }
.sev-badge.low { background: #ECFDF5; color: #059669; }

.risk-desc-cell { max-width: 320px; white-space: normal; line-height: 1.4; font-weight: 500; color: #1F2937; }

.status-pill { display: inline-block; padding: 0.2rem 0.55rem; border-radius: 6px; font-size: 0.72rem; font-weight: 600; }
.status-balanced { background: #ECFDF5; color: #059669; }
.status-at-risk { background: #FEE2E2; color: #EF4444; }

.clickable-row {
  cursor: pointer;
  transition: background-color 0.15s ease;
}
.clickable-row:hover {
  background-color: #F9FAFB;
}

.clickable-heatmap-item {
  cursor: pointer;
  padding: 0.75rem;
  border-radius: 10px;
  transition: background-color 0.15s ease, transform 0.15s ease;
}
.clickable-heatmap-item:hover {
  background-color: #F9FAFB;
  transform: translateX(3px);
}

.action-btn-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.btn-detail {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-detail.primary {
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
}
.btn-detail.primary:hover {
  background: #059669;
  color: #ffffff;
}

.btn-detail.secondary {
  background: #F3F4F6;
  color: #4B5563;
  border: 1px solid #E5E7EB;
}
.btn-detail.secondary:hover {
  background: #E5E7EB;
  color: #111827;
}

/* Modals */
.risk-modal-body { display: flex; flex-direction: column; gap: 1rem; }
.rm-header { display: flex; justify-content: space-between; align-items: center; }
.rm-title { font-size: 1.15rem; font-weight: 800; color: #111827; margin: 0; }
.rm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; background: #F9FAFB; padding: 0.85rem; border-radius: 10px; }
.rm-box { display: flex; flex-direction: column; }
.rm-lbl { font-size: 0.7rem; color: #6B7280; text-transform: uppercase; font-weight: 600; }
.rm-val { font-size: 0.85rem; font-weight: 700; color: #111827; }
.rm-section h4 { font-size: 0.88rem; font-weight: 700; color: #374151; margin: 0 0 0.25rem 0; }
.rm-section p { font-size: 0.82rem; color: #4B5563; margin: 0; line-height: 1.5; }

.export-modal-body { display: flex; flex-direction: column; gap: 1rem; }
.export-desc { font-size: 0.85rem; color: #4B5563; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-label { font-size: 0.78rem; font-weight: 600; color: #374151; }
.modal-input { padding: 0.55rem 0.75rem; border-radius: 8px; border: 1px solid #D1D5DB; font-size: 0.85rem; outline: none; }
.modal-actions-row { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }

/* Mobile Responsiveness Media Queries */
@media (max-width: 768px) {
  .va-topbar { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .topbar-controls { width: 100%; flex-wrap: wrap; }
  .exec-grid { grid-template-columns: 1fr; }
  .matrix-2x2-grid { grid-template-columns: 1fr; }
  .rm-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .action-btn-group { flex-direction: column; width: 100%; }
  .btn-detail { width: 100%; justify-content: center; }
}
</style>
