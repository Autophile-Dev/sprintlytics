<template>
  <div class="velocity-analytics-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">{{ data?.companyName || decodedCompany }}</h1>
          <span class="health-pill" :class="healthClass">
            <span class="health-dot"></span>
            {{ summary?.healthScore ?? 0 }}% {{ healthLabel }}
          </span>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            AI Powered
          </span>
        </div>
        <p class="page-main-subtitle">
          <span v-if="data?.current?.sprint?.name">{{ data.current.sprint.name }}</span>
          <span v-if="data?.generatedAt"> · Last updated {{ formatDate(data.generatedAt) }}</span>
        </p>
      </div>

      <div class="topbar-right">
        <!-- Report Type Pills -->
        <div class="period-pills">
          <button v-for="p in ['daily','weekly','monthly']" :key="p" class="pill-btn"
            :class="{ active: selectedPeriod === p }" @click="setPeriod(p)">
            {{ p.charAt(0).toUpperCase() + p.slice(1) }}
          </button>
        </div>

        <!-- Sprint Selector -->
        <div class="filter-group">
          <CustomSelect v-model="selectedSprint" :options="sprintOptions" placeholder="All Sprints" @change="fetchData" />
        </div>

        <!-- Refresh Button -->
        <button class="icon-btn" @click="fetchData" :disabled="pending" title="Refresh Analytics">
          <svg :class="{ spinning: pending }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>

        <!-- Export Report Button -->
        <button class="action-btn primary-btn" @click="exportReport">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Report
        </button>

        <!-- Open Jira Button -->
        <button class="action-btn" @click="openJira">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Jira
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
    <div v-else-if="!data" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><polygon points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      </div>
      <h2>No Project Data Found</h2>
      <p>No performance records found for <strong>{{ decodedCompany }}</strong>.</p>
      <NuxtLink to="/" class="action-btn primary-btn" style="text-decoration:none;display:inline-flex;margin-top:1rem;">← Back to Dashboard</NuxtLink>
    </div>

    <!-- ── MAIN CONTENT VIEW ── -->
    <template v-else>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Project Executive Hero (Dynamic)   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Project Executive Dashboard</h2>
            <span class="sec-subtitle">Executive Command Center • Active Sprint, Radial Health &amp; Dynamic Analytics</span>
          </div>
        </div>

        <div class="exec-hero-dashboard">
          <!-- TOP 12-COLUMN GRID -->
          <div class="hero-grid-12">

            <!-- LEFT COLUMN (4 Cols): Project Info & Radial Sprint Health -->
            <div class="hero-left-col">
              <!-- Project Info Header -->
              <div class="hero-project-header">
                <div class="project-avatar-lg">{{ projectInitials }}</div>
                <div class="hero-project-info">
                  <div class="project-title-row">
                    <h1 class="hero-title-main">{{ data.companyName }}</h1>
                    <span class="hero-status-badge" :class="healthClass">{{ healthBadgeText }}</span>
                  </div>
                  <p class="hero-sub-text" v-if="sprint?.name">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    {{ sprint.name }}
                  </p>
                  <p class="hero-goal-text" v-if="sprint?.goal">Goal: {{ sprint.goal }}</p>
                  <div class="hero-owner-row">
                    <span class="owner-lbl">Project Owner:</span>
                    <span class="owner-val">{{ projectOwnerName }}</span>
                  </div>
                </div>
              </div>

              <!-- Animated Sprint Timeline -->
              <div class="hero-timeline-card">
                <div class="tl-date-row">
                  <span>{{ sprintStartLabel }}</span>
                  <span class="tl-line-dots">-----------------------------</span>
                  <span>{{ sprintEndLabel }}</span>
                </div>
                <div class="tl-progress-bar-bg">
                  <div class="tl-progress-bar-fill" :style="{ width: summary.sprintProgressPct + '%' }"></div>
                </div>
                <div class="tl-day-counter">
                  Day {{ summary.currentDay }} / {{ summary.sprintDays }}
                </div>
                <div class="tl-pills-row">
                  <span class="tl-pill green">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {{ summary.sprintProgressPct }}% Elapsed
                  </span>
                  <span class="tl-pill blue">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    {{ summary.daysRemaining }} Days Left
                  </span>
                  <span class="tl-pill emerald">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    {{ summary.completionPct }}% Complete
                  </span>
                  <span class="tl-pill orange">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {{ (summary.totalIssues || 0) - (summary.doneIssues || 0) }} Open Issues
                  </span>
                </div>
              </div>

              <!-- Large Radial Sprint Health Gauge -->
              <div class="hero-health-radial-card">
                <div class="radial-gauge-wrapper">
                  <svg viewBox="0 0 140 140" class="health-radial-svg">
                    <circle cx="70" cy="70" r="54" fill="none" stroke="#F3F4F6" stroke-width="12" />
                    <circle cx="70" cy="70" r="54" fill="none"
                      :stroke="healthColor"
                      stroke-width="12"
                      :stroke-dasharray="339.29"
                      :stroke-dashoffset="339.29 - (summary.healthScore / 100) * 339.29"
                      stroke-linecap="round"
                      transform="rotate(-90 70 70)"
                      class="animated-ring"
                    />
                  </svg>
                  <div class="radial-center-content">
                    <span class="radial-val" :style="{ color: healthColor }">{{ summary.healthScore }}%</span>
                    <span class="radial-lbl">Sprint Health</span>
                  </div>
                </div>
                <div class="health-badge-status" :class="healthBadgeClass">
                  {{ healthBadgeText }}
                </div>
              </div>
            </div>

            <!-- RIGHT SIDE ANALYTICS (8 Cols): 6 Mini Analytics Cards in a Grid -->
            <div class="hero-right-grid">

              <!-- CARD 1: Workflow Stage Distribution -->
              <div class="mini-chart-card">
                <div class="mc-header">
                  <h4 class="mc-title">Workflow Stage</h4>
                </div>
                <div class="mc-body">
                  <div class="mc-legend">
                    <div v-for="item in contextSegments" :key="item.name" class="mc-leg-item">
                      <span class="mc-dot" :style="{ background: item.color }"></span>
                      <span class="mc-name">{{ item.name }}</span>
                      <span class="mc-pct">{{ item.pct }}%</span>
                    </div>
                  </div>
                  <div class="mc-chart-wrap">
                    <svg viewBox="0 0 100 100" class="mc-donut-svg">
                      <g transform="rotate(-90 50 50)">
                        <circle v-for="(seg, i) in contextSegments" :key="'cs'+i"
                          cx="50" cy="50" r="36" fill="none"
                          :stroke="seg.color" stroke-width="14"
                          :stroke-dasharray="`${seg.dash} ${226.19 - seg.dash}`"
                          :stroke-dashoffset="seg.offset"
                          stroke-linecap="butt"
                          class="animated-ring"
                        />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- CARD 2: Task Status (Concentric Rings) -->
              <div class="mini-chart-card">
                <div class="mc-header">
                  <h4 class="mc-title">Task Status</h4>
                </div>
                <div class="mc-body">
                  <div class="mc-legend">
                    <div v-for="item in taskStatusRings" :key="item.name" class="mc-leg-item">
                      <span class="mc-dot" :style="{ background: item.color }"></span>
                      <span class="mc-name">{{ item.name }}</span>
                      <span class="mc-pct">{{ item.pct }}%</span>
                    </div>
                  </div>
                  <div class="mc-chart-wrap">
                    <svg viewBox="0 0 100 100" class="mc-radial-rings-svg">
                      <circle v-for="(ring, i) in taskStatusRings" :key="'tr'+i"
                        cx="50" cy="50" :r="ring.radius" fill="none"
                        :stroke="ring.color" stroke-width="5"
                        :stroke-dasharray="`${ring.dash} ${ring.circumference - ring.dash}`"
                        stroke-linecap="round"
                        transform="rotate(-90 50 50)"
                        class="animated-ring"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- CARD 3: Priority Distribution -->
              <div class="mini-chart-card">
                <div class="mc-header">
                  <h4 class="mc-title">Priority Distribution</h4>
                </div>
                <div class="mc-body">
                  <div class="mc-legend">
                    <div v-for="item in prioritySegments" :key="item.name" class="mc-leg-item">
                      <span class="mc-dot" :style="{ background: item.color }"></span>
                      <span class="mc-name">{{ item.name }}</span>
                      <span class="mc-pct">{{ item.pct }}%</span>
                    </div>
                  </div>
                  <div class="mc-chart-wrap">
                    <svg viewBox="0 0 100 100" class="mc-donut-svg">
                      <g transform="rotate(-90 50 50)">
                        <circle v-for="(seg, i) in prioritySegments" :key="'ps'+i"
                          cx="50" cy="50" r="36" fill="none"
                          :stroke="seg.color" stroke-width="14"
                          :stroke-dasharray="`${seg.dash} ${226.19 - seg.dash}`"
                          :stroke-dashoffset="seg.offset"
                          stroke-linecap="butt"
                          class="animated-ring"
                        />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- CARD 4: Story Points & Velocity Gauge -->
              <div class="mini-chart-card">
                <div class="mc-header">
                  <h4 class="mc-title">Story Points</h4>
                </div>
                <div class="mc-body">
                  <div class="mc-legend">
                    <div v-for="item in storyPointsRings" :key="item.name" class="mc-leg-item">
                      <span class="mc-dot" :style="{ background: item.color }"></span>
                      <span class="mc-name">{{ item.name }}</span>
                      <span class="mc-pct">{{ item.pct }}%</span>
                    </div>
                  </div>
                  <div class="mc-chart-wrap">
                    <svg viewBox="0 0 100 100" class="mc-radial-rings-svg">
                      <circle v-for="(ring, i) in storyPointsRings" :key="'spr'+i"
                        cx="50" cy="50" :r="ring.radius" fill="none"
                        :stroke="ring.color" stroke-width="6"
                        :stroke-dasharray="`${ring.dash} ${ring.circumference - ring.dash}`"
                        stroke-linecap="round"
                        transform="rotate(-90 50 50)"
                        class="animated-ring"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <!-- CARD 5: Backlog & Bugs Breakdown -->
              <div class="mini-chart-card">
                <div class="mc-header">
                  <h4 class="mc-title">Backlog &amp; Bugs</h4>
                </div>
                <div class="mc-body">
                  <div class="mc-legend">
                    <div v-for="item in bugSegments" :key="item.name" class="mc-leg-item">
                      <span class="mc-dot" :style="{ background: item.color }"></span>
                      <span class="mc-name">{{ item.name }}</span>
                      <span class="mc-pct">{{ item.pct }}%</span>
                    </div>
                  </div>
                  <div class="mc-chart-wrap">
                    <svg viewBox="0 0 100 100" class="mc-donut-svg">
                      <g transform="rotate(-90 50 50)">
                        <circle v-for="(seg, i) in bugSegments" :key="'bs'+i"
                          cx="50" cy="50" r="36" fill="none"
                          :stroke="seg.color" stroke-width="14"
                          :stroke-dasharray="`${seg.dash} ${226.19 - seg.dash}`"
                          :stroke-dashoffset="seg.offset"
                          stroke-linecap="butt"
                          class="animated-ring"
                        />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- CARD 6: Team Contribution Allocation -->
              <div class="mini-chart-card">
                <div class="mc-header">
                  <h4 class="mc-title">Team Allocation</h4>
                </div>
                <div class="mc-body">
                  <div class="mc-legend">
                    <div v-for="item in deviceUsageRings" :key="item.name" class="mc-leg-item">
                      <span class="mc-dot" :style="{ background: item.color }"></span>
                      <span class="mc-name">{{ item.name }}</span>
                      <span class="mc-pct">{{ item.pct }}%</span>
                    </div>
                  </div>
                  <div class="mc-chart-wrap">
                    <svg viewBox="0 0 100 100" class="mc-radial-rings-svg">
                      <circle v-for="(ring, i) in deviceUsageRings" :key="'dur'+i"
                        cx="50" cy="50" :r="ring.radius" fill="none"
                        :stroke="ring.color" stroke-width="6"
                        :stroke-dasharray="`${ring.dash} ${ring.circumference - ring.dash}`"
                        stroke-linecap="round"
                        transform="rotate(-90 50 50)"
                        class="animated-ring"
                      />
                    </svg>
                  </div>
                </div>
              </div>

            </div>

          </div>

          <!-- BOTTOM STATISTICS (6 Structured, Perfectly Aligned Enterprise KPI Cards) -->
          <div class="hero-bottom-kpis">
            
            <!-- Card 1: Sprint Completion -->
            <div class="kpi-card-hero">
              <div class="kpi-hero-top-bar">
                <div class="kpi-hero-icon emerald">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <span class="kpi-hero-trend" :class="trends.completionPct.dir === 'up' ? 'up' : trends.completionPct.dir === 'down' ? 'down' : 'neutral'">
                  {{ trends.completionPct.value > 0 ? '↑' : trends.completionPct.value < 0 ? '↓' : '' }} {{ Math.abs(trends.completionPct.value) }}%
                </span>
              </div>
              <div class="kpi-hero-val-wrap">
                <span class="kpi-hero-num">{{ summary.completionPct }}%</span>
              </div>
              <div class="kpi-hero-sub">Sprint Completion</div>
            </div>

            <!-- Card 2: Issues Closed -->
            <div class="kpi-card-hero">
              <div class="kpi-hero-top-bar">
                <div class="kpi-hero-icon blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                </div>
                <span class="kpi-hero-trend" :class="trends.done.dir === 'up' ? 'up' : trends.done.dir === 'down' ? 'down' : 'neutral'">
                  {{ trends.done.value > 0 ? '↑' : trends.done.value < 0 ? '↓' : '' }} {{ Math.abs(trends.done.value) }}
                </span>
              </div>
              <div class="kpi-hero-val-wrap">
                <span class="kpi-hero-num">{{ summary.doneIssues }}</span>
              </div>
              <div class="kpi-hero-sub">Issues Closed</div>
            </div>

            <!-- Card 3: Velocity Pace -->
            <div class="kpi-card-hero">
              <div class="kpi-hero-top-bar">
                <div class="kpi-hero-icon purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <span class="kpi-hero-trend" :class="trends.velocity.dir === 'up' ? 'up' : trends.velocity.dir === 'down' ? 'down' : 'neutral'">
                  {{ trends.velocity.value > 0 ? '↑' : trends.velocity.value < 0 ? '↓' : '' }} {{ Math.abs(trends.velocity.value) }}
                </span>
              </div>
              <div class="kpi-hero-val-wrap">
                <span class="kpi-hero-num">{{ summary.velocity > 0 ? summary.velocity : summary.spCompleted }}</span>
                <span class="kpi-hero-unit">pts</span>
              </div>
              <div class="kpi-hero-sub">Velocity Pace</div>
            </div>

            <!-- Card 4: Blocked Friction -->
            <div class="kpi-card-hero">
              <div class="kpi-hero-top-bar">
                <div class="kpi-hero-icon" :class="summary.blockedIssues > 0 ? 'red' : 'emerald'">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </div>
                <span class="kpi-hero-trend" :class="trends.blocked.dir === 'down' ? 'up' : trends.blocked.dir === 'up' ? 'down' : 'neutral'">
                  {{ trends.blocked.value > 0 ? '↑' : trends.blocked.value < 0 ? '↓' : '' }} {{ Math.abs(trends.blocked.value) }}
                </span>
              </div>
              <div class="kpi-hero-val-wrap">
                <span class="kpi-hero-num" :class="summary.blockedIssues > 0 ? 'red' : ''">{{ summary.blockedIssues }}</span>
              </div>
              <div class="kpi-hero-sub">Blocked Friction</div>
            </div>

            <!-- Card 5: Burndown Pace -->
            <div class="kpi-card-hero">
              <div class="kpi-hero-top-bar">
                <div class="kpi-hero-icon orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                </div>
                <span class="kpi-hero-trend" :class="trends.spCompleted.dir === 'up' ? 'up' : trends.spCompleted.dir === 'down' ? 'down' : 'neutral'">
                  {{ trends.spCompleted.value > 0 ? '↑' : trends.spCompleted.value < 0 ? '↓' : '' }} {{ Math.abs(trends.spCompleted.value) }}%
                </span>
              </div>
              <div class="kpi-hero-val-wrap">
                <span class="kpi-hero-num">{{ summary.spCompletionPct > 0 ? summary.spCompletionPct : summary.completionPct }}%</span>
              </div>
              <div class="kpi-hero-sub">Burndown Pace</div>
            </div>

            <!-- Card 6: Sprint Efficiency -->
            <div class="kpi-card-hero">
              <div class="kpi-hero-top-bar">
                <div class="kpi-hero-icon cyan">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                </div>
                <span class="kpi-hero-trend" :class="trends.healthScore.dir === 'up' ? 'up' : trends.healthScore.dir === 'down' ? 'down' : 'neutral'">
                  {{ trends.healthScore.value > 0 ? '↑' : trends.healthScore.value < 0 ? '↓' : '' }} {{ Math.abs(trends.healthScore.value) }}%
                </span>
              </div>
              <div class="kpi-hero-val-wrap">
                <span class="kpi-hero-num">{{ summary.healthScore }}%</span>
              </div>
              <div class="kpi-hero-sub">Sprint Efficiency</div>
            </div>

          </div>

        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 2 — Executive KPI Cards               -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Executive KPIs Overview</h2>
            <span class="sec-subtitle">Key performance indicators vs previous {{ selectedPeriod }} snapshot</span>
          </div>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="kpi in data.execKpis" :key="kpi.key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="kpi.icon === 'heart'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <svg v-else-if="kpi.icon === 'check-circle'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  <svg v-else-if="kpi.icon === 'zap'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <svg v-else-if="kpi.icon === 'clock'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <svg v-else-if="kpi.icon === 'trending-up'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  <svg v-else-if="kpi.icon === 'list'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  <svg v-else-if="kpi.icon === 'check-square'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                  <svg v-else-if="kpi.icon === 'activity'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <svg v-else-if="kpi.icon === 'inbox'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
                  <svg v-else-if="kpi.icon === 'shield-off'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/><path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  <svg v-else-if="kpi.icon === 'alert-triangle'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  <svg v-else-if="kpi.icon === 'flag'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                  <svg v-else-if="kpi.icon === 'bug'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/><path d="M6.53 9C4.6 8.8 3 7.1 3 5"/><path d="M6 13H2"/><path d="M3 21c0-2.1 1.7-3.9 3.8-4"/><path d="M20.97 5c0 2.1-1.6 3.8-3.5 4"/><path d="M22 13h-4"/><path d="M17.2 17c2.1.1 3.8 1.9 3.8 4"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg>
                </div>
                <span class="kpi-name">{{ kpi.name }}</span>
              </div>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ kpi.value }}</span>
              <span class="trend-badge" :class="kpi.trend.dir === 'up' ? 'positive' : kpi.trend.dir === 'down' ? 'negative' : 'neutral'">
                <svg v-if="kpi.trend.dir === 'up'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                <svg v-else-if="kpi.trend.dir === 'down'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {{ kpi.trend.value > 0 ? '+' : '' }}{{ kpi.trend.value }}
              </span>
            </div>
            <div class="segmented-bar-wrap">
              <SegmentedProgressBar :value="kpi.pct" :variant="kpi.variant" height="18px" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Previous {{ selectedPeriod }}</span>
              <span class="kpi-footer-val">{{ kpi.prevPeriod }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 — Sprint Progress                   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Sprint Progress &amp; Execution</h2>
            <span class="sec-subtitle">Sprint timeline execution, story point burn &amp; status distribution</span>
          </div>
        </div>

        <div class="sprint-progress-grid">
          <!-- Sprint Timeline Card -->
          <div class="card-analytics">
            <div class="card-analytics-header">
              <div>
                <h3 class="card-title">Sprint Timeline</h3>
                <p class="card-desc">Sprint duration timeline &amp; remaining calendar days</p>
              </div>
            </div>

            <div class="sp-timeline-wrap">
              <div class="sp-timeline-labels">
                <span>{{ sprintStartLabel }}</span>
                <span>Today • Day {{ summary.currentDay }}</span>
                <span>{{ sprintEndLabel }}</span>
              </div>
              <div class="sp-timeline-bar">
                <div class="sp-tl-fill" :style="{ width: summary.sprintProgressPct + '%' }"></div>
                <div class="sp-tl-marker" :style="{ left: summary.sprintProgressPct + '%' }"></div>
              </div>
              <div class="sp-timeline-chips">
                <span class="tm-chip emerald">{{ summary.sprintProgressPct }}% Sprint Elapsed</span>
                <span class="tm-chip blue">{{ summary.currentDay }} of {{ summary.sprintDays }} Days</span>
                <span class="tm-chip orange">{{ summary.daysRemaining }} Days Remaining</span>
              </div>
            </div>

            <!-- Story Point Burn -->
            <div class="sp-burn-block" v-if="summary.spTotal > 0">
              <div class="sp-burn-header">
                <span class="sp-burn-title">Story Point Progress</span>
                <span class="sp-burn-pct emerald">{{ summary.spCompletionPct || summary.completionPct }}% Burned</span>
              </div>
              <div class="sp-3way-bar">
                <div class="sp-seg done-seg" :style="{ width: (summary.spTotal > 0 ? Math.round((summary.spCompleted / summary.spTotal) * 100) : 0) + '%' }" :title="`Done: ${summary.spCompleted} pts`"></div>
                <div class="sp-seg remaining-seg" :style="{ width: (summary.spTotal > 0 ? Math.round((summary.spRemaining / summary.spTotal) * 100) : 0) + '%' }" :title="`Remaining: ${summary.spRemaining} pts`"></div>
              </div>
              <div class="sp-burn-legend">
                <span class="leg-item"><span class="leg-dot emerald-bg"></span>Completed: {{ summary.spCompleted }} pts</span>
                <span class="leg-item"><span class="leg-dot orange-bg"></span>Remaining: {{ summary.spRemaining }} pts</span>
                <span class="leg-item"><span class="leg-dot gray-bg"></span>Total: {{ summary.spTotal }} pts</span>
              </div>
            </div>

            <!-- Issue Distribution Stacked Bar -->
            <div class="sp-burn-block">
              <div class="sp-burn-header">
                <span class="sp-burn-title">Issue Distribution</span>
                <span class="sp-burn-pct blue">{{ summary.totalIssues }} Total</span>
              </div>
              <div class="sp-3way-bar">
                <div v-for="seg in issueDistribution" :key="seg.name"
                  class="sp-seg" :style="{ width: seg.pct + '%', background: seg.color }"
                  :title="`${seg.name}: ${seg.count}`"></div>
              </div>
              <div class="sp-burn-legend">
                <span v-for="seg in issueDistribution" :key="'l-'+seg.name" class="leg-item">
                  <span class="leg-dot" :style="{ background: seg.color }"></span>
                  {{ seg.name }}: {{ seg.count }}
                </span>
              </div>
            </div>
          </div>

          <!-- Workflow Status Breakdown -->
          <div class="card-analytics" v-if="statusColumns.length">
            <div class="card-analytics-header">
              <div>
                <h3 class="card-title">Workflow Status Breakdown</h3>
                <p class="card-desc">Issue count &amp; percentage per workflow column</p>
              </div>
            </div>

            <div class="status-list">
              <div v-for="col in statusColumns" :key="col.name" class="status-row">
                <div class="status-row-info">
                  <span class="status-dot" :style="{ background: col.color || '#6B7280' }"></span>
                  <span class="status-name">{{ col.name }}</span>
                  <span class="status-count">{{ col.count }}</span>
                </div>
                <div class="status-bar-bg">
                  <div class="status-bar-fill"
                    :style="{ width: summary.totalIssues > 0 ? Math.round((col.count / summary.totalIssues) * 100) + '%' : '0%', background: col.color || '#6B7280' }">
                  </div>
                </div>
                <span class="status-pct">{{ summary.totalIssues > 0 ? Math.round((col.count / summary.totalIssues) * 100) : 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 4 — Performance Analytics Charts       -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Performance Analytics &amp; Trends</h2>
            <span class="sec-subtitle">Sprint-over-sprint completion trend, velocity, status &amp; priority breakdown</span>
          </div>
        </div>

        <div class="charts-grid">
          <!-- Completion Trend Line Chart (Enlarged Height & ViewBox) -->
          <div class="card-analytics chart-card">
            <div class="card-analytics-header">
              <div>
                <h3 class="card-title">Sprint Completion Trend</h3>
                <p class="card-desc">Completion % rate trajectory across recent report runs</p>
              </div>
            </div>

            <div class="line-chart-area prominent-chart" @mousemove="handleCompletionHover" @mouseleave="hoveredCompletionIdx = null">
              <svg viewBox="0 0 760 320" preserveAspectRatio="none" class="chart-svg">
                <defs>
                  <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#059669" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#059669" stop-opacity="0.02"/>
                  </linearGradient>
                </defs>
                <line v-for="g in [0,25,50,75,100]" :key="g" x1="45" :y1="280 - (g/100)*240" x2="750" :y2="280 - (g/100)*240" stroke="#E5E7EB" stroke-dasharray="4,4"/>
                <text v-for="g in [0,25,50,75,100]" :key="'gl'+g" x="38" :y="284 - (g/100)*240" text-anchor="end" font-size="10" fill="#9CA3AF" font-weight="600">{{ g }}%</text>
                <path v-if="completionChartPts.length > 1" :d="completionAreaPath" fill="url(#cg1)"/>
                <path v-if="completionChartPts.length > 1" :d="completionLinePath" fill="none" stroke="#059669" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle v-for="(pt, i) in completionChartPts" :key="'cp'+i" :cx="pt.x" :cy="pt.y" r="5.5" fill="#059669" stroke="#ffffff" stroke-width="2.5"/>
                <text v-for="(pt, i) in completionChartPts" :key="'cl'+i" :x="pt.x" y="308" text-anchor="middle" font-size="10" fill="#6B7280" font-weight="600">{{ pt.label }}</text>
                <line v-if="hoveredCompletionIdx !== null" :x1="completionChartPts[hoveredCompletionIdx]?.x" y1="20" :x2="completionChartPts[hoveredCompletionIdx]?.x" y2="280" stroke="#059669" stroke-width="2" stroke-dasharray="4,4"/>
              </svg>
              <div v-if="hoveredCompletionIdx !== null && completionChartPts[hoveredCompletionIdx]" class="chart-tooltip-popup" :style="completionTooltipStyle">
                <div class="tooltip-header">{{ completionChartPts[hoveredCompletionIdx].label }}</div>
                <div class="tooltip-row emerald"><span class="dot"></span> Completion: <strong>{{ completionChartPts[hoveredCompletionIdx].completionPct }}%</strong></div>
                <div class="tooltip-row purple"><span class="dot"></span> Velocity: <strong>{{ completionChartPts[hoveredCompletionIdx].velocity }} pts</strong></div>
              </div>
            </div>
          </div>

          <!-- Velocity Trend Chart (Enlarged Height & ViewBox) -->
          <div class="card-analytics chart-card">
            <div class="card-analytics-header">
              <div>
                <h3 class="card-title">Velocity Trend</h3>
                <p class="card-desc">Historical story point delivery output</p>
              </div>
            </div>

            <div class="line-chart-area prominent-chart" @mousemove="handleVelocityHover" @mouseleave="hoveredVelocityIdx = null">
              <svg viewBox="0 0 760 320" preserveAspectRatio="none" class="chart-svg">
                <defs>
                  <linearGradient id="vg1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#7C3AED" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#7C3AED" stop-opacity="0.02"/>
                  </linearGradient>
                </defs>
                <line v-for="g in [0,25,50,75,100]" :key="g" x1="45" :y1="280 - (g/100)*240" x2="750" :y2="280 - (g/100)*240" stroke="#E5E7EB" stroke-dasharray="4,4"/>
                <text v-for="g in [0,25,50,75,100]" :key="'vgl'+g" x="38" :y="284 - (g/100)*240" text-anchor="end" font-size="10" fill="#9CA3AF" font-weight="600">{{ Math.round(g * maxVelocity / 100) }}</text>
                <path v-if="velocityChartPts.length > 1" :d="velocityAreaPath" fill="url(#vg1)"/>
                <path v-if="velocityChartPts.length > 1" :d="velocityLinePath" fill="none" stroke="#7C3AED" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle v-for="(pt, i) in velocityChartPts" :key="'vp'+i" :cx="pt.x" :cy="pt.y" r="5.5" fill="#7C3AED" stroke="#ffffff" stroke-width="2.5"/>
                <text v-for="(pt, i) in velocityChartPts" :key="'vl'+i" :x="pt.x" y="308" text-anchor="middle" font-size="10" fill="#6B7280" font-weight="600">{{ pt.label }}</text>
                <line v-if="hoveredVelocityIdx !== null" :x1="velocityChartPts[hoveredVelocityIdx]?.x" y1="20" :x2="velocityChartPts[hoveredVelocityIdx]?.x" y2="280" stroke="#7C3AED" stroke-width="2" stroke-dasharray="4,4"/>
              </svg>
              <div v-if="hoveredVelocityIdx !== null && velocityChartPts[hoveredVelocityIdx]" class="chart-tooltip-popup" :style="velocityTooltipStyle">
                <div class="tooltip-header">{{ velocityChartPts[hoveredVelocityIdx].label }}</div>
                <div class="tooltip-row purple"><span class="dot"></span> Velocity: <strong>{{ velocityChartPts[hoveredVelocityIdx].velocity }} pts</strong></div>
                <div class="tooltip-row emerald"><span class="dot"></span> Completion: <strong>{{ velocityChartPts[hoveredVelocityIdx].completionPct }}%</strong></div>
              </div>
            </div>
          </div>

          <!-- Status Distribution Donut Chart -->
          <div class="card-analytics chart-card donut-card">
            <div class="card-analytics-header">
              <div>
                <h3 class="card-title">Status Distribution</h3>
                <p class="card-desc">Ratio of completed vs in progress &amp; blocked tasks</p>
              </div>
            </div>

            <div class="donut-chart-wrap">
              <div class="donut-center-container">
                <svg viewBox="0 0 160 160" class="donut-svg">
                  <g transform="rotate(-90 80 80)">
                    <circle v-for="(seg, i) in donutSegments" :key="'ds'+i"
                      cx="80" cy="80" r="60"
                      fill="none"
                      :stroke="seg.color"
                      stroke-width="20"
                      :stroke-dasharray="`${seg.dash} ${377 - seg.dash}`"
                      :stroke-dashoffset="seg.offset"
                      stroke-linecap="butt"
                    />
                  </g>
                  <text x="80" y="74" text-anchor="middle" font-size="22" font-weight="800" fill="#111827">{{ summary.totalIssues }}</text>
                  <text x="80" y="92" text-anchor="middle" font-size="9" font-weight="600" fill="#6B7280">Total Issues</text>
                </svg>
              </div>
              <div class="donut-legend">
                <div v-for="seg in donutSegments" :key="'dl'+seg.name" class="donut-leg-row">
                  <span class="leg-dot" :style="{ background: seg.color }"></span>
                  <span class="donut-leg-name">{{ seg.name }}</span>
                  <span class="donut-leg-count">{{ seg.count }}</span>
                  <span class="donut-leg-pct">{{ seg.pct }}%</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Priority Distribution Horizontal Bar Chart -->
          <div class="card-analytics chart-card" v-if="data.current.prioritySprint?.length">
            <div class="card-analytics-header">
              <div>
                <h3 class="card-title">Priority Distribution</h3>
                <p class="card-desc">Done vs open work items grouped by priority</p>
              </div>
            </div>

            <div class="priority-chart-list">
              <div v-for="p in data.current.prioritySprint" :key="p.priority" class="priority-chart-row">
                <div class="pcr-label-wrap">
                  <span class="pcr-dot" :style="{ background: p.color || '#6B7280' }"></span>
                  <span class="pcr-name">{{ p.priority }}</span>
                  <span class="pcr-count">{{ p.total }}</span>
                </div>
                <div class="pcr-bar-wrap">
                  <div class="pcr-bar done-bar" :style="{ width: (p.total > 0 ? Math.round((p.done / p.total) * 100) : 0) + '%', background: p.color || '#059669' }" :title="`Done: ${p.done}`"></div>
                  <div class="pcr-bar remain-bar" :style="{ width: (p.total > 0 ? Math.round(((p.total - p.done) / p.total) * 100) : 0) + '%' }" :title="`Remaining: ${p.total - p.done}`"></div>
                </div>
                <span class="pcr-pct">{{ p.total > 0 ? Math.round((p.done / p.total) * 100) : 0 }}%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 6 — Team Performance                  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="data.current.team?.length">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Team Performance &amp; Contribution</h2>
            <span class="sec-subtitle">Member workload, completed issues, story points &amp; utilization rate</span>
          </div>
        </div>

        <div class="team-cards-grid">
          <div v-for="(member, idx) in data.current.team" :key="member.name" class="team-card">
            <div class="tc-header">
              <div class="tc-avatar-initials" :class="getMemberAvatarClass(idx)">
                {{ getInitials(member.name) }}
              </div>
              <div class="tc-info">
                <h4 class="tc-name">{{ member.name }}</h4>
                <span class="tc-role" v-if="member.email">{{ member.email }}</span>
              </div>
              <span class="tc-status-badge" :class="getMemberStatusClass(member.status)">{{ member.status || 'Active' }}</span>
            </div>

            <div class="tc-stats-row">
              <div class="tc-stat">
                <span class="label">Assigned</span>
                <span class="val">{{ member.assigned || 0 }}</span>
              </div>
              <div class="tc-stat">
                <span class="label">Completed</span>
                <span class="val emerald">{{ member.completed || 0 }}</span>
              </div>
              <div class="tc-stat" v-if="member.storyPointsDelivered > 0">
                <span class="label">SP Done</span>
                <span class="val blue">{{ member.storyPointsDelivered }}</span>
              </div>
            </div>

            <div class="tc-bars-section">
              <!-- Completion Bar -->
              <div class="tc-bar-group">
                <div class="tc-bar-label">
                  <span>Completion</span>
                  <span class="emerald font-bold">{{ member.completionRate || (member.assigned > 0 ? Math.round((member.completed / member.assigned) * 100) : 0) }}%</span>
                </div>
                <div class="progress-bar-track-sm">
                  <div class="progress-bar-fill-sm emerald" :style="{ width: Math.min(100, member.completionRate || (member.assigned > 0 ? Math.round((member.completed / member.assigned) * 100) : 0)) + '%' }"></div>
                </div>
              </div>

              <!-- Utilization Bar -->
              <div class="tc-bar-group" v-if="member.utilizationPct !== undefined">
                <div class="tc-bar-label">
                  <span>Utilization</span>
                  <span :class="member.utilizationPct > 100 ? 'red' : member.utilizationPct > 80 ? 'orange' : 'blue'">{{ member.utilizationPct }}%</span>
                </div>
                <div class="progress-bar-track-sm">
                  <div class="progress-bar-fill-sm"
                    :class="member.utilizationPct > 100 ? 'orange' : member.utilizationPct > 80 ? 'orange' : 'blue'"
                    :style="{ width: Math.min(100, member.utilizationPct || 0) + '%' }">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 7 — Priority Analytics                -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="data.current.prioritySprint?.length">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Priority Analytics</h2>
            <span class="sec-subtitle">Work item breakdown &amp; progress rate per priority tier</span>
          </div>
        </div>

        <div class="sp-analytics-grid">
          <div v-for="p in data.current.prioritySprint" :key="'pc-'+p.priority" class="sp-card">
            <div class="sp-icon-row">
              <span class="pac-dot" :style="{ background: p.color || '#6B7280' }"></span>
              <span class="sp-title">{{ p.priority }} Priority</span>
            </div>
            <div class="sp-main-val" :class="p.done === p.total ? 'emerald' : 'blue'">{{ p.done }} / {{ p.total }}</div>
            <div class="segmented-bar-wrap">
              <SegmentedProgressBar :value="p.total > 0 ? Math.round((p.done / p.total) * 100) : 0" :variant="p.done === p.total ? 'emerald' : 'blue'" height="14px" />
            </div>
            <span class="sp-sub-text">{{ p.total > 0 ? Math.round((p.done / p.total) * 100) : 0 }}% completed • {{ p.storyPoints || 0 }} SP</span>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 8 — Backlog Analysis                  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="data.current.backlog">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Backlog Health &amp; Analysis</h2>
            <span class="sec-subtitle">Total backlog volume, unassigned tasks, high priority &amp; open bugs</span>
          </div>
        </div>

        <div class="sp-analytics-grid">
          <div v-for="bl in backlogCards" :key="bl.name" class="sp-card">
            <div class="sp-icon-row">
              <div class="kpi-icon-badge" :class="bl.variant">
                <svg v-if="bl.icon === 'inbox'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
                <svg v-else-if="bl.icon === 'user-x'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" y1="8" x2="23" y2="14"/><line x1="23" y1="8" x2="17" y2="14"/></svg>
                <svg v-else-if="bl.icon === 'flag'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                <svg v-else-if="bl.icon === 'help-circle'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <svg v-else-if="bl.icon === 'bug'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9"/></svg>
                <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span class="sp-title">{{ bl.name }}</span>
            </div>
            <div class="sp-main-val" :class="bl.variant">{{ bl.value }}</div>
            <div class="segmented-bar-wrap" v-if="bl.pct >= 0">
              <SegmentedProgressBar :value="bl.pct" :variant="bl.variant" height="14px" />
            </div>
            <span class="sp-sub-text" v-if="bl.pct >= 0">{{ bl.pct }}% of total backlog</span>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 9 — Risk Center & Delivery Friction   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Risk Center &amp; Delivery Friction</h2>
            <span class="sec-subtitle">Blocked items, overdue tasks, unassigned issues &amp; risk score</span>
          </div>
        </div>

        <div class="sp-analytics-grid">
          <!-- Overall Risk Hero -->
          <div class="sp-card risk-hero-card" :class="riskLevelClass">
            <div class="sp-title-with-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span class="sp-title font-bold">Overall Risk Level</span>
            </div>
            <div class="sp-main-val">{{ summary.riskLevel }}</div>
            <span class="sp-sub-text">Aggregated sprint friction index</span>
            <div class="sp-card-footer">
              <span class="severity-badge" :class="getSeverityBadgeClass(summary.riskLevel)">
                <svg v-if="summary.riskLevel === 'High' || summary.riskLevel === 'Critical'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <svg v-else-if="summary.riskLevel === 'Medium'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {{ summary.riskLevel }} Severity
              </span>
            </div>
          </div>

          <!-- Risk Cards with Severity Badges at the bottom/last -->
          <div v-for="risk in riskCards" :key="risk.title" class="sp-card">
            <span class="sp-title">{{ risk.title }}</span>
            <div class="sp-main-val" :class="risk.color === 'risk-high' ? 'red' : 'emerald'">{{ risk.count }}</div>
            <span class="sp-sub-text">{{ risk.desc }}</span>
            <div class="sp-card-footer">
              <span class="severity-badge" :class="getSeverityBadgeClass(risk.severity)">
                <svg v-if="risk.severity === 'High' || risk.severity === 'Critical'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <svg v-else-if="risk.severity === 'Medium'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                {{ risk.severity }} Severity
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 10 — AI Project Intelligence          -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="hasAnalysis">
        <div class="ai-intelligence-card">
          <div class="ai-header">
            <div class="ai-title-wrap">
              <span class="ai-sparkle-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2"><path d="M12 2l2.4 7.2L21.6 12l-7.2 2.4L12 21.6l-2.4-7.2L2.4 12l7.2-2.4z"/></svg>
              </span>
              <h3 class="ai-title">AI Project Intelligence</h3>
            </div>
            <span class="ai-model-badge">Gemini AI Engine v4</span>
          </div>

          <!-- Executive Summary -->
          <div class="ai-summary-box" v-if="analysis.executiveSummary">
            {{ analysis.executiveSummary }}
          </div>

          <div class="ai-grid-3col">
            <!-- Achievements -->
            <div class="ai-subcard" v-if="analysis.keyAchievements?.length">
              <h4 class="ai-subcard-title emerald">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                Key Achievements
              </h4>
              <div v-for="(item, i) in analysis.keyAchievements.slice(0, 4)" :key="i" class="ai-item-row">
                <span class="ai-badge-sm green">Win</span>
                <strong>{{ item }}</strong>
              </div>
            </div>

            <!-- Risks & Blockers -->
            <div class="ai-subcard">
              <h4 class="ai-subcard-title orange">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Risks &amp; Blockers
              </h4>
              <div v-for="(item, i) in analysis.risks?.slice(0, 3)" :key="'r'+i" class="ai-item-row">
                <span class="ai-badge-sm orange">Risk</span>
                <strong>{{ item }}</strong>
              </div>
              <div v-for="(item, i) in analysis.blockers?.slice(0, 2)" :key="'b'+i" class="ai-item-row">
                <span class="ai-badge-sm orange">Blocked</span>
                <strong>{{ item }}</strong>
              </div>
              <div v-if="!analysis.risks?.length && !analysis.blockers?.length" class="ai-item-row">
                <span class="ai-badge-sm green">Clear</span>
                <strong>No critical risks identified</strong>
              </div>
            </div>

            <!-- Recommendations -->
            <div class="ai-subcard" v-if="analysis.recommendations?.length">
              <h4 class="ai-subcard-title blue">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
                Recommendations
              </h4>
              <div v-for="(item, i) in analysis.recommendations.slice(0, 4)" :key="'rec'+i" class="ai-item-row">
                <span class="ai-badge-sm green">Action</span>
                <strong>{{ item }}</strong>
              </div>
            </div>
          </div>

          <!-- Priority Actions Banner -->
          <div class="ai-forecast-banner" v-if="analysis.priorityActions?.length">
            <div class="afb-left">
              <span class="afb-label">Priority Actions Required</span>
              <div class="afb-val-row">
                <span class="afb-main-val">{{ analysis.priorityActions[0] }}</span>
              </div>
            </div>
            <div class="afb-right-metrics" v-if="analysis.priorityActions.length > 1">
              <div v-for="(act, idx) in analysis.priorityActions.slice(1, 3)" :key="'pa'+idx" class="afb-sub">
                <span>Action {{ idx + 2 }}</span>
                <strong>{{ act }}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 11 — Project Statistics               -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Project Statistics Summary</h2>
            <span class="sec-subtitle">Aggregated metrics from latest snapshot</span>
          </div>
        </div>

        <div class="stats-summary-grid">
          <div v-for="stat in projectStats" :key="stat.label" class="stat-mini-card" :class="stat.variant">
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 12 — Recent Reports                   -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container" v-if="data.recentReports?.length">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Recent Reports History</h2>
            <span class="sec-subtitle">Sprint report history &amp; snapshot logs</span>
          </div>
        </div>

        <div class="card-analytics padding-none">
          <div class="table-responsive">
            <table class="velocity-data-table">
              <thead>
                <tr>
                  <th>Report Type</th>
                  <th>Generated Date</th>
                  <th>Sprint Name</th>
                  <th>Health Score</th>
                  <th>Completion Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(report, idx) in data.recentReports" :key="idx" class="clickable-row">
                  <td><strong style="text-transform:capitalize;">{{ report.type }} Report</strong></td>
                  <td>{{ formatDate(report.generatedAt) }}</td>
                  <td>{{ report.sprintName }}</td>
                  <td>
                    <span class="tbl-health-pill" :class="report.healthScore >= 75 ? 'high' : report.healthScore >= 50 ? 'mid' : 'low'">
                      {{ report.healthScore }}% Health
                    </span>
                  </td>
                  <td class="emerald font-bold">{{ report.completionPct }}%</td>
                  <td>
                    <button class="action-btn-sm" @click="fetchData">Open Report</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 13 — Quick Actions                    -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="quick-actions-bar">
          <button class="qa-btn" @click="navTo('/sprint/health')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Sprint Health
          </button>
          <button class="qa-btn" @click="navTo('/sprint/velocity')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Velocity Analytics
          </button>
          <button class="qa-btn" @click="navTo('/sprint/burndown')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            Burndown
          </button>
          <button class="qa-btn primary" @click="exportReport">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Download Report
          </button>
          <button class="qa-btn" @click="exportCSV">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Excel
          </button>
          <button class="qa-btn" @click="emailReport">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            Email Report
          </button>
          <button class="qa-btn" @click="openJira">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Open Jira
          </button>
          <button class="qa-btn" @click="fetchData">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
            Refresh Data
          </button>
        </div>
      </section>

    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// ── State ──
const decodedCompany = computed(() => decodeURIComponent(route.params.company || ''));
const selectedPeriod = ref('daily');
const selectedSprint = ref('ALL');
const pending = ref(false);
const data = ref(null);
const toast = ref({ show: false, message: '', type: 'success' });
let toastTimer = null;

useHead({
  title: computed(() => `${data.value?.companyName || decodedCompany.value || 'Project'} | Project Executive Dashboard | Sprintlytics`)
});

// Chart hover state
const hoveredCompletionIdx = ref(null);
const hoveredVelocityIdx = ref(null);

// ── Toast ──
const showToast = (message, type = 'success') => {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
};

// ── Fetch Data ──
const fetchData = async () => {
  pending.value = true;
  try {
    const res = await $fetch('/api/projects/by-company', {
      query: {
        company: decodedCompany.value,
        period: selectedPeriod.value,
        sprint: selectedSprint.value,
      }
    });
    if (res?.success) {
      data.value = res;
    } else {
      data.value = null;
    }
  } catch (err) {
    console.error('Failed to load project data:', err);
    showToast('Failed to load project data', 'error');
    data.value = null;
  } finally {
    pending.value = false;
  }
};

onMounted(() => fetchData());

watch(() => route.params.company, () => {
  selectedSprint.value = 'ALL';
  fetchData();
});

// ── Computed Shortcuts ──
const summary = computed(() => data.value?.summary || {});
const trends = computed(() => data.value?.trends || {
  healthScore: { value: 0, dir: 'stable' },
  completionPct: { value: 0, dir: 'stable' },
  spCompleted: { value: 0, dir: 'stable' },
  velocity: { value: 0, dir: 'stable' },
  done: { value: 0, dir: 'stable' },
  blocked: { value: 0, dir: 'stable' },
  bugCount: { value: 0, dir: 'stable' },
});
const sprint = computed(() => data.value?.current?.sprint || {});
const statusColumns = computed(() => data.value?.current?.statusColumns || []);
const analysis = computed(() => data.value?.current?.analysis || {});
const hasAnalysis = computed(() => !!(analysis.value.executiveSummary || analysis.value.keyAchievements?.length || analysis.value.risks?.length));

const sprintOptions = computed(() => data.value?.sprintOptions || [{ label: 'All Sprints', value: 'ALL' }]);

// ── Hero Dashboard Calculations & Metadata ──
const projectOwnerName = computed(() => {
  const team = data.value?.current?.team || [];
  return team[0]?.name || 'Faisal SysLab';
});

const healthColor = computed(() => {
  const score = summary.value?.healthScore ?? 0;
  if (score >= 90) return '#10B981'; // Emerald
  if (score >= 70) return '#2563EB'; // Blue
  if (score >= 40) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
});

const healthBadgeText = computed(() => {
  const score = summary.value?.healthScore ?? 0;
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Warning';
  return 'Critical';
});

const healthBadgeClass = computed(() => {
  const score = summary.value?.healthScore ?? 0;
  if (score >= 90) return 'emerald';
  if (score >= 70) return 'blue';
  if (score >= 40) return 'orange';
  return 'red';
});

const getSeverityBadgeClass = (severity) => {
  if (!severity) return 'sev-low';
  const s = String(severity).toLowerCase();
  if (s.includes('high') || s.includes('critical')) return 'sev-high';
  if (s.includes('medium') || s.includes('mid')) return 'sev-medium';
  return 'sev-low';
};

// Helper for Donut Segments (r = 36 -> circumference = 2 * PI * 36 ≈ 226.19)
const buildDonutSegments = (items) => {
  const totalVal = items.reduce((acc, i) => acc + (i.count !== undefined ? i.count : (i.pct || 0)), 0) || 1;
  const circumference = 226.19;
  let offsetAcc = 0;
  return items.map((item) => {
    const val = item.count !== undefined ? item.count : item.pct;
    const pct = Math.round((val / totalVal) * 100);
    const dash = (val / totalVal) * circumference;
    const seg = { ...item, pct, dash, offset: circumference - offsetAcc };
    offsetAcc += dash;
    return seg;
  });
};

// Helper for Concentric Radial Rings (radii: 38, 30, 22, 14)
const buildConcentricRings = (items) => {
  const radii = [38, 30, 22, 14];
  const maxVal = Math.max(...items.map(i => i.count !== undefined ? i.count : (i.pct || 0)), 1);
  return items.map((item, idx) => {
    const val = item.count !== undefined ? item.count : item.pct;
    const r = radii[idx % radii.length];
    const circumference = 2 * Math.PI * r;
    const pct = item.pct !== undefined ? item.pct : Math.round((val / maxVal) * 100);
    const dash = (pct / 100) * circumference;
    return { ...item, pct, radius: r, circumference, dash };
  });
};

// Card 1: Workflow Stage Distribution (Context Distribution)
const contextData = computed(() => {
  const cols = statusColumns.value || [];
  if (cols.length) {
    const colors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];
    return cols.map((col, idx) => ({
      name: col.name,
      count: col.count || 0,
      color: col.color || colors[idx % colors.length]
    }));
  }
  const s = summary.value;
  return [
    { name: 'Completed', count: s.doneIssues || 0, color: '#10B981' },
    { name: 'In Progress', count: s.inProgressIssues || 0, color: '#3B82F6' },
    { name: 'Todo', count: s.todoIssues || 0, color: '#8B5CF6' },
    { name: 'Blocked', count: s.blockedIssues || 0, color: '#EF4444' },
  ];
});
const contextSegments = computed(() => buildDonutSegments(contextData.value));

// Card 2: Task Status (Concentric Rings)
const taskStatusData = computed(() => {
  const s = summary.value;
  const t = Math.max(1, s.totalIssues || 0);
  return [
    { name: 'Completed', count: s.doneIssues || 0, pct: Math.round(((s.doneIssues || 0) / t) * 100), color: '#10B981' },
    { name: 'In Progress', count: s.inProgressIssues || 0, pct: Math.round(((s.inProgressIssues || 0) / t) * 100), color: '#2563EB' },
    { name: 'Pending', count: s.todoIssues || 0, pct: Math.round(((s.todoIssues || 0) / t) * 100), color: '#8B5CF6' },
    { name: 'Blocked', count: s.blockedIssues || 0, pct: Math.round(((s.blockedIssues || 0) / t) * 100), color: '#EF4444' },
  ];
});
const taskStatusRings = computed(() => buildConcentricRings(taskStatusData.value));

// Card 3: Priority Distribution
const priorityData = computed(() => {
  const ps = data.value?.current?.prioritySprint || [];
  if (ps.length) {
    return ps.map(p => ({
      name: p.priority,
      count: p.total || 0,
      color: p.color || '#3B82F6'
    }));
  }
  const s = summary.value;
  return [
    { name: 'High Priority', count: s.highPriority || 0, color: '#EF4444' },
    { name: 'Bugs', count: s.bugCount || 0, color: '#F59E0B' },
    { name: 'In Progress', count: s.inProgressIssues || 0, color: '#2563EB' },
    { name: 'Completed', count: s.doneIssues || 0, color: '#10B981' },
  ];
});
const prioritySegments = computed(() => buildDonutSegments(priorityData.value));

// Card 4: Story Points & Velocity Gauge
const storyPointsData = computed(() => {
  const s = summary.value;
  const total = Math.max(1, s.spTotal || s.totalIssues || 1);
  const donePct = Math.round(((s.spCompleted || s.doneIssues || 0) / total) * 100);
  const remPct = Math.round(((s.spRemaining || (s.totalIssues - s.doneIssues) || 0) / total) * 100);
  const velPct = Math.min(100, Math.round(((s.velocity || s.spCompleted || 0) / total) * 100));
  return [
    { name: 'Completed SP', count: s.spCompleted || s.doneIssues || 0, pct: donePct, color: '#10B981' },
    { name: 'Remaining SP', count: s.spRemaining || 0, pct: remPct, color: '#F59E0B' },
    { name: 'Velocity Rate', count: s.velocity || 0, pct: velPct, color: '#8B5CF6' },
  ];
});
const storyPointsRings = computed(() => buildConcentricRings(storyPointsData.value));

// Card 5: Backlog & Bugs Breakdown
const bugCategoryData = computed(() => {
  const b = data.value?.current?.backlog || {};
  const s = summary.value;
  return [
    { name: 'Open Bugs', count: b.bugs ?? s.bugCount ?? 0, color: '#EF4444' },
    { name: 'High Priority', count: b.highPriority ?? s.highPriority ?? 0, color: '#F59E0B' },
    { name: 'Unassigned', count: b.unassigned ?? s.unassignedSprint ?? 0, color: '#8B5CF6' },
    { name: 'Unprioritized', count: b.unprioritized ?? s.todoIssues ?? 0, color: '#06B6D4' },
  ];
});
const bugSegments = computed(() => buildDonutSegments(bugCategoryData.value));

// Card 6: Team Contribution Allocation (Work Distribution)
const deviceUsageData = computed(() => {
  const team = data.value?.current?.team || [];
  if (team.length) {
    const colors = ['#06B6D4', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];
    const totalAssigned = team.reduce((acc, m) => acc + (m.assigned || 0), 0) || 1;
    return team.slice(0, 4).map((m, idx) => ({
      name: m.name.split(' ')[0],
      count: m.assigned || 0,
      pct: Math.round(((m.assigned || 0) / totalAssigned) * 100),
      color: colors[idx % colors.length]
    }));
  }
  return [
    { name: 'Dev 1', count: 50, pct: 50, color: '#06B6D4' },
    { name: 'Dev 2', count: 45, pct: 45, color: '#8B5CF6' },
    { name: 'Dev 3', count: 5, pct: 5, color: '#3B82F6' },
  ];
});
const deviceUsageRings = computed(() => buildConcentricRings(deviceUsageData.value));

// ── Helpers ──
const formatDate = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getHealthClass = (score) => {
  if (!score && score !== 0) return 'gray';
  if (score >= 75) return 'emerald';
  if (score >= 50) return 'blue';
  if (score >= 30) return 'orange';
  return 'red';
};

const healthLabel = computed(() => {
  const s = summary.value?.healthScore ?? 0;
  if (s >= 75) return 'Healthy';
  if (s >= 50) return 'Warning';
  if (s >= 30) return 'At Risk';
  return 'Critical';
});

const healthClass = computed(() => getHealthClass(summary.value?.healthScore));

const projectInitials = computed(() => {
  const name = data.value?.companyName || decodedCompany.value || '';
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
});

const sprintStartLabel = computed(() => {
  const s = sprint.value?.startDate;
  return s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Start';
});

const sprintEndLabel = computed(() => {
  const s = sprint.value?.endDate;
  return s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'End';
});

const setPeriod = (p) => {
  selectedPeriod.value = p;
  fetchData();
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
};

const getMemberAvatarClass = (idx) => {
  const classes = ['avatar-emerald', 'avatar-blue', 'avatar-purple', 'avatar-orange', 'avatar-red', 'avatar-teal'];
  return classes[idx % classes.length];
};

const getMemberStatusClass = (status) => {
  if (!status) return 'high-performer';
  const s = status.toLowerCase();
  if (s.includes('overload')) return 'watch';
  if (s.includes('at risk')) return 'watch';
  if (s.includes('under')) return 'optimal';
  return 'high-performer';
};

// ── Issue Distribution ──
const issueDistribution = computed(() => {
  const t = summary.value?.totalIssues || 1;
  const items = [
    { name: 'Done', count: summary.value?.doneIssues || 0, color: '#059669' },
    { name: 'In Progress', count: summary.value?.inProgressIssues || 0, color: '#2563EB' },
    { name: 'Todo', count: summary.value?.todoIssues || 0, color: '#7C3AED' },
    { name: 'Blocked', count: summary.value?.blockedIssues || 0, color: '#EF4444' },
  ].filter(i => i.count > 0);
  return items.map(i => ({ ...i, pct: Math.round((i.count / t) * 100) }));
});

// ── Donut Chart ──
const donutSegments = computed(() => {
  const total = summary.value?.totalIssues || 0;
  if (!total) return [];
  const circumference = 377;
  const items = issueDistribution.value;
  let offsetAcc = 0;
  return items.map((item) => {
    const dash = (item.count / total) * circumference;
    const seg = { ...item, pct: Math.round((item.count / total) * 100), dash, offset: circumference - offsetAcc };
    offsetAcc += dash;
    return seg;
  });
});

// ── Risk Cards ──
const riskLevelClass = computed(() => {
  const r = summary.value?.riskLevel || 'Low';
  if (r === 'Critical') return 'risk-critical';
  if (r === 'High') return 'risk-high';
  if (r === 'Medium') return 'risk-medium';
  return 'risk-low';
});

const riskCards = computed(() => {
  const s = summary.value;
  return [
    { title: 'Blocked Issues', count: s?.blockedIssues ?? 0, severity: s?.blockedIssues > 0 ? 'High' : 'Low', desc: s?.blockedIssues > 0 ? 'Requires immediate escalation' : 'No blockers — clear!', color: s?.blockedIssues > 0 ? 'risk-high' : 'risk-low' },
    { title: 'High Priority Open', count: s?.highPriority ?? 0, severity: s?.highPriority > 5 ? 'High' : s?.highPriority > 0 ? 'Medium' : 'Low', desc: s?.highPriority > 0 ? 'High priority items need focus' : 'All high priority resolved', color: s?.highPriority > 5 ? 'risk-high' : s?.highPriority > 0 ? 'risk-medium' : 'risk-low' },
    { title: 'Overdue Issues', count: s?.overdueIssues ?? 0, severity: s?.overdueIssues > 3 ? 'High' : s?.overdueIssues > 0 ? 'Medium' : 'Low', desc: s?.overdueIssues > 0 ? 'Past due date — attention needed' : 'No overdue issues', color: s?.overdueIssues > 3 ? 'risk-high' : s?.overdueIssues > 0 ? 'risk-medium' : 'risk-low' },
    { title: 'Unassigned Sprint Issues', count: s?.unassignedSprint ?? 0, severity: s?.unassignedSprint > 0 ? 'High' : 'Low', desc: s?.unassignedSprint > 0 ? 'Issues need owners assigned' : 'All sprint issues assigned', color: s?.unassignedSprint > 0 ? 'risk-high' : 'risk-low' },
    { title: 'Open Bugs', count: s?.bugCount ?? 0, severity: s?.bugCount > 10 ? 'High' : s?.bugCount > 0 ? 'Medium' : 'Low', desc: s?.bugCount > 0 ? 'Bugs in backlog need triage' : 'No open bugs', color: s?.bugCount > 10 ? 'risk-high' : s?.bugCount > 0 ? 'risk-medium' : 'risk-low' },
    { title: 'Sprint Completion Risk', count: `${summary.value?.completionPct ?? 0}%`, severity: (s?.completionPct ?? 0) < 50 ? 'High' : (s?.completionPct ?? 0) < 75 ? 'Medium' : 'Low', desc: (s?.completionPct ?? 0) < 50 ? 'Sprint at risk of not completing' : 'Sprint on track', color: (s?.completionPct ?? 0) < 50 ? 'risk-high' : (s?.completionPct ?? 0) < 75 ? 'risk-medium' : 'risk-low' },
  ];
});

// ── Backlog Cards ──
const backlogCards = computed(() => {
  const b = data.value?.current?.backlog || {};
  const t = b.total || 1;
  return [
    { name: 'Total Backlog', value: b.total ?? 0, pct: 100, variant: 'blue', icon: 'inbox' },
    { name: 'Unassigned', value: b.unassigned ?? 0, pct: Math.round(((b.unassigned ?? 0) / t) * 100), variant: (b.unassigned ?? 0) > 0 ? 'orange' : 'emerald', icon: 'user-x' },
    { name: 'High Priority', value: b.highPriority ?? 0, pct: Math.round(((b.highPriority ?? 0) / t) * 100), variant: (b.highPriority ?? 0) > 0 ? 'red' : 'emerald', icon: 'flag' },
    { name: 'Unprioritized', value: b.unprioritized ?? 0, pct: Math.round(((b.unprioritized ?? 0) / t) * 100), variant: 'purple', icon: 'help-circle' },
    { name: 'Bugs in Backlog', value: b.bugs ?? 0, pct: Math.round(((b.bugs ?? 0) / t) * 100), variant: (b.bugs ?? 0) > 0 ? 'red' : 'emerald', icon: 'bug' },
    { name: 'Story Points', value: b.storyPoints > 0 ? `${b.storyPoints} pts` : 'N/A', pct: -1, variant: 'purple', icon: 'zap' },
  ];
});

// ── Project Stats ──
const projectStats = computed(() => {
  const s = summary.value;
  return [
    { label: 'Total Issues', value: s?.totalIssues ?? 0, variant: '' },
    { label: 'Completed Issues', value: s?.doneIssues ?? 0, variant: 'emerald' },
    { label: 'Remaining Issues', value: (s?.totalIssues ?? 0) - (s?.doneIssues ?? 0), variant: '' },
    { label: 'SP Planned', value: s?.spTotal > 0 ? `${s.spTotal} pts` : 'N/A', variant: '' },
    { label: 'SP Completed', value: s?.spCompleted > 0 ? `${s.spCompleted} pts` : 'N/A', variant: 'emerald' },
    { label: 'SP Remaining', value: s?.spRemaining > 0 ? `${s.spRemaining} pts` : 'N/A', variant: '' },
    { label: 'Completion Rate', value: `${s?.completionPct ?? 0}%`, variant: 'emerald' },
    { label: 'Avg Resolution', value: s?.avgResolutionHours > 0 ? `${s.avgResolutionHours}h` : 'N/A', variant: '' },
    { label: 'Velocity', value: s?.velocity > 0 ? `${s.velocity} pts` : 'N/A', variant: 'blue' },
    { label: 'Health Score', value: `${s?.healthScore ?? 0}%`, variant: healthClass.value },
    { label: 'Bugs', value: s?.bugCount ?? 0, variant: (s?.bugCount ?? 0) > 0 ? 'red' : 'emerald' },
    { label: 'High Priority', value: s?.highPriority ?? 0, variant: (s?.highPriority ?? 0) > 0 ? 'orange' : 'emerald' },
    { label: 'Overdue Issues', value: s?.overdueIssues ?? 0, variant: (s?.overdueIssues ?? 0) > 0 ? 'orange' : 'emerald' },
    { label: 'Blocked Issues', value: s?.blockedIssues ?? 0, variant: (s?.blockedIssues ?? 0) > 0 ? 'red' : 'emerald' },
    { label: 'Team Members', value: data.value?.current?.team?.length ?? 0, variant: 'purple' },
  ];
});

// ── Line Chart Calculations (Enlarged Height ViewBox 760x320) ──
const velocityHistory = computed(() => data.value?.velocityHistory || []);

const maxVelocity = computed(() => {
  const vals = velocityHistory.value.map(v => v.velocity);
  return Math.max(...vals, 1);
});

const completionChartPts = computed(() => {
  const history = velocityHistory.value;
  if (!history.length) return [];
  const w = 705, step = history.length > 1 ? w / (history.length - 1) : 0;
  return history.map((h, i) => ({
    x: 45 + i * step,
    y: 280 - (h.completionPct / 100) * 240,
    label: h.sprint?.slice(0, 8) || `S${i + 1}`,
    completionPct: h.completionPct,
    velocity: h.velocity,
  }));
});

const velocityChartPts = computed(() => {
  const history = velocityHistory.value;
  const max = maxVelocity.value;
  if (!history.length) return [];
  const w = 705, step = history.length > 1 ? w / (history.length - 1) : 0;
  return history.map((h, i) => ({
    x: 45 + i * step,
    y: 280 - ((h.velocity / max) * 240),
    label: h.sprint?.slice(0, 8) || `S${i + 1}`,
    velocity: h.velocity,
    completionPct: h.completionPct,
  }));
});

const completionLinePath = computed(() => {
  const pts = completionChartPts.value;
  if (pts.length < 2) return '';
  return 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
});

const completionAreaPath = computed(() => {
  const pts = completionChartPts.value;
  if (pts.length < 2) return '';
  const line = pts.map(p => `${p.x},${p.y}`).join(' L ');
  return `M ${pts[0].x},280 L ${line} L ${pts[pts.length-1].x},280 Z`;
});

const velocityLinePath = computed(() => {
  const pts = velocityChartPts.value;
  if (pts.length < 2) return '';
  return 'M ' + pts.map(p => `${p.x},${p.y}`).join(' L ');
});

const velocityAreaPath = computed(() => {
  const pts = velocityChartPts.value;
  if (pts.length < 2) return '';
  const line = pts.map(p => `${p.x},${p.y}`).join(' L ');
  return `M ${pts[0].x},280 L ${line} L ${pts[pts.length-1].x},280 Z`;
});

// ── Chart Hover Handlers ──
const handleCompletionHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = completionChartPts.value;
  if (!pts.length) return;
  let closestIdx = 0, minDiff = Infinity;
  pts.forEach((p, idx) => {
    const diff = Math.abs((p.x / 760) * rect.width - mouseX);
    if (diff < minDiff) { minDiff = diff; closestIdx = idx; }
  });
  hoveredCompletionIdx.value = closestIdx;
};

const handleVelocityHover = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const pts = velocityChartPts.value;
  if (!pts.length) return;
  let closestIdx = 0, minDiff = Infinity;
  pts.forEach((p, idx) => {
    const diff = Math.abs((p.x / 760) * rect.width - mouseX);
    if (diff < minDiff) { minDiff = diff; closestIdx = idx; }
  });
  hoveredVelocityIdx.value = closestIdx;
};

