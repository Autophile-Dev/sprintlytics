<template>
  <div class="sprint-health-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="sh-topbar">
      <div class="topbar-left">
        <h1 class="page-main-title">Sprint Health</h1>
        <p class="page-main-subtitle">Deep-dive analytics for sprint performance, risk &amp; team dynamics</p>
      </div>
      <div class="topbar-right">
        <div class="period-pills">
          <button v-for="p in ['daily','weekly','monthly']" :key="p"
            class="pill-btn" :class="{ active: selectedPeriod === p }" @click="setPeriod(p)">
            {{ p.charAt(0).toUpperCase() + p.slice(1) }}
          </button>
        </div>
        <div class="filter-group">
          <CustomSelect v-model="selectedProject" :options="projectOptions" @change="fetchData" />
        </div>
        <div v-if="currentData" class="gen-date-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          {{ formatDate(currentData.generatedAt) }}
        </div>
        <button class="icon-btn" @click="fetchData" :disabled="pending" title="Refresh">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
        <button class="action-btn" @click="exportExcel">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export
        </button>
        <button class="action-btn jira-btn" @click="openJiraBoard">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Open in Jira
        </button>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="pending" class="simple-loading-spinner"><div class="spinner"></div></div>

    <!-- Select project prompt -->
    <div v-else-if="!selectedProject" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
      </div>
      <h2>Select a Project</h2>
      <p>Choose a project from the dropdown above to view Sprint Health analytics.</p>
    </div>

    <!-- No data -->
    <div v-else-if="!currentData && !pending" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      </div>
      <h2>No Sprint Data Found</h2>
      <p>No performance records found for <strong>{{ selectedProject }}</strong>.</p>
      <NuxtLink to="/" class="btn-primary-link">← Back to Dashboard</NuxtLink>
    </div>

    <!-- ── MAIN CONTENT ── -->
    <template v-else>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Sprint Health Hero                 -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="hero-card">

          <!-- Left: Big Ring -->
          <div class="hero-ring-col">
            <div class="hero-ring-wrap">
              <CircularHealthRing :value="kpis.healthScore || 0" :size="190" :stroke-width="16" :show-label="true" label="Health" />
            </div>
            <div class="hero-health-label" :class="healthClass">{{ healthLabel }}</div>
          </div>

          <!-- Center: Sprint Info + Timeline -->
          <div class="hero-center-col">
            <div class="hero-sprint-header">
              <div class="hero-sprint-name-row">
                <h2 class="hero-sprint-name">{{ sprint.name || 'Active Sprint' }}</h2>
                <span class="sprint-state-pill" :class="sprint.state || 'active'">{{ sprint.state || 'Active' }}</span>
              </div>
              <p v-if="sprint.goal" class="hero-sprint-goal">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {{ sprint.goal }}
              </p>
            </div>

            <div class="hero-dates-row">
              <div class="hero-date-item">
                <span class="hd-label">Start Date</span>
                <span class="hd-val">{{ formatDate(sprint.startDate) }}</span>
              </div>
              <div class="hero-date-sep"></div>
              <div class="hero-date-item">
                <span class="hd-label">End Date</span>
                <span class="hd-val">{{ formatDate(sprint.endDate) }}</span>
              </div>
              <div class="hero-date-sep"></div>
              <div class="hero-date-item">
                <span class="hd-label">Days Remaining</span>
                <span class="hd-val days-remaining" :class="sprintDaysRemaining <= 3 ? 'critical' : sprintDaysRemaining <= 7 ? 'warn' : 'safe'">
                  {{ sprintDaysRemaining }}d
                </span>
              </div>
            </div>

            <div class="hero-timeline">
              <div class="htl-header">
                <span class="htl-label">Sprint Timeline</span>
                <span class="htl-pct">{{ sprintTimelinePct }}% elapsed · {{ sprintDaysPassed }}d / {{ sprintDaysTotal }}d</span>
              </div>
              <div class="htl-track">
                <div class="htl-fill" :style="{ width: sprintTimelinePct + '%' }">
                  <div class="htl-pulse"></div>
                </div>
              </div>
              <div class="htl-labels">
                <span>{{ formatDateShort(sprint.startDate) }}</span>
                <span>{{ formatDateShort(sprint.endDate) }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Key Stats + Trend -->
          <div class="hero-right-col">
            <div class="hero-stat-block">
              <span class="hsb-label">Completion</span>
              <span class="hsb-val" style="color:#2563EB">{{ kpis.completionPct || 0 }}%</span>
              <div class="hsb-track"><div class="hsb-fill blue" :style="{ width: (kpis.completionPct || 0) + '%' }"></div></div>
              <span class="hsb-sub">{{ kpis.done || 0 }} of {{ kpis.totalIssues || 0 }} tasks done</span>
            </div>

            <div class="hero-stat-block">
              <span class="hsb-label">Story Points</span>
              <span class="hsb-val" style="color:#059669">{{ kpis.storyPointsCompleted || 0 }}<small>/{{ kpis.storyPointsTotal || 0 }}</small></span>
              <div class="hsb-track"><div class="hsb-fill emerald" :style="{ width: spCompletedPct + '%' }"></div></div>
              <span class="hsb-sub">{{ spCompletedPct }}% story points complete</span>
            </div>

            <div v-if="trend" class="hero-trend-pills">
              <span class="trend-pill-sm" :class="(trend.healthScore || 0) >= 0 ? 'positive' : 'negative'">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.healthScore||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.healthScore||0) >= 0 ? '+' : '' }}{{ trend.healthScore }}% health
              </span>
              <span class="trend-pill-sm" :class="(trend.completionPct || 0) >= 0 ? 'positive' : 'negative'">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.completionPct||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.completionPct||0) >= 0 ? '+' : '' }}{{ trend.completionPct }}% completion
              </span>
              <span class="trend-pill-sm" :class="(trend.velocity || 0) >= 0 ? 'positive' : 'negative'">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.velocity||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.velocity||0) >= 0 ? '+' : '' }}{{ trend.velocity }} velocity
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 2 — Executive KPI Cards               -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Executive KPI Cards</h2>
            <p class="section-subtitle">Real-time sprint KPIs compared to previous {{ selectedPeriod }} snapshot</p>
          </div>
        </div>
        <div class="kpi-cards-grid kpi-5col">

          <!-- 1: Sprint Completion % (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge blue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
                <span class="kpi-name">Sprint Completion</span>
              </div>
              <span class="info-icon" title="Percentage of sprint tasks completed">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpis.completionPct || 0 }}%</span>
              <span v-if="trend" class="trend-badge" :class="(trend.completionPct||0) >= 0 ? 'positive' : 'negative'">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.completionPct||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.completionPct||0) >= 0 ? '+' : '' }}{{ trend.completionPct }}%
              </span>
            </div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="positive" :height="32" :points="[45, 52, 60, 58, 65, 72, 70, kpis.completionPct || 78]" />
            </div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Tasks Done</span><span class="kpi-footer-val">{{ kpis.done || 0 }} / {{ kpis.totalIssues || 0 }}</span></div>
          </div>

          <!-- 2: Health Score (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge emerald"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
                <span class="kpi-name">Health Score</span>
              </div>
              <span class="info-icon" title="Overall sprint health score">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpis.healthScore || 0 }}%</span>
              <span v-if="trend" class="trend-badge" :class="(trend.healthScore||0) >= 0 ? 'positive' : 'negative'">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.healthScore||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.healthScore||0) >= 0 ? '+' : '' }}{{ trend.healthScore }}%
              </span>
            </div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="positive" :height="32" :points="[68, 72, 75, 80, 78, 84, 82, kpis.healthScore || 88]" />
            </div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Status</span><span class="kpi-footer-val">{{ healthLabel }}</span></div>
          </div>

          <!-- 3: SP Completed (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge purple"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
                <span class="kpi-name">SP Completed</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpis.storyPointsCompleted || 0 }}<span class="unit">pts</span></span>
              <span v-if="trend" class="trend-badge" :class="(trend.storyPointsCompleted||0) >= 0 ? 'positive' : 'negative'">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.storyPointsCompleted||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.storyPointsCompleted||0) >= 0 ? '+' : '' }}{{ trend.storyPointsCompleted }}
              </span>
            </div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="neutral" :height="32" :points="[20, 35, 45, 60, 75, 90, 110, kpis.storyPointsCompleted || 120]" />
            </div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Total Planned</span><span class="kpi-footer-val">{{ kpis.storyPointsTotal || 0 }} pts</span></div>
          </div>

          <!-- 4: SP Remaining (Smooth Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge amber"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <span class="kpi-name">SP Remaining</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value">{{ kpis.storyPointsRemaining || 0 }}<span class="unit">pts</span></span></div>
            <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm orange" :style="{ width: Math.max(0, 100 - spCompletedPct) + '%' }"></div></div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Completion</span><span class="kpi-footer-val">{{ spCompletedPct }}% done</span></div>
          </div>

          <!-- 5: Total SP (Smooth Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge blue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></div>
                <span class="kpi-name">Total SP</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value">{{ kpis.storyPointsTotal || 0 }}<span class="unit">pts</span></span></div>
            <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm blue" :style="{ width: spCompletedPct + '%' }"></div></div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">SP Progress</span><span class="kpi-footer-val">{{ kpis.storyPointsCompleted || 0 }} / {{ kpis.storyPointsTotal || 0 }}</span></div>
          </div>

          <!-- 6: Velocity (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge purple"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <span class="kpi-name">Velocity</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpis.velocity || 0 }}<span class="unit">pts</span></span>
              <span v-if="trend" class="trend-badge" :class="(trend.velocity||0) >= 0 ? 'positive' : 'negative'">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.velocity||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.velocity||0) >= 0 ? '+' : '' }}{{ trend.velocity }}
              </span>
            </div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="positive" :height="32" :points="[22, 28, 25, 32, 30, 38, 35, kpis.velocity || 42]" />
            </div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">SP Delivered</span><span class="kpi-footer-val">This sprint</span></div>
          </div>

          <!-- 7: Total Issues (Smooth Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge blue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></div>
                <span class="kpi-name">Total Issues</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value">{{ kpis.totalIssues || 0 }}</span></div>
            <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm blue" :style="{ width: (kpis.completionPct || 0) + '%' }"></div></div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Completed</span><span class="kpi-footer-val">{{ kpis.done || 0 }} issues</span></div>
          </div>

          <!-- 8: Done Issues (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge emerald"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg></div>
                <span class="kpi-name">Done Issues</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value text-success">{{ kpis.done || 0 }}</span>
              <span v-if="trend" class="trend-badge" :class="(trend.done||0) >= 0 ? 'positive' : 'negative'">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.done||0) >= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.done||0) >= 0 ? '+' : '' }}{{ trend.done }}
              </span>
            </div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="positive" :height="32" :points="[5, 12, 18, 25, 30, 38, 45, kpis.done || 52]" />
            </div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Completion Rate</span><span class="kpi-footer-val">{{ kpis.completionPct || 0 }}%</span></div>
          </div>

          <!-- 9: In Progress (Smooth Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge blue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg></div>
                <span class="kpi-name">In Progress</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value">{{ kpis.inProgress || 0 }}</span></div>
            <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm blue" :style="{ width: inProgressPct + '%' }"></div></div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Active Work</span><span class="kpi-footer-val">{{ inProgressPct }}% of total</span></div>
          </div>

          <!-- 10: Todo (Smooth Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge amber"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></div>
                <span class="kpi-name">Todo Issues</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value">{{ kpis.todo || 0 }}</span></div>
            <div class="progress-bar-track-sm"><div class="progress-bar-fill-sm orange" :style="{ width: todoPct + '%' }"></div></div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Not Started</span><span class="kpi-footer-val">{{ todoPct }}% of total</span></div>
          </div>

          <!-- 11: Blocked (Line Chart - Red/Negative) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge red"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></div>
                <span class="kpi-name">Blocked Issues</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value" :class="(kpis.blocked||0) > 0 ? 'text-danger' : ''">{{ kpis.blocked || 0 }}</span>
              <span v-if="trend" class="trend-badge" :class="(trend.blocked||0) <= 0 ? 'positive' : 'negative'">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path :d="(trend.blocked||0) <= 0 ? 'M12 4l8 8H4z' : 'M12 20l8-8H4z'"/></svg>
                {{ (trend.blocked||0) > 0 ? '+' : '' }}{{ trend.blocked }}
              </span>
            </div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="negative" :height="32" :points="[8, 6, 9, 5, 4, 3, 2, kpis.blocked || 0]" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Severity</span>
              <span class="kpi-footer-val" :class="(kpis.blocked||0) > 2 ? 'text-danger' : 'text-success'">{{ (kpis.blocked||0) > 2 ? 'High Risk' : (kpis.blocked||0) > 0 ? 'Low Risk' : 'Clear' }}</span>
            </div>
          </div>

          <!-- 12: Overdue (Line Chart - Red/Negative) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge red"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
                <span class="kpi-name">Overdue Issues</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value" :class="(kpis.overdue||0) > 0 ? 'text-danger' : ''">{{ kpis.overdue || 0 }}</span></div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="negative" :height="32" :points="[12, 10, 8, 9, 6, 5, 3, kpis.overdue || 1]" />
            </div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Overdue Rate</span><span class="kpi-footer-val">{{ overduePct }}%</span></div>
          </div>

          <!-- 13: Open Bugs (Line Chart - Orange) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge orange">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5A3 3 0 0 1 15 7.5V13a3 3 0 0 1-6 0V7.5z"/><path d="M6 11H3"/><path d="M21 11h-3"/><path d="M6 7L4 5"/><path d="M18 7l2-2"/></svg>
                </div>
                <span class="kpi-name">Open Bugs</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value" :class="(kpis.bugCount||0) > 5 ? 'text-danger' : ''">{{ kpis.bugCount || 0 }}</span></div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="orange" :height="32" :points="[10, 14, 11, 8, 6, 9, 5, kpis.bugCount || 3]" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Quality Index</span>
              <span class="kpi-footer-val" :class="(kpis.bugCount||0) > 5 ? 'text-danger' : 'text-success'">{{ (kpis.bugCount||0) === 0 ? 'Clean' : (kpis.bugCount||0) < 5 ? 'Moderate' : 'High Debt' }}</span>
            </div>
          </div>

          <!-- 14: High Priority (Segmented Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge amber"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg></div>
                <span class="kpi-name">High Priority</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value">{{ kpis.highPriority || 0 }}</span></div>
            <div class="kpi-segmented-wrap"><SegmentedProgressBar :value="highPriorityPct" variant="orange" height="22px" :total-segments="44" /></div>
            <div class="kpi-footer-row"><span class="kpi-footer-label">Priority Rate</span><span class="kpi-footer-val">{{ highPriorityPct }}% of issues</span></div>
          </div>

          <!-- 15: Avg Resolution (Line Chart - Neutral) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge blue"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <span class="kpi-name">Avg Resolution</span>
              </div>
              <span class="info-icon">ⓘ</span>
            </div>
            <div class="kpi-value-row"><span class="kpi-value">{{ kpis.avgResolutionHours || 0 }}<span class="unit">hrs</span></span></div>
            <div class="kpi-sparkline-wrap">
              <SparklineChart variant="neutral" :height="32" :points="[36, 32, 28, 30, 24, 22, 20, kpis.avgResolutionHours || 18]" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">SLA Target</span>
              <span class="kpi-footer-val" :class="(kpis.avgResolutionHours||0) <= 24 ? 'text-success' : 'text-danger'">{{ (kpis.avgResolutionHours||0) <= 24 ? 'On Target' : 'Above SLA' }}</span>
            </div>
          </div>

        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 — Sprint Progress Overview          -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div><h2 class="section-title">Sprint Progress Overview</h2><p class="section-subtitle">Timeline, story points, issue breakdown and team capacity</p></div>
        </div>
        <div class="prog-overview-grid">

          <!-- Sprint Timeline -->
          <div class="card prog-card">
            <div class="card-header pb-3"><h3 class="card-title font-playfair font-bold">Sprint Timeline</h3></div>
            <div class="prog-body">
              <div class="prog-stat-trio">
                <div class="prog-stat"><span class="ps-num">{{ sprintDaysTotal }}</span><span class="ps-lbl">Total Days</span></div>
                <div class="prog-stat"><span class="ps-num" style="color:#2563EB">{{ sprintDaysPassed }}</span><span class="ps-lbl">Elapsed</span></div>
                <div class="prog-stat"><span class="ps-num" :style="{ color: sprintDaysRemaining <= 3 ? '#EF4444' : sprintDaysRemaining <= 7 ? '#F59E0B' : '#059669' }">{{ sprintDaysRemaining }}</span><span class="ps-lbl">Remaining</span></div>
              </div>
              <div class="prog-bar-header"><span>Sprint Start</span><span>{{ sprintTimelinePct }}% elapsed</span><span>Sprint End</span></div>
              <div class="prog-bar-track">
                <div class="prog-bar-fill" :style="{ width: sprintTimelinePct + '%', background: 'linear-gradient(90deg,#2563EB,#6366F1)' }">
                  <div class="prog-bar-glow"></div>
                </div>
              </div>
              <div class="prog-bar-dates"><span>{{ formatDateShort(sprint.startDate) }}</span><span>{{ formatDateShort(sprint.endDate) }}</span></div>
            </div>
          </div>

          <!-- Story Point Progress -->
          <div class="card prog-card">
            <div class="card-header pb-3"><h3 class="card-title font-playfair font-bold">Story Point Progress</h3></div>
            <div class="prog-body">
              <div class="prog-stat-trio">
                <div class="prog-stat"><span class="ps-num" style="color:#059669">{{ kpis.storyPointsCompleted || 0 }}</span><span class="ps-lbl">Completed</span></div>
                <div class="prog-stat"><span class="ps-num" style="color:#F59E0B">{{ kpis.storyPointsRemaining || 0 }}</span><span class="ps-lbl">Remaining</span></div>
                <div class="prog-stat"><span class="ps-num">{{ kpis.storyPointsTotal || 0 }}</span><span class="ps-lbl">Total</span></div>
              </div>
              <div class="sp-seg-wrap"><SegmentedProgressBar :value="spCompletedPct" variant="emerald" height="28px" :total-segments="44" /></div>
              <div class="sp-pct-row"><span class="sp-pct-text">{{ spCompletedPct }}% Story Points Delivered</span></div>
            </div>
          </div>

          <!-- Issue Completion Stacked -->
          <div class="card prog-card">
            <div class="card-header pb-3"><h3 class="card-title font-playfair font-bold">Issue Completion</h3></div>
            <div class="prog-body">
              <div class="issue-stacked-bar-wrap">
                <div class="issue-stacked-bar">
                  <div class="isb-seg done" :style="{ flex: kpis.done || 0 }" :title="`Done: ${kpis.done || 0}`"></div>
                  <div class="isb-seg inprog" :style="{ flex: kpis.inProgress || 0 }" :title="`In Progress: ${kpis.inProgress || 0}`"></div>
                  <div class="isb-seg todo" :style="{ flex: kpis.todo || 0 }" :title="`Todo: ${kpis.todo || 0}`"></div>
                  <div class="isb-seg blocked" :style="{ flex: kpis.blocked || 0 }" :title="`Blocked: ${kpis.blocked || 0}`"></div>
                </div>
              </div>
              <div class="issue-legend-grid">
                <div class="ilg-item"><span class="ilg-dot done"></span><span class="ilg-lbl">Done</span><span class="ilg-cnt">{{ kpis.done || 0 }}</span></div>
                <div class="ilg-item"><span class="ilg-dot inprog"></span><span class="ilg-lbl">In Progress</span><span class="ilg-cnt">{{ kpis.inProgress || 0 }}</span></div>
                <div class="ilg-item"><span class="ilg-dot todo"></span><span class="ilg-lbl">Todo</span><span class="ilg-cnt">{{ kpis.todo || 0 }}</span></div>
                <div class="ilg-item"><span class="ilg-dot blocked"></span><span class="ilg-lbl">Blocked</span><span class="ilg-cnt">{{ kpis.blocked || 0 }}</span></div>
              </div>
            </div>
          </div>

          <!-- Sprint Capacity -->
          <div class="card prog-card">
            <div class="card-header pb-3"><h3 class="card-title font-playfair font-bold">Sprint Capacity</h3></div>
            <div class="prog-body">
              <div class="capacity-rows">
                <div class="cap-row"><span class="cap-lbl">Planned</span><div class="cap-track"><div class="cap-fill" style="width:100%;background:#E5E7EB"></div></div><span class="cap-val">{{ kpis.storyPointsTotal || 0 }}pts</span></div>
                <div class="cap-row"><span class="cap-lbl">Consumed</span><div class="cap-track"><div class="cap-fill" :style="{ width: spCompletedPct + '%', background: '#2563EB' }"></div></div><span class="cap-val">{{ kpis.storyPointsCompleted || 0 }}pts</span></div>
                <div class="cap-row"><span class="cap-lbl">Remaining</span><div class="cap-track"><div class="cap-fill" :style="{ width: (100 - spCompletedPct) + '%', background: '#F59E0B' }"></div></div><span class="cap-val">{{ kpis.storyPointsRemaining || 0 }}pts</span></div>
              </div>
              <div class="cap-efficiency-row">
                <span class="cap-eff-lbl">Capacity Utilization</span>
                <span class="cap-eff-val" :class="spCompletedPct >= 70 ? 'text-success' : 'text-warning'">{{ spCompletedPct }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 4 — Workflow Status Breakdown         -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="statusColumns.length">
        <div class="section-header">
          <div><h2 class="section-title">Workflow Status Breakdown</h2><p class="section-subtitle">Issue distribution across all Jira workflow columns</p></div>
          <span class="section-count-badge">{{ statusColumns.length }} statuses</span>
        </div>
        <div class="card">
          <div class="workflow-list">
            <div v-for="col in statusColumns" :key="col.name" class="workflow-row">
              <div class="workflow-left">
                <span class="workflow-dot" :style="{ background: col.color || '#6B7280' }"></span>
                <span class="workflow-name">{{ col.name }}</span>
                <span class="workflow-cat-badge">{{ col.categoryKey }}</span>
              </div>
              <div class="workflow-bar-wrap">
                <div class="workflow-bar-track">
                  <div class="workflow-bar-fill" :style="{ width: workflowPct(col.count) + '%', background: col.color || '#6B7280' }"></div>
                </div>
              </div>
              <div class="workflow-right">
                <span class="workflow-count">{{ col.count }}</span>
                <span class="workflow-pct-badge">{{ workflowPct(col.count) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 5 — Sprint Performance Analytics      -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div><h2 class="section-title">Sprint Performance Analytics</h2><p class="section-subtitle">Trend analysis across historical report snapshots</p></div>
        </div>
        <div class="charts-2x2-grid">

          <!-- Completion Trend -->
          <div class="card chart-card">
            <div class="card-header pb-3 mb-3"><h3 class="card-title font-playfair font-bold">Completion Trend</h3><span class="card-tag">Line Chart</span></div>
            <div class="card-body">
              <div class="inline-chart">
                <template v-if="historyPoints.length > 1">
                  <svg viewBox="0 0 400 160" class="chart-svg">
                    <defs><linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2563EB" stop-opacity="0.18"/><stop offset="100%" stop-color="#2563EB" stop-opacity="0"/></linearGradient></defs>
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#F3F4F6" stroke-width="1"/>
                    <line x1="0" y1="80" x2="400" y2="80" stroke="#F3F4F6" stroke-width="1"/>
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#F3F4F6" stroke-width="1"/>
                    <polygon :points="completionAreaPoints" fill="url(#cGrad)"/>
                    <polyline :points="completionLinePoints" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle v-for="(pt, i) in completionDots" :key="i" :cx="pt.x" :cy="pt.y" r="4" fill="#2563EB" stroke="white" stroke-width="2"/>
                  </svg>
                  <div class="chart-x-labels"><span v-for="(p, i) in historyPoints" :key="i">{{ p.label }}</span></div>
                </template>
                <div v-else class="chart-empty">Not enough history snapshots yet</div>
              </div>
            </div>
          </div>

          <!-- Velocity Trend -->
          <div class="card chart-card">
            <div class="card-header pb-3 mb-3"><h3 class="card-title font-playfair font-bold">Velocity Trend</h3><span class="card-tag">Bar Chart</span></div>
            <div class="card-body">
              <div class="inline-chart">
                <div class="vel-chart-area" v-if="historyPoints.length">
                  <div v-for="(p, i) in historyPoints" :key="i" class="vel-col" :title="`${p.label}: ${p.velocity}pts`">
                    <div class="vel-bar" :style="{ height: velBarHeight(p.velocity) + '%', background: i === historyPoints.length - 1 ? '#7C3AED' : 'rgba(124,58,237,0.2)' }"></div>
                    <span class="vel-x-lbl">{{ p.label }}</span>
                  </div>
                </div>
                <div v-else class="chart-empty">No history data</div>
              </div>
            </div>
          </div>

          <!-- Health Score Trend -->
          <div class="card chart-card">
            <div class="card-header pb-3 mb-3"><h3 class="card-title font-playfair font-bold">Health Score Trend</h3><span class="card-tag">Line Chart</span></div>
            <div class="card-body">
              <div class="inline-chart">
                <template v-if="historyPoints.length > 1">
                  <svg viewBox="0 0 400 160" class="chart-svg">
                    <defs><linearGradient id="hGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#059669" stop-opacity="0.18"/><stop offset="100%" stop-color="#059669" stop-opacity="0"/></linearGradient></defs>
                    <line x1="0" y1="40" x2="400" y2="40" stroke="#F3F4F6" stroke-width="1"/>
                    <line x1="0" y1="80" x2="400" y2="80" stroke="#F3F4F6" stroke-width="1"/>
                    <line x1="0" y1="120" x2="400" y2="120" stroke="#F3F4F6" stroke-width="1"/>
                    <polygon :points="healthAreaPoints" fill="url(#hGrad)"/>
                    <polyline :points="healthLinePoints" fill="none" stroke="#059669" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle v-for="(pt, i) in healthDots" :key="i" :cx="pt.x" :cy="pt.y" r="4" fill="#059669" stroke="white" stroke-width="2"/>
                  </svg>
                  <div class="chart-x-labels"><span v-for="(p, i) in historyPoints" :key="i">{{ p.label }}</span></div>
                </template>
                <div v-else class="chart-empty">Not enough history snapshots yet</div>
              </div>
            </div>
          </div>

          <!-- Burndown Preview -->
          <div class="card chart-card">
            <div class="card-header pb-3 mb-3"><h3 class="card-title font-playfair font-bold">Burndown Preview</h3><span class="card-tag">Burndown</span></div>
            <div class="card-body">
              <div class="inline-chart">
                <svg viewBox="0 0 400 160" class="chart-svg">
                  <line x1="0" y1="40" x2="400" y2="40" stroke="#F3F4F6" stroke-width="1"/>
                  <line x1="0" y1="80" x2="400" y2="80" stroke="#F3F4F6" stroke-width="1"/>
                  <line x1="0" y1="120" x2="400" y2="120" stroke="#F3F4F6" stroke-width="1"/>
                  <!-- Ideal line (dashed) -->
                  <line x1="10" y1="15" x2="390" y2="148" stroke="#9CA3AF" stroke-width="1.5" stroke-dasharray="6,4"/>
                  <!-- Actual -->
                  <polyline :points="burndownActual" fill="none" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <!-- Forecast -->
                  <polyline :points="burndownForecast" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="4,4"/>
                  <!-- Legend -->
                  <line x1="10" y1="150" x2="24" y2="150" stroke="#9CA3AF" stroke-width="1.5" stroke-dasharray="3,2"/>
                  <text x="28" y="153" font-size="9" fill="#9CA3AF" font-family="Open Sans, sans-serif">Ideal</text>
                  <line x1="70" y1="150" x2="84" y2="150" stroke="#EF4444" stroke-width="2"/>
                  <text x="88" y="153" font-size="9" fill="#EF4444" font-family="Open Sans, sans-serif">Actual</text>
                  <line x1="132" y1="150" x2="146" y2="150" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3,2"/>
                  <text x="150" y="153" font-size="9" fill="#F59E0B" font-family="Open Sans, sans-serif">Forecast</text>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 6 — Priority Distribution             -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="activePriorities.length">
        <div class="section-header">
          <div><h2 class="section-title">Priority Distribution</h2><p class="section-subtitle">Work breakdown by priority level with story point tracking</p></div>
        </div>
        <div class="priority-dist-grid">
          <div v-for="p in activePriorities" :key="p.priority" class="priority-dist-card">
            <div class="pdc-top">
              <div class="pdc-badge-row">
                <span class="pdc-priority-badge" :style="{ background: p.color || '#6B7280', color: '#fff' }">{{ p.priority }}</span>
                <span class="pdc-total">{{ p.total }} issues</span>
              </div>
              <div class="pdc-stat-row">
                <div class="pdc-stat"><span class="pdc-sn emerald">{{ p.done }}</span><span class="pdc-sl">Done</span></div>
                <div class="pdc-stat"><span class="pdc-sn blue">{{ p.inProgress }}</span><span class="pdc-sl">Active</span></div>
                <div class="pdc-stat"><span class="pdc-sn">{{ p.storyPoints || 0 }}</span><span class="pdc-sl">Story Pts</span></div>
                <div class="pdc-stat"><span class="pdc-sn" :class="(p.blocked||0) > 0 ? 'text-danger' : ''">{{ p.blocked || 0 }}</span><span class="pdc-sl">Blocked</span></div>
              </div>
            </div>
            <div class="pdc-bottom">
              <SegmentedProgressBar :value="p.total > 0 ? Math.round((p.done/p.total)*100) : 0" :variant="getPriorityVariant(p.priority)" height="18px" :total-segments="32" />
              <div class="pdc-pct-row">
                <span>Completion</span>
                <span>{{ p.total > 0 ? Math.round((p.done/p.total)*100) : 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 7 — Sprint Quality Metrics            -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div><h2 class="section-title">Sprint Quality Metrics</h2><p class="section-subtitle">Quality indicators, stability scores and delivery confidence</p></div>
        </div>
        <div class="quality-grid">
          <div v-for="q in qualityMetrics" :key="q.name" class="quality-card">
            <div class="qc-header">
              <div class="qc-icon" :class="q.color">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="q.icon"></svg>
              </div>
              <span class="qc-name">{{ q.name }}</span>
            </div>
            <div class="qc-val-row">
              <span class="qc-val">{{ q.value }}</span>
              <span class="qc-status-badge" :class="q.status">{{ q.statusLabel }}</span>
            </div>
            <div class="qc-mini-bar-track">
              <div class="qc-mini-bar-fill" :class="q.color" :style="{ width: q.pct + '%' }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 8 — Team Sprint Snapshot              -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div><h2 class="section-title">Team Sprint Snapshot</h2><p class="section-subtitle">Workload distribution and top contributor performance</p></div>
        </div>

        <!-- Team Overview Stats Row -->
        <div class="team-overview-row">
          <div class="team-stat-tile"><span class="tst-val">{{ teamStats.total }}</span><span class="tst-lbl">Team Members</span></div>
          <div class="team-stat-tile balanced"><span class="tst-val" style="color:#059669">{{ teamStats.balanced }}</span><span class="tst-lbl">Balanced</span></div>
          <div class="team-stat-tile overloaded"><span class="tst-val" style="color:#EF4444">{{ teamStats.overloaded }}</span><span class="tst-lbl">Overloaded</span></div>
          <div class="team-stat-tile under"><span class="tst-val" style="color:#F59E0B">{{ teamStats.underutilized }}</span><span class="tst-lbl">Underutilized</span></div>
          <div class="team-stat-tile unassigned"><span class="tst-val" style="color:#6B7280">{{ teamStats.unassigned }}</span><span class="tst-lbl">Unassigned</span></div>
        </div>

        <!-- Member Cards -->
        <div class="member-cards-grid">
          <div v-for="m in activeTeam" :key="m.name" class="member-card" style="cursor: pointer" @click="openMemberProfile(m)">
            <div class="mc-avatar" :style="{ background: memberColor(m.name) }">{{ memberInitials(m.name) }}</div>
            <div class="mc-body">
              <div class="mc-name-row">
                <span class="mc-name">{{ m.name }}</span>
                <span class="mc-status" :class="getMemberStatusClass(m.status)">{{ m.status || 'Active' }}</span>
              </div>
              <div class="mc-stats-row">
                <span class="mc-stat"><strong>{{ m.assigned }}</strong> <span>assigned</span></span>
                <span class="mc-stat"><strong>{{ m.completed }}</strong> <span>done</span></span>
                <span class="mc-stat"><strong>{{ m.storyPointsDelivered || 0 }}</strong> <span>SP</span></span>
              </div>
              <div class="mc-prog-wrap">
                <div class="mc-prog-track">
                  <div class="mc-prog-fill" :style="{ width: (m.completionRate || 0) + '%', background: memberColor(m.name) }"></div>
                </div>
                <span class="mc-prog-pct">{{ m.completionRate || 0 }}%</span>
              </div>
              <div class="mc-util">Utilization: {{ m.utilizationPct || 0 }}%</div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 9 — Sprint Risk Center                -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div><h2 class="section-title">Sprint Risk Center</h2><p class="section-subtitle">Active risks, blockers and dependency issues requiring attention</p></div>
          <div class="risk-overall-badge" :class="overallRisk.toLowerCase()">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>
            {{ overallRisk }} Risk
          </div>
        </div>
        <div class="risk-grid">
          <div v-for="r in riskCards" :key="r.name" class="risk-card" :class="r.level.toLowerCase()">
            <div class="rc-header">
              <div class="rc-icon" :class="r.level.toLowerCase()">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" v-html="r.icon"></svg>
              </div>
              <span class="rc-level-badge" :class="r.level.toLowerCase()">{{ r.level }}</span>
            </div>
            <div class="rc-name">{{ r.name }}</div>
            <div class="rc-value">{{ r.value }}</div>
            <div class="rc-desc">{{ r.desc }}</div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 10 — AI Sprint Intelligence           -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="analysis.executiveSummary || analysis.recommendations?.length">
        <div class="section-header">
          <div><h2 class="section-title">AI Sprint Intelligence</h2><p class="section-subtitle">AI-generated executive insights synthesized from sprint data</p></div>
          <div class="ai-live-badge"><span class="dot pulse"></span>AI Synthesized</div>
        </div>
        <div class="card ai-intel-card">
          <div class="ai-exec-summary" v-if="analysis.executiveSummary">
            <div class="ai-section-header">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
              Executive Summary
            </div>
            <p class="ai-summary-p">{{ analysis.executiveSummary }}</p>
          </div>
          <div class="ai-insight-cols">
            <div class="ai-col" v-if="analysis.keyAchievements?.length">
              <div class="ai-col-hdr achievement"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>Key Achievements</div>
              <ul class="ai-list"><li v-for="(a,i) in analysis.keyAchievements" :key="i" class="ai-item achievement">{{ a }}</li></ul>
            </div>
            <div class="ai-col" v-if="analysis.risks?.length">
              <div class="ai-col-hdr risk"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>Sprint Risks</div>
              <ul class="ai-list"><li v-for="(r,i) in analysis.risks" :key="i" class="ai-item risk">{{ r }}</li></ul>
            </div>
            <div class="ai-col" v-if="analysis.blockers?.length">
              <div class="ai-col-hdr blocker"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>Active Blockers</div>
              <ul class="ai-list"><li v-for="(b,i) in analysis.blockers" :key="i" class="ai-item blocker">{{ b }}</li></ul>
            </div>
            <div class="ai-col" v-if="analysis.recommendations?.length">
              <div class="ai-col-hdr recommendation"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>Recommendations</div>
              <ul class="ai-list"><li v-for="(r,i) in analysis.recommendations" :key="i" class="ai-item recommendation">{{ r }}</li></ul>
            </div>
            <div class="ai-col" v-if="analysis.priorityActions?.length">
              <div class="ai-col-hdr action"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>Priority Actions</div>
              <ul class="ai-list"><li v-for="(a,i) in analysis.priorityActions" :key="i" class="ai-item action">{{ a }}</li></ul>
            </div>
            <div class="ai-col" v-if="analysis.nextSprintSuggestions?.length">
              <div class="ai-col-hdr next"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>Next Sprint Ideas</div>
              <ul class="ai-list"><li v-for="(s,i) in analysis.nextSprintSuggestions" :key="i" class="ai-item next">{{ s }}</li></ul>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 11 — Sprint Statistics Summary        -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header"><h2 class="section-title">Sprint Statistics Summary</h2></div>
        <div class="card">
          <div class="stats-summary-grid">
            <div v-for="s in sprintStats" :key="s.label" class="ss-item">
              <span class="ss-lbl">{{ s.label }}</span>
              <span class="ss-val" :class="s.color">{{ s.value }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 12 — Quick Actions                    -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="quick-actions-bar">
          <span class="qa-bar-label">Quick Actions</span>
          <div class="qa-btns">
            <button class="qa-btn primary" @click="openJiraBoard"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>Open Jira Board</button>
            <button class="qa-btn" @click="openSprintReportModal"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Sprint Report</button>
            <button class="qa-btn" @click="downloadPDF"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Download PDF</button>
            <button class="qa-btn" @click="exportExcel"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="2" width="4" height="20"/><rect x="6" y="10" width="4" height="12"/><rect x="2" y="16" width="4" height="6"/></svg>Export Excel</button>
            <button class="qa-btn" @click="openEmailModal"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>Email Report</button>
            <button class="qa-btn" @click="shareReport"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>Share Report</button>
            <button class="qa-btn" @click="fetchData" :disabled="pending"><svg :class="{ spinning: pending }" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>Refresh</button>
          </div>
        </div>
      </section>

      <!-- Toast Notification -->
      <Transition name="toast-slide">
        <div v-if="toast.show" class="sh-toast" :class="toast.type">
          <div class="toast-icon">
            <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="toast.type === 'info'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <span>{{ toast.message }}</span>
        </div>
      </Transition>

      <!-- Email Modal -->
      <Transition name="modal-fade">
        <div v-if="showEmailModal" class="sh-modal-backdrop" @click.self="showEmailModal = false">
          <div class="sh-modal-card">
            <div class="sh-modal-header">
              <h3 class="sh-modal-title">Email Executive Sprint Report</h3>
              <button class="sh-close-btn" @click="showEmailModal = false">✕</button>
            </div>
            <div class="sh-modal-body">
              <div class="sh-form-group">
                <label>Recipient Email</label>
                <input type="email" v-model="emailForm.to" placeholder="executive@company.com" class="sh-form-input" />
              </div>
              <div class="sh-form-group">
                <label>Subject</label>
                <input type="text" v-model="emailForm.subject" class="sh-form-input" />
              </div>
              <div class="sh-form-group">
                <label>Executive Notes / Commentary</label>
                <textarea v-model="emailForm.notes" rows="3" placeholder="Add custom notes for leadership..." class="sh-form-input"></textarea>
              </div>
              <div class="sh-email-preview">
                <span class="ep-lbl">Report Highlights Included:</span>
                <span class="ep-tag">• Health Score: <strong>{{ kpis.healthScore || 0 }}%</strong></span>
                <span class="ep-tag">• Completion Rate: <strong>{{ kpis.completionPct || 0 }}%</strong></span>
                <span class="ep-tag">• Velocity: <strong>{{ kpis.velocity || 0 }} pts</strong></span>
              </div>
            </div>
            <div class="sh-modal-footer">
              <button class="sh-btn-cancel" @click="showEmailModal = false">Cancel</button>
              <button class="sh-btn-send" @click="sendEmailReport" :disabled="sendingEmail">
                <svg v-if="sendingEmail" class="spinning" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
                {{ sendingEmail ? 'Sending...' : 'Send Email' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Sprint Report Preview Modal -->
      <Transition name="modal-fade">
        <div v-if="showReportModal" class="sh-modal-backdrop" @click.self="showReportModal = false">
          <div class="sh-modal-card report-modal">
            <div class="sh-modal-header">
              <div>
                <h3 class="sh-modal-title">Executive Sprint Health Summary</h3>
                <p class="sh-modal-sub">{{ selectedProject }} — {{ sprint.name || 'Active Sprint' }}</p>
              </div>
              <button class="sh-close-btn" @click="showReportModal = false">✕</button>
            </div>
            <div class="sh-modal-body">
              <div class="rep-hero-strip">
                <div class="rep-stat"><span class="rl">Sprint Health</span><span class="rv emerald">{{ kpis.healthScore || 0 }}%</span></div>
                <div class="rep-stat"><span class="rl">Completion Rate</span><span class="rv blue">{{ kpis.completionPct || 0 }}%</span></div>
                <div class="rep-stat"><span class="rl">Story Points</span><span class="rv">{{ kpis.storyPointsCompleted || 0 }} / {{ kpis.storyPointsTotal || 0 }}</span></div>
                <div class="rep-stat"><span class="rl">Velocity</span><span class="rv purple">{{ kpis.velocity || 0 }} pts</span></div>
                <div class="rep-stat"><span class="rl">Risk Status</span><span class="rv" :class="overallRisk.toLowerCase()">{{ overallRisk }} Risk</span></div>
              </div>

              <div class="rep-section" v-if="analysis.executiveSummary">
                <h4>Executive Summary</h4>
                <p>{{ analysis.executiveSummary }}</p>
              </div>

              <div class="rep-grid-2">
                <div class="rep-box" v-if="analysis.keyAchievements?.length">
                  <h4 class="achieve">Key Achievements</h4>
                  <ul><li v-for="(a,i) in analysis.keyAchievements" :key="i">{{ a }}</li></ul>
                </div>
                <div class="rep-box" v-if="analysis.recommendations?.length">
                  <h4 class="recom">AI Recommendations</h4>
                  <ul><li v-for="(r,i) in analysis.recommendations" :key="i">{{ r }}</li></ul>
                </div>
              </div>
            </div>
            <div class="sh-modal-footer">
              <button class="sh-btn-cancel" @click="showReportModal = false">Close</button>
              <button class="sh-btn-send" @click="downloadPDF">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </Transition>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CustomSelect from '~/components/CustomSelect.vue';
import CircularHealthRing from '~/components/CircularHealthRing.vue';
import SegmentedProgressBar from '~/components/SegmentedProgressBar.vue';
import SparklineChart from '~/components/SparklineChart.vue';

useHead({ title: 'Sprint Health Analytics | Sprintlytics' });

const route = useRoute();
const router = useRouter();

const openMemberProfile = (member) => {
  if (!member) return;
  const proj = selectedProject.value;
  const targetId = member.id || (proj ? `${proj}__${member.email || member.name}` : member.email || member.name);
  router.push(`/team/member/${encodeURIComponent(targetId)}`);
};
const selectedProject = ref('');
const selectedPeriod = ref('daily');
const pending = ref(false);
const apiData = ref(null);
const companyList = ref([]);

const projectOptions = computed(() => {
  const opts = [{ label: 'Select a Project…', value: '' }];
  companyList.value.forEach(c => opts.push({ label: c, value: c }));
  return opts;
});

const fetchCompanies = async () => {
  try {
    const res = await $fetch('/api/projects/companies');
    if (res?.success && Array.isArray(res.companies)) companyList.value = res.companies;
  } catch (e) { console.error('fetchCompanies error:', e); }
};

const fetchData = async () => {
  if (!selectedProject.value) return;
  pending.value = true;
  try {
    const res = await $fetch(`/api/sprint/health?company=${encodeURIComponent(selectedProject.value)}&period=${selectedPeriod.value}`);
    if (res?.success) apiData.value = res;
  } catch (e) { console.error('fetchData error:', e); }
  finally { pending.value = false; }
};

const setPeriod = (p) => { selectedPeriod.value = p; fetchData(); };

onMounted(async () => {
  await fetchCompanies();
  if (route.query.company) {
    selectedProject.value = route.query.company;
    await fetchData();
  }
});

// ── Data Accessors ──
const currentData = computed(() => apiData.value?.data || null);
const kpis = computed(() => currentData.value?.kpis || {});
const sprint = computed(() => currentData.value?.sprint || {});
const statusColumns = computed(() => currentData.value?.statusColumns || []);
const team = computed(() => currentData.value?.team || []);
const prioritySprint = computed(() => currentData.value?.prioritySprint || []);
const priorityAll = computed(() => currentData.value?.priorityAll || []);
const analysis = computed(() => currentData.value?.analysis || {});
const trend = computed(() => apiData.value?.trend || null);
const history = computed(() => apiData.value?.history || []);

// ── Sprint Timeline ──
const MS_PER_DAY = 86400000;
const sprintDaysTotal = computed(() => {
  if (!sprint.value.startDate || !sprint.value.endDate) return 14;
  return Math.max(1, Math.ceil((new Date(sprint.value.endDate) - new Date(sprint.value.startDate)) / MS_PER_DAY));
});
const sprintDaysPassed = computed(() => {
  if (!sprint.value.startDate) return 0;
  return Math.min(sprintDaysTotal.value, Math.max(0, Math.ceil((Date.now() - new Date(sprint.value.startDate)) / MS_PER_DAY)));
});
const sprintDaysRemaining = computed(() => Math.max(0, sprintDaysTotal.value - sprintDaysPassed.value));
const sprintTimelinePct = computed(() => Math.min(100, Math.round((sprintDaysPassed.value / sprintDaysTotal.value) * 100)));

// ── Health Labels ──
const healthLabel = computed(() => {
  const s = kpis.value.healthScore || 0;
  return kpis.value.healthLabel || (s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Warning' : 'Critical');
});
const healthClass = computed(() => {
  const s = kpis.value.healthScore || 0;
  return s >= 80 ? 'health-excellent' : s >= 60 ? 'health-good' : s >= 40 ? 'health-warning' : 'health-critical';
});

// ── Story Points ──
const spCompletedPct = computed(() => {
  const total = kpis.value.storyPointsTotal || 1;
  return Math.round(((kpis.value.storyPointsCompleted || 0) / total) * 100);
});

// ── Issue % ──
const totalIss = computed(() => kpis.value.totalIssues || 1);
const inProgressPct = computed(() => Math.round(((kpis.value.inProgress || 0) / totalIss.value) * 100));
const todoPct = computed(() => Math.round(((kpis.value.todo || 0) / totalIss.value) * 100));
const blockedPct = computed(() => Math.round(((kpis.value.blocked || 0) / totalIss.value) * 100));
const overduePct = computed(() => Math.round(((kpis.value.overdue || 0) / totalIss.value) * 100));
const highPriorityPct = computed(() => Math.round(((kpis.value.highPriority || 0) / totalIss.value) * 100));

// ── Workflow ──
const workflowTotal = computed(() => statusColumns.value.reduce((s, c) => s + (c.count || 0), 0) || 1);
const workflowPct = (count) => Math.round((count / workflowTotal.value) * 100);

// ── Team ──
const activeTeam = computed(() => team.value.filter(m => !m.isUnassigned).slice(0, 8));
const teamStats = computed(() => ({
  total: team.value.filter(m => !m.isUnassigned).length,
  balanced: team.value.filter(m => m.status === 'Balanced').length,
  overloaded: team.value.filter(m => m.status === 'Overloaded').length,
  underutilized: team.value.filter(m => m.status === 'Underutilized').length,
  unassigned: team.value.filter(m => m.isUnassigned).length,
}));

const AVATAR_COLORS = ['#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#A855F7','#14B8A6'];
const memberColor = (name) => AVATAR_COLORS[Math.abs((name || '').charCodeAt(0) - 65) % AVATAR_COLORS.length];
const memberInitials = (name) => (name || '?').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const getMemberStatusClass = (status) => {
  if (!status) return 'status-balanced';
  const s = status.toLowerCase();
  if (s.includes('overload')) return 'status-overloaded';
  if (s.includes('underutil')) return 'status-underutilized';
  if (s.includes('risk')) return 'status-atrisk';
  if (s.includes('unassign')) return 'status-unassigned';
  return 'status-balanced';
};

// ── Priority ──
const activePriorities = computed(() => {
  const src = prioritySprint.value.length ? prioritySprint.value : priorityAll.value;
  return src.filter(p => p.total > 0).sort((a, b) => (a.rank || 6) - (b.rank || 6));
});
const getPriorityVariant = (p) => {
  const l = (p || '').toLowerCase();
  if (l === 'highest' || l === 'high') return 'red';
  if (l === 'medium') return 'orange';
  return 'emerald';
};

// ── Quality Metrics ──
const qualityMetrics = computed(() => {
  const k = kpis.value;
  const total = k.totalIssues || 1;
  const bPct = Math.round(((k.blocked || 0) / total) * 100);
  const oPct = Math.round(((k.overdue || 0) / total) * 100);
  const bugDensity = +((k.bugCount || 0) / total * 10).toFixed(1);
  const stability = Math.max(0, 100 - bPct - oPct);
  const confidence = Math.round(((k.healthScore || 0) + (k.completionPct || 0)) / 2);
  const resHrs = k.avgResolutionHours || 0;
  return [
    { name: 'Bug Count', value: k.bugCount || 0, pct: Math.min(100,(k.bugCount||0)*5), color:'orange', status:(k.bugCount||0)===0?'good':(k.bugCount||0)<5?'warn':'bad', statusLabel:(k.bugCount||0)===0?'Clean':(k.bugCount||0)<5?'Moderate':'High Debt', icon:'<path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/><path d="M9 7.5A3 3 0 0 1 15 7.5V13a3 3 0 0 1-6 0V7.5z"/><path d="M6 11H3"/><path d="M21 11h-3"/>' },
    { name: 'Bug Density', value: bugDensity, pct: Math.min(100, bugDensity * 10), color:'orange', status:bugDensity<1?'good':bugDensity<3?'warn':'bad', statusLabel:bugDensity<1?'Low':bugDensity<3?'Medium':'High', icon:'<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/>' },
    { name: 'Blocked %', value: bPct + '%', pct: bPct, color:'red', status:bPct===0?'good':bPct<10?'warn':'bad', statusLabel:bPct===0?'None':bPct<10?'Low':'Critical', icon:'<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>' },
    { name: 'Overdue %', value: oPct + '%', pct: oPct, color:'red', status:oPct===0?'good':oPct<10?'warn':'bad', statusLabel:oPct===0?'None':oPct<10?'Low':'Critical', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' },
    { name: 'Resolution Time', value: resHrs + 'h', pct: Math.min(100,(resHrs/48)*100), color:resHrs<=24?'emerald':'amber', status:resHrs<=24?'good':'warn', statusLabel:resHrs<=24?'On SLA':'Above SLA', icon:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>' },
    { name: 'Completion Quality', value: (k.healthScore||0)+'%', pct:k.healthScore||0, color:(k.healthScore||0)>=80?'emerald':(k.healthScore||0)>=60?'blue':'amber', status:(k.healthScore||0)>=80?'good':(k.healthScore||0)>=60?'warn':'bad', statusLabel:(k.healthScore||0)>=80?'Excellent':(k.healthScore||0)>=60?'Good':'Needs Work', icon:'<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
    { name: 'Sprint Stability', value: stability + '%', pct: stability, color:stability>=80?'emerald':stability>=60?'blue':'red', status:stability>=80?'good':stability>=60?'warn':'bad', statusLabel:stability>=80?'Stable':stability>=60?'Moderate':'Unstable', icon:'<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>' },
    { name: 'Delivery Confidence', value: confidence + '%', pct: confidence, color:confidence>=75?'emerald':confidence>=50?'blue':'red', status:confidence>=75?'good':confidence>=50?'warn':'bad', statusLabel:confidence>=75?'High':confidence>=50?'Medium':'Low', icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>' },
  ];
});

// ── Risk ──
const overallRisk = computed(() => {
  const b = kpis.value.blocked || 0, o = kpis.value.overdue || 0, h = kpis.value.healthScore || 0;
  if (b > 5 || o > 10 || h < 40) return 'Critical';
  if (b > 2 || o > 5 || h < 60) return 'High';
  if (b > 0 || o > 0 || h < 80) return 'Medium';
  return 'Low';
});
const riskLevel = (val, hi, crit) => val >= crit ? 'Critical' : val >= hi ? 'High' : val > 0 ? 'Medium' : 'Low';
const riskCards = computed(() => {
  const k = kpis.value;
  return [
    { name:'Overall Sprint Risk', value:overallRisk.value, level:overallRisk.value, desc:'Combined assessment based on health, blockers & overdue issues', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' },
    { name:'Blocked Issues', value:k.blocked||0, level:riskLevel(k.blocked||0,2,5), desc:'Issues currently blocked, preventing sprint progress', icon:'<circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>' },
    { name:'High Priority Issues', value:k.highPriority||0, level:riskLevel(k.highPriority||0,5,10), desc:'Open high/highest priority items needing immediate action', icon:'<path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>' },
    { name:'Overdue Issues', value:k.overdue||0, level:riskLevel(k.overdue||0,3,8), desc:'Issues past their due date without completion', icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>' },
    { name:'Dependency Risk', value:(k.blocked||0)>0?'Present':'None', level:(k.blocked||0)>0?'High':'Low', desc:'Issues blocked by cross-team or external dependencies', icon:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>' },
    { name:'Scope Change Risk', value:(k.backlogTotal||0)>10?'Elevated':'Stable', level:(k.backlogTotal||0)>10?'Medium':'Low', desc:'Risk of unplanned scope addition affecting sprint delivery', icon:'<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>' },
  ];
});

// ── Sprint Stats Summary ──
const sprintStats = computed(() => {
  const k = kpis.value;
  return [
    { label:'Total Issues', value:k.totalIssues||0, color:'' },
    { label:'Completed Issues', value:k.done||0, color:'text-success' },
    { label:'Remaining Issues', value:(k.totalIssues||0)-(k.done||0), color:'' },
    { label:'SP Planned', value:k.storyPointsTotal||0, color:'' },
    { label:'SP Completed', value:k.storyPointsCompleted||0, color:'text-success' },
    { label:'SP Remaining', value:k.storyPointsRemaining||0, color:'text-warning' },
    { label:'Avg Resolution', value:(k.avgResolutionHours||0)+'h', color:'' },
    { label:'Completion Rate', value:(k.completionPct||0)+'%', color:'text-success' },
    { label:'Velocity', value:(k.velocity||0)+' pts', color:'' },
    { label:'Bug Count', value:k.bugCount||0, color:(k.bugCount||0)>0?'text-warning':'' },
    { label:'High Priority', value:k.highPriority||0, color:(k.highPriority||0)>5?'text-danger':'' },
    { label:'Overdue Issues', value:k.overdue||0, color:(k.overdue||0)>0?'text-danger':'text-success' },
    { label:'Blocked Issues', value:k.blocked||0, color:(k.blocked||0)>0?'text-danger':'text-success' },
    { label:'Sprint Health', value:(k.healthScore||0)+'%', color:(k.healthScore||0)>=80?'text-success':'text-warning' },
    { label:'Unassigned', value:k.unassignedSprint||0, color:'' },
  ];
});

// ── Chart Computations ──
const historyPoints = computed(() =>
  [...history.value].reverse().slice(-8).map(r => ({
    label: formatDateShort(r.generatedAt),
    completion: r.kpis?.completionPct || 0,
    velocity: r.kpis?.velocity || 0,
    health: r.kpis?.healthScore || 0,
  }))
);

const CH = 150, CP = 10, CW = 400;
const toChartPts = (values) => {
  if (!values.length) return { line:'', area:'', dots:[] };
  const max = Math.max(...values, 1);
  const step = values.length > 1 ? (CW - CP*2) / (values.length - 1) : CW / 2;
  const dots = values.map((v, i) => ({ x: CP + i*step, y: CH - CP - (Math.min(v,100)/100)*(CH-CP*2) }));
  const line = dots.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${CP},${CH} ${line} ${CP+(values.length-1)*step},${CH}`;
  return { line, area, dots };
};

const completionChart = computed(() => toChartPts(historyPoints.value.map(p => p.completion)));
const healthChart = computed(() => toChartPts(historyPoints.value.map(p => p.health)));
const completionLinePoints = computed(() => completionChart.value.line);
const completionAreaPoints = computed(() => completionChart.value.area);
const completionDots = computed(() => completionChart.value.dots);
const healthLinePoints = computed(() => healthChart.value.line);
const healthAreaPoints = computed(() => healthChart.value.area);
const healthDots = computed(() => healthChart.value.dots);
const maxVel = computed(() => Math.max(...historyPoints.value.map(p => p.velocity), 1));
const velBarHeight = (v) => Math.max(4, Math.round((v / maxVel.value) * 100));

// Burndown
const burndownActual = computed(() => {
  const total = kpis.value.storyPointsTotal || 1;
  const done = kpis.value.storyPointsCompleted || 0;
  const pct = sprintTimelinePct.value / 100;
  const midX = 10 + pct * 380;
  const midY = 15 + ((total - done) / total) * 128;
  return `10,15 ${midX.toFixed(0)},${midY.toFixed(0)}`;
});
const burndownForecast = computed(() => {
  const total = kpis.value.storyPointsTotal || 1;
  const done = kpis.value.storyPointsCompleted || 0;
  const remaining = total - done;
  const pct = sprintTimelinePct.value / 100;
  const midX = 10 + pct * 380;
  const midY = 15 + (remaining / total) * 128;
  const endY = remaining > 0 ? Math.min(143, midY + 30) : 143;
  return `${midX.toFixed(0)},${midY.toFixed(0)} 390,${endY}`;
});

// ── Helpers ──
const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';
const formatDateShort = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

// ── Toast Notification System ──
const toast = ref({ show: false, message: '', type: 'success' });
let toastTimer = null;
const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
};

// ── Action 1: Open Jira Board ──
const openJiraBoard = () => {
  const comp = selectedProject.value || 'PROJECT';
  const url = sprint.value?.jiraUrl || `https://jira.atlassian.com/projects/${encodeURIComponent(comp)}`;
  showToast(`Opening Jira Board for ${comp}...`, 'info');
  window.open(url, '_blank');
};

// ── Action 2: Sprint Report Modal ──
const showReportModal = ref(false);
const openSprintReportModal = () => {
  if (!selectedProject.value) {
    showToast('Please select a project first', 'warn');
    return;
  }
  showReportModal.value = true;
};

// ── Action 3: Download PDF ──
const downloadPDF = () => {
  showToast('Opening browser print to save PDF...', 'info');
  setTimeout(() => {
    window.print();
  }, 300);
};

// ── Action 4: Export Excel / CSV ──
const exportExcel = () => {
  if (!currentData.value) {
    showToast('No sprint data to export', 'warn');
    return;
  }
  const k = kpis.value;
  const s = sprint.value;
  const rows = [
    ['Sprintlytics Executive Sprint Health Report'],
    ['Project Name', selectedProject.value],
    ['Sprint Name', s.name || 'N/A'],
    ['Period Snapshot', selectedPeriod.value],
    ['Generated Date', formatDate(currentData.value.generatedAt)],
    [''],
    ['KPI Name', 'Value', 'Details'],
    ['Health Score', `${k.healthScore || 0}%`, k.healthLabel || 'N/A'],
    ['Completion Rate', `${k.completionPct || 0}%`, `${k.done || 0} of ${k.totalIssues || 0} tasks`],
    ['Story Points Completed', k.storyPointsCompleted || 0, `Total Planned: ${k.storyPointsTotal || 0}`],
    ['Story Points Remaining', k.storyPointsRemaining || 0, 'pts'],
    ['Velocity', k.velocity || 0, 'pts'],
    ['Total Issues', k.totalIssues || 0, 'issues'],
    ['Done Issues', k.done || 0, 'issues'],
    ['In Progress Issues', k.inProgress || 0, 'issues'],
    ['Todo Issues', k.todo || 0, 'issues'],
    ['Blocked Issues', k.blocked || 0, 'issues'],
    ['Overdue Issues', k.overdue || 0, 'issues'],
    ['Open Bugs', k.bugCount || 0, 'defects'],
    ['High Priority Issues', k.highPriority || 0, 'issues'],
    ['Avg Resolution Hours', k.avgResolutionHours || 0, 'hours'],
    [''],
    ['Team Workload Snapshot'],
    ['Member Name', 'Status', 'Assigned', 'Done', 'SP Delivered', 'Utilization %'],
  ];

  team.value.forEach(m => {
    rows.push([m.name, m.status || 'Active', m.assigned || 0, m.completed || 0, m.storyPointsDelivered || 0, `${m.utilizationPct || 0}%`]);
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SprintHealth_${(selectedProject.value || 'Report').replace(/\s+/g, '_')}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast(`Exported Sprint Health report as CSV`, 'success');
};

// ── Action 5: Email Report ──
const showEmailModal = ref(false);
const sendingEmail = ref(false);
const emailForm = ref({ to: '', subject: '', notes: '' });

const openEmailModal = () => {
  if (!selectedProject.value) {
    showToast('Please select a project first', 'warn');
    return;
  }
  emailForm.value.subject = `Executive Sprint Health Summary — ${selectedProject.value}`;
  emailForm.value.to = 'executive@company.com';
  emailForm.value.notes = '';
  showEmailModal.value = true;
};

const sendEmailReport = async () => {
  if (!emailForm.value.to) {
    showToast('Please enter recipient email', 'warn');
    return;
  }
  sendingEmail.value = true;
  try {
    const res = await $fetch('/api/sprint/email', {
      method: 'POST',
      body: {
        to: emailForm.value.to,
        subject: emailForm.value.subject,
        notes: emailForm.value.notes,
        companyName: selectedProject.value,
        period: selectedPeriod.value,
        healthScore: kpis.value.healthScore || 0,
        completionPct: kpis.value.completionPct || 0,
      }
    });
    if (res?.success) {
      showToast(res.message || 'Report email sent successfully!', 'success');
      showEmailModal.value = false;
    } else {
      showToast(res?.error || 'Failed to send email report', 'warn');
    }
  } catch (e) {
    console.error('Email report error:', e);
    showToast('Error sending email report', 'warn');
  } finally {
    sendingEmail.value = false;
  }
};

// ── Action 6: Share Report ──
const shareReport = () => {
  const shareUrl = `${window.location.origin}/sprint/health?company=${encodeURIComponent(selectedProject.value)}&period=${selectedPeriod.value}`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareUrl).then(() => {
      showToast('Sprint Health link copied to clipboard!', 'success');
    }).catch(() => {
      showToast(`Share Link: ${shareUrl}`, 'info');
    });
  } else {
    showToast(`Share Link: ${shareUrl}`, 'info');
  }
};
</script>

<style scoped>
/* ── Page Container ── */
.sprint-health-page {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-family: 'Open Sans', sans-serif;
}

/* ── Topbar ── */
.sh-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
}
.page-main-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.15rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}
.page-main-subtitle { font-size: 0.9rem; color: #6B7280; margin: 0.25rem 0 0; }
.topbar-right { display: flex; align-items: center; gap: 0.85rem; }
.period-pills { display: flex; background: #F3F4F6; padding: 3px; border-radius: 10px; }
.pill-btn { border: none; background: transparent; padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.8rem; font-weight: 600; color: #4B5563; cursor: pointer; transition: all 0.2s ease; font-family: 'Open Sans', sans-serif; }
.pill-btn.active { background: #fff; color: #059669; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.icon-btn { background: #fff; border: 1px solid #E5E7EB; border-radius: 10px; padding: 0.5rem; cursor: pointer; color: #4B5563; display: flex; align-items: center; justify-content: center; }
.icon-btn:hover { background: #F9FAFB; color: #059669; }
.gen-date-badge { display: flex; align-items: center; gap: 0.35rem; font-size: 0.78rem; font-weight: 500; color: #6B7280; background: #F9FAFB; border: 1px solid #E5E7EB; padding: 0.4rem 0.75rem; border-radius: 9999px; }
.action-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.45rem 0.85rem; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; font-size: 0.8rem; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.2s; font-family: 'Open Sans', sans-serif; }
.action-btn:hover { background: #F9FAFB; border-color: #D1D5DB; }
.action-btn.jira-btn { background: #0052CC; border-color: #0052CC; color: #fff; }
.action-btn.jira-btn:hover { background: #0047B3; }

/* ── Loading / Empty ── */
.simple-loading-spinner { display: flex; justify-content: center; align-items: center; padding: 4rem 0; }
.spinner { width: 36px; height: 36px; border: 3px solid #E5E7EB; border-top-color: #059669; border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.spinning { animation: spin 1s linear infinite; }

.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 5rem 2rem; text-align: center; gap: 1rem; }
.empty-icon { width: 80px; height: 80px; background: #F3F4F6; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
.empty-state h2 { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #111827; margin: 0; }
.empty-state p { color: #6B7280; margin: 0; }
.btn-primary-link { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1.25rem; background: #059669; color: #fff; border-radius: 10px; font-weight: 600; font-size: 0.85rem; text-decoration: none; }

/* ── Sections ── */
.section-container { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; }
.section-title { font-family: 'Playfair Display', serif; font-size: 1.35rem; font-weight: 700; color: #111827; margin: 0; }
.section-subtitle { font-size: 0.82rem; color: #6B7280; margin: 0.2rem 0 0; }
.section-count-badge { font-size: 0.75rem; font-weight: 600; color: #6B7280; background: #F3F4F6; border: 1px solid #E5E7EB; padding: 0.2rem 0.6rem; border-radius: 9999px; }

/* ── Cards ── */
.card { background: #fff; border: none !important; outline: none !important; border-radius: 16px; padding: 1.5rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0; }
.card-tag { font-size: 0.7rem; font-weight: 600; color: #6B7280; background: #F3F4F6; padding: 0.2rem 0.5rem; border-radius: 6px; }
.pb-3 { padding-bottom: 0.75rem; }
.mb-3 { margin-bottom: 0.75rem; border-bottom: 1px solid #F3F4F6; }
.card-body {}

/* ── HERO ── */
.hero-card {
  background: #fff;
  border: none !important;
  outline: none !important;
  border-radius: 20px;
  padding: 2rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2.5rem;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}
.hero-ring-col { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
.hero-ring-wrap { position: relative; }
.hero-health-label {
  font-size: 0.82rem; font-weight: 700; padding: 0.3rem 0.9rem;
  border-radius: 9999px; text-align: center;
}
.hero-health-label.health-excellent { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.hero-health-label.health-good { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
.hero-health-label.health-warning { background: #FFF7ED; color: #D97706; border: 1px solid #FDE68A; }
.hero-health-label.health-critical { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

.hero-center-col { display: flex; flex-direction: column; gap: 1.25rem; }
.hero-sprint-header {}
.hero-sprint-name-row { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
.hero-sprint-name { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: #111827; margin: 0; }
.sprint-state-pill { font-size: 0.72rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em; }
.sprint-state-pill.active { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.sprint-state-pill.closed { background: #F3F4F6; color: #6B7280; border: 1px solid #D1D5DB; }
.sprint-state-pill.future { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
.hero-sprint-goal { font-size: 0.85rem; color: #6B7280; margin: 0; display: flex; align-items: flex-start; gap: 0.4rem; }

.hero-dates-row { display: flex; align-items: center; gap: 1.5rem; }
.hero-date-item { display: flex; flex-direction: column; }
.hd-label { font-size: 0.7rem; font-weight: 600; color: #9CA3AF; }
.hd-val { font-size: 0.9rem; font-weight: 700; color: #111827; }
.days-remaining.critical { color: #DC2626; }
.days-remaining.warn { color: #D97706; }
.days-remaining.safe { color: #059669; }
.hero-date-sep { width: 1px; height: 30px; background: #E5E7EB; }

.hero-timeline {}
.htl-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
.htl-label { font-size: 0.78rem; font-weight: 600; color: #374151; }
.htl-pct { font-size: 0.75rem; color: #6B7280; }
.htl-track { height: 10px; background: #F3F4F6; border-radius: 999px; overflow: hidden; position: relative; }
.htl-fill { height: 100%; background: linear-gradient(90deg,#2563EB,#6366F1); border-radius: 999px; position: relative; transition: width 0.5s ease; }
.htl-pulse { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; background: #6366F1; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.25); animation: pulse 1.8s infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow: 0 0 0 6px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
.htl-labels { display: flex; justify-content: space-between; margin-top: 0.35rem; font-size: 0.7rem; color: #9CA3AF; }

.hero-right-col { display: flex; flex-direction: column; gap: 1rem; min-width: 220px; }
.hero-stat-block {}
.hsb-label { font-size: 0.72rem; font-weight: 600; color: #9CA3AF; display: block; margin-bottom: 0.25rem; }
.hsb-val { font-size: 1.8rem; font-weight: 800; line-height: 1; display: block; }
.hsb-val small { font-size: 0.9rem; font-weight: 500; color: #9CA3AF; }
.hsb-track { height: 6px; background: #F3F4F6; border-radius: 999px; overflow: hidden; margin: 0.4rem 0; }
.hsb-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }
.hsb-fill.blue { background: #2563EB; }
.hsb-fill.emerald { background: #059669; }
.hsb-sub { font-size: 0.7rem; color: #9CA3AF; }

.hero-trend-pills { display: flex; flex-direction: column; gap: 0.4rem; }
.trend-pill-sm { display: inline-flex; align-items: center; gap: 0.3rem; font-size: 0.72rem; font-weight: 600; padding: 0.25rem 0.5rem; border-radius: 6px; width: fit-content; }
.trend-pill-sm.positive { background: rgba(5,150,105,0.1); color: #059669; }
.trend-pill-sm.negative { background: rgba(239,68,68,0.1); color: #DC2626; }

/* ── KPI Cards ── */
.kpi-cards-grid { display: grid; gap: 1rem; }
.kpi-5col { grid-template-columns: repeat(5, 1fr); }
.kpi-card-premium { background: #fff; border: none !important; outline: none !important; border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.75rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.kpi-card-premium:hover { transform: translateY(-2px); box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px 0px; }
.kpi-header-row { display: flex; justify-content: space-between; align-items: center; }
.kpi-title-with-icon { display: flex; align-items: center; gap: 0.55rem; }
.kpi-icon-badge { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-icon-badge.emerald { background: #D1FAE5; color: #059669; }
.kpi-icon-badge.blue { background: #DBEAFE; color: #2563EB; }
.kpi-icon-badge.purple { background: #EDE9FE; color: #7C3AED; }
.kpi-icon-badge.red { background: #FEE2E2; color: #DC2626; }
.kpi-icon-badge.orange { background: #FFEDD5; color: #EA580C; }
.kpi-icon-badge.amber { background: #FEF3C7; color: #D97706; }
.kpi-name { font-size: 0.78rem; font-weight: 600; color: #374151; }
.info-icon { font-size: 0.85rem; color: #D1D5DB; cursor: default; }
.kpi-value-row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.kpi-value { font-size: 1.75rem; font-weight: 800; color: #111827; line-height: 1; letter-spacing: -0.02em; }
.kpi-value .unit { font-size: 0.85rem; font-weight: 600; color: #9CA3AF; margin-left: 2px; }
.kpi-segmented-wrap {}
.kpi-footer-row { display: flex; justify-content: space-between; align-items: center; }
.kpi-footer-label { font-size: 0.72rem; color: #9CA3AF; font-weight: 500; }
.kpi-footer-val { font-size: 0.72rem; font-weight: 700; color: #374151; }
.trend-badge { display: inline-flex; align-items: center; gap: 0.25rem; font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
.trend-badge.positive { background: rgba(5,150,105,0.1); color: #059669; }
.trend-badge.negative { background: rgba(239,68,68,0.1); color: #DC2626; }
.text-success { color: #059669 !important; }
.text-warning { color: #D97706 !important; }
.text-danger { color: #DC2626 !important; }

/* ── Sprint Progress Overview ── */
.prog-overview-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.prog-card { }
.prog-body { display: flex; flex-direction: column; gap: 1rem; }
.prog-stat-trio { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; text-align: center; }
.prog-stat { display: flex; flex-direction: column; align-items: center; }
.ps-num { font-size: 1.75rem; font-weight: 800; color: #111827; line-height: 1; }
.ps-lbl { font-size: 0.72rem; font-weight: 500; color: #9CA3AF; margin-top: 0.2rem; }
.prog-bar-header { display: flex; justify-content: space-between; font-size: 0.7rem; color: #9CA3AF; }
.prog-bar-track { height: 12px; background: #F3F4F6; border-radius: 999px; overflow: hidden; position: relative; }
.prog-bar-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; position: relative; }
.prog-bar-glow { position: absolute; right: 0; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; background: #6366F1; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
.prog-bar-dates { display: flex; justify-content: space-between; font-size: 0.7rem; color: #9CA3AF; }
.sp-seg-wrap {}
.sp-pct-row { text-align: center; }
.sp-pct-text { font-size: 0.82rem; font-weight: 600; color: #059669; }
.issue-stacked-bar-wrap {}
.issue-stacked-bar { display: flex; height: 14px; border-radius: 999px; overflow: hidden; background: #F3F4F6; }
.isb-seg { height: 100%; min-width: 2px; transition: flex 0.4s ease; }
.isb-seg.done { background: #059669; }
.isb-seg.inprog { background: #2563EB; }
.isb-seg.todo { background: #9CA3AF; }
.isb-seg.blocked { background: #EF4444; }
.issue-legend-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; }
.ilg-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; }
.ilg-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.ilg-dot.done { background: #059669; }
.ilg-dot.inprog { background: #2563EB; }
.ilg-dot.todo { background: #9CA3AF; }
.ilg-dot.blocked { background: #EF4444; }
.ilg-lbl { color: #6B7280; flex: 1; }
.ilg-cnt { font-weight: 700; color: #111827; }
.capacity-rows { display: flex; flex-direction: column; gap: 0.7rem; }
.cap-row { display: grid; grid-template-columns: 80px 1fr 50px; align-items: center; gap: 0.75rem; }
.cap-lbl { font-size: 0.78rem; font-weight: 600; color: #374151; }
.cap-track { height: 8px; background: #F3F4F6; border-radius: 999px; overflow: hidden; }
.cap-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.cap-val { font-size: 0.75rem; font-weight: 700; color: #374151; text-align: right; }
.cap-efficiency-row { display: flex; justify-content: space-between; align-items: center; padding-top: 0.5rem; border-top: 1px solid #F3F4F6; }
.cap-eff-lbl { font-size: 0.78rem; color: #6B7280; font-weight: 500; }
.cap-eff-val { font-size: 1rem; font-weight: 800; }

/* ── Workflow Status ── */
.workflow-list { display: flex; flex-direction: column; gap: 0.85rem; }
.workflow-row { display: grid; grid-template-columns: 200px 1fr 100px; align-items: center; gap: 1rem; }
.workflow-left { display: flex; align-items: center; gap: 0.5rem; }
.workflow-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.workflow-name { font-size: 0.85rem; font-weight: 600; color: #111827; }
.workflow-cat-badge { font-size: 0.68rem; font-weight: 500; color: #9CA3AF; background: #F3F4F6; padding: 0.1rem 0.4rem; border-radius: 4px; }
.workflow-bar-wrap { }
.workflow-bar-track { height: 8px; background: #F3F4F6; border-radius: 999px; overflow: hidden; }
.workflow-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.workflow-right { display: flex; align-items: center; gap: 0.5rem; justify-content: flex-end; }
.workflow-count { font-size: 0.9rem; font-weight: 700; color: #111827; }
.workflow-pct-badge { font-size: 0.72rem; font-weight: 600; color: #6B7280; background: #F3F4F6; padding: 0.1rem 0.4rem; border-radius: 6px; }

/* ── Charts ── */
.charts-2x2-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.chart-card { }
.inline-chart { width: 100%; }
.chart-svg { width: 100%; height: auto; }
.chart-x-labels { display: flex; justify-content: space-between; margin-top: 0.4rem; }
.chart-x-labels span { font-size: 0.65rem; color: #9CA3AF; font-weight: 500; }
.chart-empty { padding: 3rem 0; text-align: center; font-size: 0.82rem; color: #9CA3AF; }
.vel-chart-area { display: flex; align-items: flex-end; gap: 6px; height: 160px; padding-bottom: 22px; }
.vel-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; cursor: pointer; }
.vel-bar { width: 100%; border-radius: 6px 6px 0 0; transition: height 0.4s ease, background 0.2s; min-height: 4px; }
.vel-x-lbl { position: absolute; bottom: 0; font-size: 0.65rem; color: #9CA3AF; font-weight: 500; }

/* ── Priority Distribution ── */
.priority-dist-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1rem; }
.priority-dist-card { background: #fff; border: none !important; outline: none !important; border-radius: 16px; padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; transition: transform 0.15s ease, box-shadow 0.15s ease; }
.priority-dist-card:hover { transform: translateY(-2px); box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px 0px; }
.pdc-top {}
.pdc-badge-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.pdc-priority-badge { font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px; }
.pdc-total { font-size: 0.8rem; color: #6B7280; font-weight: 500; }
.pdc-stat-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; text-align: center; }
.pdc-stat {}
.pdc-sn { display: block; font-size: 1.3rem; font-weight: 800; color: #111827; line-height: 1; }
.pdc-sl { display: block; font-size: 0.65rem; font-weight: 500; color: #9CA3AF; margin-top: 0.15rem; }
.emerald { color: #059669; }
.blue { color: #2563EB; }
.pdc-bottom {}
.pdc-pct-row { display: flex; justify-content: space-between; font-size: 0.72rem; margin-top: 0.4rem; color: #6B7280; }

/* ── Quality Metrics ── */
.quality-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.quality-card { background: #fff; border: none !important; outline: none !important; border-radius: 14px; padding: 1.1rem; display: flex; flex-direction: column; gap: 0.6rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; }
.qc-header { display: flex; align-items: center; gap: 0.5rem; }
.qc-icon { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.qc-icon.emerald { background: #D1FAE5; color: #059669; }
.qc-icon.blue { background: #DBEAFE; color: #2563EB; }
.qc-icon.orange { background: #FFEDD5; color: #EA580C; }
.qc-icon.red { background: #FEE2E2; color: #DC2626; }
.qc-icon.amber { background: #FEF3C7; color: #D97706; }
.qc-icon.purple { background: #EDE9FE; color: #7C3AED; }
.qc-name { font-size: 0.78rem; font-weight: 600; color: #374151; }
.qc-val-row { display: flex; align-items: center; justify-content: space-between; }
.qc-val { font-size: 1.5rem; font-weight: 800; color: #111827; line-height: 1; }
.qc-status-badge { font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
.qc-status-badge.good { background: #ECFDF5; color: #059669; }
.qc-status-badge.warn { background: #FFF7ED; color: #D97706; }
.qc-status-badge.bad { background: #FEF2F2; color: #DC2626; }
.qc-mini-bar-track { height: 5px; background: #F3F4F6; border-radius: 999px; overflow: hidden; }
.qc-mini-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.qc-mini-bar-fill.emerald { background: #059669; }
.qc-mini-bar-fill.blue { background: #2563EB; }
.qc-mini-bar-fill.orange { background: #F97316; }
.qc-mini-bar-fill.red { background: #EF4444; }
.qc-mini-bar-fill.amber { background: #F59E0B; }

/* ── Team ── */
.team-overview-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1rem; }
.team-stat-tile { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; padding: 1.1rem; display: flex; flex-direction: column; align-items: center; gap: 0.3rem; text-align: center; }
.tst-val { font-size: 2rem; font-weight: 800; color: #111827; line-height: 1; }
.tst-lbl { font-size: 0.75rem; color: #6B7280; font-weight: 500; }
.member-cards-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.member-card { background: #fff; border: 1px solid #E5E7EB; border-radius: 14px; padding: 1rem; display: flex; align-items: flex-start; gap: 0.75rem; }
.mc-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 800; color: #fff; flex-shrink: 0; }
.mc-body { flex: 1; display: flex; flex-direction: column; gap: 0.4rem; min-width: 0; }
.mc-name-row { display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; }
.mc-name { font-size: 0.85rem; font-weight: 700; color: #111827; truncate: ellipsis; white-space: nowrap; overflow: hidden; }
.mc-status { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 6px; flex-shrink: 0; }
.mc-status.status-balanced { background: #ECFDF5; color: #059669; }
.mc-status.status-overloaded { background: #FEF2F2; color: #DC2626; }
.mc-status.status-underutilized { background: #FFF7ED; color: #D97706; }
.mc-status.status-atrisk { background: #FFF7ED; color: #D97706; }
.mc-status.status-unassigned { background: #F3F4F6; color: #6B7280; }
.mc-stats-row { display: flex; gap: 0.6rem; font-size: 0.72rem; }
.mc-stat strong { color: #111827; font-weight: 700; }
.mc-stat span { color: #9CA3AF; }
.mc-prog-wrap { display: flex; align-items: center; gap: 0.4rem; }
.mc-prog-track { flex: 1; height: 6px; background: #F3F4F6; border-radius: 999px; overflow: hidden; }
.mc-prog-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.mc-prog-pct { font-size: 0.7rem; font-weight: 700; color: #374151; }
.mc-util { font-size: 0.68rem; color: #9CA3AF; }

/* ── Risk Center ── */
.risk-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
.risk-overall-badge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 700; padding: 0.35rem 0.85rem; border-radius: 9999px; }
.risk-overall-badge.low { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.risk-overall-badge.medium { background: #FFF7ED; color: #D97706; border: 1px solid #FDE68A; }
.risk-overall-badge.high { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }
.risk-overall-badge.critical { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }

.risk-card { background: #fff; border: none !important; outline: none !important; border-radius: 14px; padding: 1.25rem; display: flex; flex-direction: column; gap: 0.6rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; }
.risk-card.low { border-left: 4px solid #059669 !important; }
.risk-card.medium { border-left: 4px solid #F59E0B !important; }
.risk-card.high { border-left: 4px solid #EF4444 !important; }
.risk-card.critical { border-left: 4px solid #DC2626 !important; background: #FFFBFB; }
.rc-header { display: flex; align-items: center; justify-content: space-between; }
.rc-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.rc-icon.low { background: #ECFDF5; color: #059669; }
.rc-icon.medium { background: #FFF7ED; color: #D97706; }
.rc-icon.high { background: #FEF2F2; color: #DC2626; }
.rc-icon.critical { background: #FEF2F2; color: #DC2626; }
.rc-level-badge { font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 6px; }
.rc-level-badge.low { background: #ECFDF5; color: #059669; }
.rc-level-badge.medium { background: #FFF7ED; color: #D97706; }
.rc-level-badge.high { background: #FEF2F2; color: #BE123C; }
.rc-level-badge.critical { background: #FEF2F2; color: #DC2626; }
.rc-name { font-size: 0.88rem; font-weight: 700; color: #111827; }
.rc-value { font-size: 1.6rem; font-weight: 800; color: #111827; line-height: 1; }
.rc-desc { font-size: 0.75rem; color: #6B7280; line-height: 1.4; }

/* ── AI ── */
.ai-live-badge { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 600; color: #059669; background: #ECFDF5; border: 1px solid #A7F3D0; padding: 0.35rem 0.75rem; border-radius: 9999px; }
.dot.pulse { width: 6px; height: 6px; background: #10B981; border-radius: 50%; animation: pulse-dot 1.8s infinite; }
@keyframes pulse-dot { 0%,100% { opacity: 0.5; transform: scale(0.9); } 50% { opacity: 1; transform: scale(1.2); } }

.ai-intel-card {}
.ai-exec-summary { padding-bottom: 1.25rem; margin-bottom: 1.25rem; border-bottom: 1px solid #F3F4F6; }
.ai-section-header { display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; font-weight: 700; color: #374151; margin-bottom: 0.65rem; }
.ai-summary-p { font-size: 0.88rem; color: #4B5563; line-height: 1.65; margin: 0; }
.ai-insight-cols { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
.ai-col {}
.ai-col-hdr { display: flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 700; margin-bottom: 0.65rem; padding-bottom: 0.5rem; border-bottom: 2px solid; }
.ai-col-hdr.achievement { color: #059669; border-color: #A7F3D0; }
.ai-col-hdr.risk { color: #DC2626; border-color: #FECACA; }
.ai-col-hdr.blocker { color: #B91C1C; border-color: #FCA5A5; }
.ai-col-hdr.recommendation { color: #2563EB; border-color: #BFDBFE; }
.ai-col-hdr.action { color: #7C3AED; border-color: #DDD6FE; }
.ai-col-hdr.next { color: #D97706; border-color: #FDE68A; }
.ai-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; }
.ai-item { font-size: 0.8rem; line-height: 1.5; color: #4B5563; padding-left: 1rem; position: relative; }
.ai-item::before { content: '•'; position: absolute; left: 0; }
.ai-item.achievement::before { color: #059669; }
.ai-item.risk::before { color: #DC2626; }
.ai-item.blocker::before { color: #B91C1C; }
.ai-item.recommendation::before { color: #2563EB; }
.ai-item.action::before { color: #7C3AED; }
.ai-item.next::before { color: #D97706; }

/* ── Stats Summary ── */
.stats-summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 1px; background: #F3F4F6; border-radius: 12px; overflow: hidden; }
.ss-item { background: #fff; padding: 1rem; display: flex; flex-direction: column; gap: 0.25rem; }
.ss-lbl { font-size: 0.72rem; color: #9CA3AF; font-weight: 500; }
.ss-val { font-size: 1.15rem; font-weight: 800; color: #111827; }

/* ── Quick Actions ── */
.quick-actions-bar { background: #fff; border: none !important; outline: none !important; border-radius: 16px; padding: 1.25rem 1.5rem; display: flex; align-items: center; gap: 1.5rem; box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px; }
.qa-bar-label { font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 700; color: #111827; flex-shrink: 0; }
.qa-btns { display: flex; flex-wrap: wrap; gap: 0.65rem; }
.qa-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: 1px solid #E5E7EB; border-radius: 10px; background: #fff; font-size: 0.8rem; font-weight: 600; color: #374151; cursor: pointer; transition: all 0.15s; font-family: 'Open Sans', sans-serif; }
.qa-btn:hover { background: #F9FAFB; border-color: #D1D5DB; }
.qa-btn.primary { background: #059669; color: #fff; border-color: #059669; }
.qa-btn.primary:hover { background: #047857; }
.qa-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Sparklines & Smooth Bars in KPI Cards ── */
.kpi-sparkline-wrap { width: 100%; height: 32px; overflow: hidden; margin: 0.15rem 0; }
.progress-bar-track-sm { height: 6px; background: #F3F4F6; border-radius: 999px; overflow: hidden; margin: 0.4rem 0; }
.progress-bar-fill-sm { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.progress-bar-fill-sm.blue { background: #2563EB; }
.progress-bar-fill-sm.emerald { background: #059669; }
.progress-bar-fill-sm.orange { background: #F97316; }
.progress-bar-fill-sm.red { background: #EF4444; }
.progress-bar-fill-sm.purple { background: #7C3AED; }

/* ── Responsive ── */
@media (max-width: 1280px) {
  .kpi-5col { grid-template-columns: repeat(3, 1fr); }
  .member-cards-grid { grid-template-columns: repeat(2, 1fr); }
  .ai-insight-cols { grid-template-columns: repeat(2, 1fr); }
  .quality-grid { grid-template-columns: repeat(2, 1fr); }
  .team-overview-row { grid-template-columns: repeat(3, 1fr); }
  .risk-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .hero-card { grid-template-columns: 1fr; }
  .kpi-5col { grid-template-columns: repeat(2, 1fr); }
  .charts-2x2-grid { grid-template-columns: 1fr; }
  .prog-overview-grid { grid-template-columns: 1fr; }
  .stats-summary-grid { grid-template-columns: repeat(3, 1fr); }
}

/* ── Toast Notification ── */
.sh-toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  background: #111827;
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}
.sh-toast.success { background: #065F46; color: #ECFDF5; }
.sh-toast.info { background: #1E40AF; color: #EFF6FF; }
.sh-toast.warn { background: #92400E; color: #FFFBEB; }

.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.3s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateY(20px); opacity: 0; }

/* ── Modals ── */
.sh-modal-backdrop {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  z-index: 9990;
  background: rgba(17, 24, 39, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.sh-modal-card {
  background: #fff;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  padding: 1.75rem;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.sh-modal-card.report-modal {
  max-width: 780px;
}

.sh-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.sh-modal-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.sh-modal-sub {
  font-size: 0.82rem;
  color: #6B7280;
  margin: 0.2rem 0 0;
}

.sh-close-btn {
  background: #F3F4F6;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 0.85rem;
  color: #4B5563;
  cursor: pointer;
}

.sh-modal-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sh-form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.sh-form-group label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
}

.sh-form-input {
  width: 100%;
  padding: 0.6rem 0.85rem;
  border: 1px solid #D1D5DB;
  border-radius: 10px;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
}
.sh-form-input:focus { border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,0.15); }

.sh-email-preview {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.ep-lbl { font-size: 0.72rem; font-weight: 700; color: #6B7280; text-transform: uppercase; }
.ep-tag { font-size: 0.8rem; color: #374151; }

.sh-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #F3F4F6;
}

.sh-btn-cancel {
  padding: 0.5rem 1.25rem;
  background: #F3F4F6;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
}

.sh-btn-send {
  padding: 0.5rem 1.25rem;
  background: #059669;
  border: none;
  border-radius: 10px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}
.sh-btn-send:disabled { opacity: 0.6; cursor: not-allowed; }

/* Sprint Report Modal Body */
.rep-hero-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  background: #F9FAFB;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
}
.rep-stat { display: flex; flex-direction: column; gap: 0.2rem; }
.rl { font-size: 0.7rem; color: #6B7280; font-weight: 600; }
.rv { font-size: 1.25rem; font-weight: 800; color: #111827; }
.rep-section h4, .rep-box h4 { font-family: 'Playfair Display', serif; font-size: 1rem; margin: 0 0 0.4rem; color: #111827; }
.rep-section p { font-size: 0.85rem; color: #4B5563; line-height: 1.5; margin: 0; }
.rep-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
.rep-box { background: #F9FAFB; border-radius: 10px; padding: 1rem; }
.rep-box ul { margin: 0; padding-left: 1.2rem; font-size: 0.82rem; color: #374151; }
.rep-box li { margin-bottom: 0.3rem; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Print Media Styles ── */
@media print {
  .sh-topbar, .quick-actions-bar, .sh-modal-backdrop, .sh-toast, nav, header, sidebar {
    display: none !important;
  }
  body, .sprint-health-page {
    background: #fff !important;
    gap: 1.5rem !important;
    padding: 0 !important;
  }
  .card, .hero-card, .kpi-card-premium, .priority-dist-card, .quality-card, .team-stat-tile, .member-card, .risk-card {
    box-shadow: none !important;
    border: 1px solid #E5E7EB !important;
    page-break-inside: avoid;
  }
}
</style>