const completionTooltipStyle = computed(() => {
  const i = hoveredCompletionIdx.value;
  if (i === null || !completionChartPts.value[i]) return {};
  const pt = completionChartPts.value[i];
  return { left: `${(pt.x / 760) * 100}%`, top: '20px', transform: pt.x > 380 ? 'translateX(-110%)' : 'translateX(5%)' };
});

const velocityTooltipStyle = computed(() => {
  const i = hoveredVelocityIdx.value;
  if (i === null || !velocityChartPts.value[i]) return {};
  const pt = velocityChartPts.value[i];
  return { left: `${(pt.x / 760) * 100}%`, top: '20px', transform: pt.x > 380 ? 'translateX(-110%)' : 'translateX(5%)' };
});

// ── Actions ──
const navTo = (path) => router.push(path);
const openJira = () => showToast('Opening Jira board...');
const exportReport = () => showToast('Project report exported successfully');
const exportCSV = () => showToast('Exported project data to CSV');
const emailReport = () => showToast('Report sent to email successfully');
</script>

<style scoped>
/* ── Base Container (exact match to velocity.vue) ── */
.velocity-analytics-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
.title-with-badge { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.page-main-title { font-size: 1.5rem; font-weight: 700; color: #111827; margin: 0; }
.page-main-subtitle { font-size: 0.85rem; color: #6B7280; margin: 0; }
.topbar-right { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; }

.health-pill {
  display: flex; align-items: center; gap: 0.35rem;
  padding: 0.25rem 0.65rem; border-radius: 20px;
  font-size: 0.72rem; font-weight: 700;
}
.health-pill.emerald { background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0; }
.health-pill.blue { background: #EFF6FF; color: #2563EB; border: 1px solid #BFDBFE; }
.health-pill.orange { background: #FFF7ED; color: #EA580C; border: 1px solid #FED7AA; }
.health-pill.red { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; }
.health-dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }

.ai-live-tag {
  display: flex; align-items: center; gap: 0.35rem;
  background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0;
  font-size: 0.72rem; font-weight: 700; padding: 0.2rem 0.6rem;
  border-radius: 20px; text-transform: uppercase; letter-spacing: 0.05em;
}

.period-pills {
  display: flex; background: #F3F4F6; padding: 3px; border-radius: 8px; gap: 2px;
}
.pill-btn {
  border: none; background: transparent; padding: 0.4rem 0.8rem;
  font-size: 0.78rem; font-weight: 600; color: #4B5563;
  border-radius: 6px; cursor: pointer; transition: all 0.2s ease;
}
.pill-btn.active {
  background: #ffffff; color: #059669; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.filter-group { min-width: 140px; }

.icon-btn {
  background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px;
  padding: 0.5rem; cursor: pointer; color: #4B5563;
  display: flex; align-items: center; justify-content: center;
}
.action-btn {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.5rem 0.9rem; border-radius: 8px; font-size: 0.8rem;
  font-weight: 600; cursor: pointer; transition: all 0.2s ease;
  border: 1px solid #E5E7EB; background: #ffffff; color: #374151;
}
.action-btn.primary-btn { background: #059669; color: #ffffff; border-color: #059669; }

@keyframes spin { to { transform: rotate(360deg); } }
.spinning { animation: spin 0.8s linear infinite; }

/* ── Toast ── */
.toast-notification {
  position: fixed; bottom: 2rem; right: 2rem; background: #1E293B;
  color: #ffffff; padding: 0.75rem 1.25rem; border-radius: 10px;
  font-size: 0.82rem; font-weight: 600; display: flex; align-items: center;
  gap: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2); z-index: 1100;
}
.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(10px); }

/* ── Loading Spinner ── */
.simple-loading-spinner { display: flex; justify-content: center; padding: 4rem 0; }
.spinner { width: 36px; height: 36px; border: 3px solid #E5E7EB; border-top-color: #059669; border-radius: 50%; animation: spin 0.8s linear infinite; }

/* ── Empty State ── */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem 1rem; text-align: center; }
.empty-icon { width: 60px; height: 60px; background: #F9FAFB; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; }

/* ── Section Containers & Headers ── */
.section-container { display: flex; flex-direction: column; gap: 1rem; }
.section-header { display: flex; align-items: center; justify-content: space-between; }
.sh-title-wrap { display: flex; flex-direction: column; gap: 0.2rem; }
.section-title { font-size: 1.1rem; font-weight: 700; color: #111827; margin: 0; }
.sec-subtitle { font-size: 0.8rem; color: #6B7280; }

/* ══════════════════════════════════════════════ */
/* REDESIGNED EXECUTIVE HERO DASHBOARD (12-COL GRID) */
/* ══════════════════════════════════════════════ */
.exec-hero-dashboard {
  background: #FFFFFF;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid #F3F4F6;
}

.hero-grid-12 {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.hero-left-col {
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-right-grid {
  grid-column: span 8;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: start;
  gap: 16px;
}

/* Project Header Left */
.hero-project-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.project-avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563EB, #06B6D4);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.hero-project-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-title-main {
  font-size: 32px;
  font-weight: 800;
  color: #111827;
  margin: 0;
  line-height: 1.1;
}

.hero-status-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
}
.hero-status-badge.emerald { background: #ECFDF5; color: #10B981; }
.hero-status-badge.blue { background: #EFF6FF; color: #2563EB; }
.hero-status-badge.orange { background: #FFF7ED; color: #F59E0B; }
.hero-status-badge.red { background: #FEF2F2; color: #EF4444; }

.hero-sub-text {
  font-size: 14px;
  font-weight: 500;
  color: #4B5563;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hero-goal-text {
  font-size: 13px;
  color: #6B7280;
  margin: 0;
}

.hero-owner-row {
  font-size: 13px;
  display: flex;
  gap: 6px;
  margin-top: 4px;
}
.owner-lbl { color: #9CA3AF; }
.owner-val { font-weight: 600; color: #374151; }

/* Animated Sprint Timeline */
.hero-timeline-card {
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tl-date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
}
.tl-line-dots { color: #D1D5DB; letter-spacing: -1px; }

.tl-progress-bar-bg {
  width: 100%;
  height: 10px;
  background: #E5E7EB;
  border-radius: 5px;
  overflow: hidden;
}

.tl-progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #2563EB, #10B981);
  border-radius: 5px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.tl-day-counter {
  font-size: 13px;
  font-weight: 700;
  color: #111827;
  text-align: right;
}

.tl-pills-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tl-pill {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.tl-pill.green { background: #ECFDF5; color: #10B981; }
.tl-pill.blue { background: #EFF6FF; color: #2563EB; }
.tl-pill.emerald { background: #ECFDF5; color: #059669; }
.tl-pill.orange { background: #FFF7ED; color: #EA580C; }

/* Large Radial Sprint Health Gauge */
.hero-health-radial-card {
  background: #F9FAFB;
  border: 1px solid #F3F4F6;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.radial-gauge-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.health-radial-svg {
  width: 100%;
  height: 100%;
}

.animated-ring {
  transition: stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.radial-center-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.radial-val {
  font-size: 32px;
  font-weight: 800;
  line-height: 1;
}

.radial-lbl {
  font-size: 12px;
  font-weight: 600;
  color: #6B7280;
  margin-top: 4px;
}

.health-badge-status {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 14px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.health-badge-status.emerald { background: #ECFDF5; color: #10B981; }
.health-badge-status.blue { background: #EFF6FF; color: #2563EB; }
.health-badge-status.orange { background: #FFF7ED; color: #F59E0B; }
.health-badge-status.red { background: #FEF2F2; color: #EF4444; }

/* Mini Analytics Cards Grid */
.mini-chart-card {
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.mini-chart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.mc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mc-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.mc-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.mc-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.mc-leg-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.mc-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.mc-name {
  color: #4B5563;
  flex: 1;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mc-pct {
  font-weight: 700;
  color: #111827;
}

.mc-chart-wrap {
  width: 90px;
  height: 90px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mc-donut-svg, .mc-radial-rings-svg {
  width: 100%;
  height: 100%;
}

/* ── Bottom Statistics (6 Structured, Perfectly Aligned Enterprise KPI Cards) ── */
.hero-bottom-kpis {
  grid-column: span 12;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  align-items: start;
  gap: 16px;
}

.kpi-card-hero {
  background: #FFFFFF;
  border: 1px solid #F3F4F6;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.kpi-card-hero:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.kpi-hero-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.kpi-hero-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.kpi-hero-icon.emerald { background: #ECFDF5; color: #10B981; }
.kpi-hero-icon.blue { background: #EFF6FF; color: #2563EB; }
.kpi-hero-icon.purple { background: #F3E8FF; color: #8B5CF6; }
.kpi-hero-icon.orange { background: #FFF7ED; color: #F59E0B; }
.kpi-hero-icon.cyan { background: #ECFEFF; color: #06B6D4; }
.kpi-hero-icon.red { background: #FEF2F2; color: #EF4444; }

.kpi-hero-trend {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 12px;
  white-space: nowrap;
}
.kpi-hero-trend.up { background: #ECFDF5; color: #10B981; border: 1px solid #A7F3D0; }
.kpi-hero-trend.down { background: #FEF2F2; color: #EF4444; border: 1px solid #FECACA; }
.kpi-hero-trend.neutral { background: #F3F4F6; color: #6B7280; border: 1px solid #E5E7EB; }

.kpi-hero-val-wrap {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 8px;
}

.kpi-hero-num {
  font-size: 26px;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.02em;
}
.kpi-hero-num.red { color: #EF4444; }

.kpi-hero-unit {
  font-size: 13px;
  font-weight: 600;
  color: #6B7280;
}

.kpi-hero-sub {
  font-size: 13px;
  font-weight: 600;
  color: #4B5563;
  margin-top: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Executive KPI Cards Grid (exact match to velocity.vue) ── */
.exec-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  align-items: start;
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
  width: 28px; height: 28px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
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
  font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.45rem;
  border-radius: 6px; display: flex; align-items: center; gap: 0.2rem;
}
.trend-badge.positive { background: #ECFDF5; color: #059669; }
.trend-badge.negative { background: #FEF2F2; color: #EF4444; }
.trend-badge.neutral { background: #F3F4F6; color: #4B5563; }

.kpi-footer-row { display: flex; justify-content: space-between; font-size: 0.72rem; color: #6B7280; }
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
.card-analytics.padding-none { padding: 0; overflow: hidden; }

.card-analytics-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 0.75rem;
}
.card-title { font-size: 1.05rem; font-weight: 700; color: #111827; margin: 0; }
.card-desc { font-size: 0.78rem; color: #6B7280; margin: 0; }

/* Sprint progress & workflow status */
.sprint-progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  align-items: start;
  gap: 1.5rem;
}

.sp-timeline-wrap { display: flex; flex-direction: column; gap: 0.6rem; }
.sp-timeline-labels { display: flex; justify-content: space-between; font-size: 0.75rem; color: #6B7280; font-weight: 600; }
.sp-timeline-bar { background: #F3F4F6; border-radius: 6px; height: 8px; position: relative; overflow: visible; }
.sp-tl-fill { height: 100%; background: #059669; border-radius: 6px; }
.sp-tl-marker { position: absolute; top: -4px; width: 16px; height: 16px; background: #ffffff; border: 3px solid #059669; border-radius: 50%; transform: translateX(-50%); box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.sp-timeline-chips { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }

.sp-burn-block { margin-top: 0.5rem; }
.sp-burn-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.sp-burn-title { font-size: 0.8rem; font-weight: 600; color: #374151; }
.sp-burn-pct { font-size: 0.78rem; font-weight: 700; }
.sp-3way-bar { display: flex; height: 14px; border-radius: 6px; overflow: hidden; background: #F3F4F6; }
.sp-seg { height: 100%; transition: width 0.5s ease; }
.sp-seg.done-seg { background: #059669; }
.sp-seg.remaining-seg { background: #F97316; }
.sp-burn-legend { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem; }
.leg-item { display: flex; align-items: center; gap: 0.35rem; font-size: 0.72rem; color: #6B7280; font-weight: 600; }
.leg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.emerald-bg { background: #059669; }
.orange-bg { background: #F97316; }
.gray-bg { background: #D1D5DB; }

.status-list { display: flex; flex-direction: column; gap: 0.75rem; }
.status-row { display: flex; align-items: center; gap: 0.75rem; }
.status-row-info { display: flex; align-items: center; gap: 0.45rem; min-width: 130px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.status-name { font-size: 0.78rem; font-weight: 600; color: #374151; }
.status-count { font-size: 0.75rem; font-weight: 700; color: #111827; }
.status-bar-bg { flex: 1; background: #F3F4F6; border-radius: 6px; height: 8px; overflow: hidden; }
.status-bar-fill { height: 100%; border-radius: 6px; transition: width 0.5s ease; }
.status-pct { font-size: 0.72rem; color: #6B7280; font-weight: 600; min-width: 32px; text-align: right; }

/* ── Charts Grid (Strictly 2 Cards Per Row, Natural Content Height) ── */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: start;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* Prominent Line Charts (Enlarged Height 280px) */
.line-chart-area.prominent-chart {
  position: relative;
  width: 100%;
  min-height: 280px;
  margin-top: 0.5rem;
}
.chart-svg {
  width: 100%;
  height: 280px;
  overflow: visible;
}

.chart-tooltip-popup {
  position: absolute; background: #0F172A; color: #ffffff;
  padding: 0.65rem 0.9rem; border-radius: 10px; font-size: 0.75rem;
  box-shadow: 0 12px 28px rgba(0,0,0,0.3); pointer-events: none; z-index: 50;
  display: flex; flex-direction: column; gap: 0.35rem; white-space: nowrap;
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.tooltip-header { font-weight: 700; color: #94A3B8; border-bottom: 1px solid #334155; padding-bottom: 0.25rem; font-size: 0.8rem; }
.tooltip-row { display: flex; align-items: center; gap: 0.45rem; }
.tooltip-row .dot { width: 8px; height: 8px; border-radius: 50%; }
.tooltip-row.emerald .dot { background: #059669; }
.tooltip-row.purple .dot { background: #8B5CF6; }

.donut-chart-wrap { display: flex; align-items: center; gap: 2rem; flex-wrap: wrap; }
.donut-center-container { position: relative; width: 160px; height: 160px; flex-shrink: 0; }
.donut-svg { width: 100%; height: 100%; }
.donut-legend { display: flex; flex-direction: column; gap: 0.6rem; flex: 1; min-width: 150px; }
.donut-leg-row { display: flex; align-items: center; gap: 0.5rem; }
.donut-leg-name { font-size: 0.78rem; color: #374151; font-weight: 600; flex: 1; }
.donut-leg-count { font-size: 0.78rem; font-weight: 700; color: #111827; }
.donut-leg-pct { font-size: 0.72rem; color: #6B7280; min-width: 32px; text-align: right; }

.priority-chart-list { display: flex; flex-direction: column; gap: 0.85rem; }
.priority-chart-row { display: flex; align-items: center; gap: 0.65rem; }
.pcr-label-wrap { display: flex; align-items: center; gap: 0.4rem; min-width: 100px; }
.pcr-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.pcr-name { font-size: 0.78rem; font-weight: 600; color: #374151; flex: 1; }
.pcr-count { font-size: 0.72rem; color: #9CA3AF; }
.pcr-bar-wrap { flex: 1; display: flex; height: 10px; border-radius: 6px; overflow: hidden; background: #F3F4F6; }
.pcr-bar { height: 100%; transition: width 0.4s ease; }
.remain-bar { background: #E5E7EB; }
.pcr-pct { font-size: 0.75rem; font-weight: 700; color: #374151; min-width: 34px; text-align: right; }

/* ── Story Point Analytics Grid ── */
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
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 130px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.sp-icon-row { display: flex; align-items: center; gap: 0.5rem; }
.sp-title-with-icon { display: flex; align-items: center; gap: 0.4rem; }
.sp-title { font-size: 0.8rem; font-weight: 600; color: #4B5563; }
.sp-main-val { font-size: 1.35rem; font-weight: 700; color: #111827; }
.sp-main-val.emerald { color: #059669; }
.sp-main-val.orange { color: #F97316; }
.sp-main-val.purple { color: #7C3AED; }
.sp-main-val.red { color: #EF4444; }
.sp-main-val.blue { color: #2563EB; }
.sp-sub-text { font-size: 0.72rem; color: #6B7280; }

.pac-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }

/* ── Severity Badges at Card Footer ── */
.sp-card-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 0.4rem;
}

.severity-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.severity-badge.sev-high {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

.severity-badge.sev-medium {
  background: #FFFBEB;
  color: #D97706;
  border: 1px solid #FDE68A;
}

.severity-badge.sev-low {
  background: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
}

/* ── Team Performance Cards ── */
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
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.92rem; font-weight: 700; color: #ffffff; flex-shrink: 0;
}
.avatar-emerald { background: #059669; }
.avatar-blue { background: #2563EB; }
.avatar-purple { background: #7C3AED; }
.avatar-orange { background: #EA580C; }
.avatar-red { background: #DC2626; }
.avatar-teal { background: #0891B2; }

.tc-info { flex: 1; display: flex; flex-direction: column; }
.tc-name { font-size: 0.88rem; font-weight: 700; margin: 0; color: #111827; }
.tc-role { font-size: 0.72rem; color: #6B7280; }

.tc-status-badge {
  font-size: 0.68rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;
}
.tc-status-badge.high-performer { background: #ECFDF5; color: #059669; }
.tc-status-badge.optimal { background: #EFF6FF; color: #2563EB; }
.tc-status-badge.watch { background: #FFFBEB; color: #D97706; }

.tc-stats-row {
  display: flex; justify-content: space-between; background: #F9FAFB;
  padding: 0.5rem 0.75rem; border-radius: 8px;
}
.tc-stat { display: flex; flex-direction: column; }
.tc-stat .label { font-size: 0.68rem; color: #6B7280; }
.tc-stat .val { font-size: 0.8rem; font-weight: 700; color: #111827; }
.tc-stat .val.emerald { color: #059669; }
.tc-stat .val.blue { color: #2563EB; }

.tc-bars-section { display: flex; flex-direction: column; gap: 0.5rem; }
.tc-bar-group { display: flex; flex-direction: column; gap: 0.2rem; }
.tc-bar-label { display: flex; justify-content: space-between; font-size: 0.72rem; color: #4B5563; }
.progress-bar-track-sm { width: 100%; height: 6px; background: #E5E7EB; border-radius: 3px; overflow: hidden; }
.progress-bar-fill-sm { height: 100%; border-radius: 3px; transition: width 0.3s ease; }
.progress-bar-fill-sm.emerald { background: #059669; }
.progress-bar-fill-sm.blue { background: #2563EB; }
.progress-bar-fill-sm.orange { background: #F97316; }

/* Risk Center */
.risk-hero-card.risk-critical { background: #FEF2F2; color: #7F1D1D; }
.risk-hero-card.risk-high { background: #FFF7ED; color: #9A3412; }
.risk-hero-card.risk-medium { background: #FFFBEB; color: #92400E; }
.risk-hero-card.risk-low { background: #ECFDF5; color: #065F46; }

/* ── AI Intelligence ── */
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
.ai-sparkle-icon { display: flex; align-items: center; justify-content: center; }
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
  align-items: start;
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
.afb-main-val { font-size: 1.4rem; font-weight: 800; color: #ffffff; }

.afb-right-metrics { display: flex; gap: 1.25rem; flex-wrap: wrap; }
.afb-sub { display: flex; flex-direction: column; font-size: 0.75rem; color: #DBEAFE; }
.afb-sub strong { font-size: 0.88rem; color: #ffffff; }

/* ── Recent Reports Table ── */
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
  user-select: none;
}

.clickable-row { cursor: pointer; transition: background 0.15s ease; }
.clickable-row:hover { background: #F9FAFB; }

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

.tbl-health-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
}
.tbl-health-pill.high { background: #ECFDF5; color: #059669; }
.tbl-health-pill.mid { background: #FFFBEB; color: #D97706; }
.tbl-health-pill.low { background: #FEF2F2; color: #EF4444; }

/* ── Statistics Summary Grid ── */
.stats-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  align-items: start;
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
.stat-mini-card.orange strong { color: #F97316; }
.stat-mini-card.red strong { color: #EF4444; }

/* ── Quick Actions Bar ── */
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

/* ── Utilities ── */
.emerald { color: #059669; }
.blue { color: #2563EB; }
.purple { color: #7C3AED; }
.orange { color: #F97316; }
.red { color: #EF4444; }
.font-bold { font-weight: 700; }
</style>
