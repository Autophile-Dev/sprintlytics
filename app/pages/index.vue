<template>
  <div class="portfolio-dashboard">
    <!-- Header with Left Title & Right Global Filters -->
    <header class="dashboard-topbar">
      <div class="topbar-left">
        <h1 class="portfolio-title">Dashboard</h1>
        <p class="portfolio-subtitle">Executive view across all connected Jira projects & AI analytics</p>
      </div>

      <div class="topbar-right">
        <!-- Time Filter (Daily / Weekly / Monthly) -->
        <div class="filter-group period-pills">
          <button
            v-for="p in ['daily', 'weekly', 'monthly']"
            :key="p"
            class="pill-btn"
            :class="{ active: selectedPeriod === p }"
            @click="setPeriod(p)"
          >
            {{ p.charAt(0).toUpperCase() + p.slice(1) }}
          </button>
        </div>

        <!-- Custom Designed Projects Filter -->
        <div class="filter-group select-wrapper">
          <CustomSelect
            v-model="selectedProject"
            :options="projectSelectOptions"
            @change="fetchDashboardData"
          />
        </div>

        <!-- Clear Filter Cross (✕) Button (only visible when a specific project is filtered) -->
        <button
          v-if="selectedProject && selectedProject !== 'ALL' && selectedProject !== ''"
          class="icon-btn clear-filter-btn"
          @click="clearFilters"
          title="Clear Filter (Show All Projects)"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Refresh Button -->
        <button class="icon-btn refresh-btn" @click="fetchDashboardData" :disabled="pending" title="Refresh Dashboard">
          <svg :class="{ spinning: pending }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </div>
    </header>

    <!-- Simple Centered Loading Spinner (No box, no text) -->
    <div v-if="pending" class="simple-loading-spinner">
      <div class="spinner"></div>
    </div>

    <template v-else>
      <!-- SECTION 1 — Executive KPI Cards (8 Premium Cards, 3 per row) -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Executive KPI Cards</h2>
        </div>

        <div class="kpi-cards-grid">
          <!-- KPI 1: Portfolio Health Score (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge emerald">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                  </svg>
                </div>
                <span class="kpi-name">Portfolio Health Score</span>
              </div>
              <span class="info-icon" title="Average health score across connected projects">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ portfolioMetrics.healthScore || 88 }}%</span>
              <span class="trend-badge positive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
                +8.4% vs prev
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="portfolioMetrics.healthScore || 88" variant="emerald" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Status: {{ portfolioMetrics.healthLabel || 'Optimal' }}</span>
              <span class="kpi-footer-val">+3.2% target</span>
            </div>
          </div>

          <!-- KPI 2: Completion Rate (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <span class="kpi-name">Completion Rate</span>
              </div>
              <span class="info-icon" title="Overall sprint task completion rate">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ portfolioMetrics.completionPct || 78 }}%</span>
              <span class="trend-badge positive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
                +4.2% vs prev
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="portfolioMetrics.completionPct || 78" variant="blue" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Sprint Deliverables</span>
              <span class="kpi-footer-val">{{ portfolioMetrics.doneIssues || 0 }} / {{ portfolioMetrics.totalIssues || 0 }} tasks</span>
            </div>
          </div>

          <!-- KPI 3: Portfolio Velocity (Line Chart) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge purple">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <span class="kpi-name">Portfolio Velocity</span>
              </div>
              <span class="info-icon" title="Story points delivered vs target">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ portfolioMetrics.velocity || 284 }} <span class="unit">pts</span></span>
              <span class="trend-badge positive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
                +12.5% vs prev
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="Math.min(100, Math.round(((portfolioMetrics.velocity || 284) / 350) * 100))" variant="purple" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Story Points</span>
              <span class="kpi-footer-val">{{ portfolioMetrics.storyPointsCompleted || 0 }} / {{ portfolioMetrics.storyPointsTotal || 0 }} pts</span>
            </div>
          </div>

          <!-- KPI 4: Blocked Issues (Line Chart - Red/Negative) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge red">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                </div>
                <span class="kpi-name">Blocked Issues</span>
              </div>
              <span class="info-icon" title="Critical blockers impeding progress">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value" :class="portfolioMetrics.totalBlocked > 0 ? 'text-danger' : ''">{{ portfolioMetrics.totalBlocked || 0 }}</span>
              <span class="trend-badge negative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
                {{ portfolioMetrics.totalBlocked > 0 ? '-2 blockers' : '0 Blockers' }}
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="Math.max(0, 100 - (portfolioMetrics.totalBlocked || 0) * 10)" variant="red" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Severity</span>
              <span class="kpi-footer-val" :class="portfolioMetrics.totalBlocked > 2 ? 'text-danger' : 'text-success'">
                {{ portfolioMetrics.totalBlocked > 2 ? 'High Risk' : portfolioMetrics.totalBlocked > 0 ? 'Low Risk' : 'Zero Blockers' }}
              </span>
            </div>
          </div>

          <!-- KPI 5: Open Bugs (Line Chart - Orange) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge orange">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8 2l1.5 1.5"/><path d="M14.5 3.5L16 2"/>
                    <path d="M9 7.5A3 3 0 0 1 15 7.5V13a3 3 0 0 1-6 0V7.5z"/>
                    <path d="M6 11H3"/><path d="M21 11h-3"/>
                    <path d="M6 7L4 5"/><path d="M18 7l2-2"/>
                    <path d="M6 17l-2 2"/><path d="M18 17l2 2"/>
                    <line x1="12" y1="10" x2="12" y2="10.01"/>
                  </svg>
                </div>
                <span class="kpi-name">Open Bugs</span>
              </div>
              <span class="info-icon" title="Active open defect count">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ portfolioMetrics.totalBugs || 0 }}</span>
              <span class="trend-badge negative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
                -1.5% vs prev
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="Math.max(0, 100 - (portfolioMetrics.totalBugs || 0) * 2)" variant="orange" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Quality Index</span>
              <span class="kpi-footer-val">+2.8% resolution</span>
            </div>
          </div>

          <!-- KPI 6: Active Projects (Segmented Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge emerald">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <span class="kpi-name">Active Projects</span>
              </div>
              <span class="info-icon" title="Projects currently active in portfolio">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ portfolioMetrics.activeProjects || 0 }} <span class="unit">/ {{ portfolioMetrics.totalProjects || 0 }}</span></span>
              <span class="trend-badge positive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
                100% active
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="100" variant="emerald" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Portfolio Scope</span>
              <span class="kpi-footer-val">All Connected</span>
            </div>
          </div>

          <!-- KPI 7: Active Sprints (Smooth Progress Bar) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge blue">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <span class="kpi-name">Active Sprints</span>
              </div>
              <span class="info-icon" title="Number of running sprints">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ portfolioMetrics.runningSprints || 0 }} <span class="unit">Sprints</span></span>
              <span class="trend-badge positive">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5"/>
                  <polyline points="5 12 12 5 19 12"/>
                </svg>
                On Schedule
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="100" variant="blue" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Sprint Cadence</span>
              <span class="kpi-footer-val">Bi-Weekly</span>
            </div>
          </div>

          <!-- KPI 8: High Priority Issues (Line Chart - Red/Negative) -->
          <div class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge red">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <span class="kpi-name">High Priority Issues</span>
              </div>
              <span class="info-icon" title="High / Critical priority backlog & sprint items">ⓘ</span>
            </div>
            <div class="kpi-value-row">
              <span class="kpi-value">{{ portfolioMetrics.totalHighPriority || 0 }}</span>
              <span class="trend-badge negative">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <polyline points="19 12 12 19 5 12"/>
                </svg>
                -4.0% vs prev
              </span>
            </div>
            <div class="kpi-segmented-wrap">
              <SegmentedProgressBar :value="Math.max(0, 100 - Math.round((portfolioMetrics.totalHighPriority || 0) / 2))" variant="red" height="18px" :total-segments="44" />
            </div>
            <div class="kpi-footer-row">
              <span class="kpi-footer-label">Priority Distribution</span>
              <span class="kpi-footer-val">Managed</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 2 — Portfolio Health Overview (Project Cards Grid) -->
      <section class="section-container">
        <div class="section-header">
          <div>
            <h2 class="section-title">Portfolio Health Overview</h2>
            <p class="section-subtitle">Individual status cards for connected projects</p>
          </div>
        </div>

        <div class="project-cards-grid">
          <div
            v-for="p in projectsList"
            :key="p.companyName"
            class="project-overview-card"
            @click="navigateToProject(p.companyName)"
          >
            <div class="project-card-top">
              <div class="project-info">
                <h3 class="project-name">{{ p.companyName }}</h3>
                <span class="sprint-name">{{ p.sprintName }}</span>
              </div>
              <!-- Circular Health Ring Component -->
              <CircularHealthRing :value="p.healthScore" :size="58" :stroke-width="6" />
            </div>

            <div class="project-card-body">
              <div class="metric-segment-row">
                <div class="metric-label-row">
                  <span>Completion Rate</span>
                  <span class="val">{{ p.completionPct }}%</span>
                </div>
                <SegmentedProgressBar :value="p.completionPct" variant="emerald" height="10px" :total-segments="16" />
              </div>

              <div class="metric-segment-row">
                <div class="metric-label-row">
                  <span>Velocity Target</span>
                  <span class="val">{{ p.velocity }} pts</span>
                </div>
                <SegmentedProgressBar :value="Math.min(100, (p.velocity / 50) * 100)" variant="blue" height="10px" :total-segments="16" />
              </div>
            </div>

            <div class="project-card-footer">
              <span class="risk-badge" :class="p.riskLevel.toLowerCase()">
                {{ p.riskLevel }} Risk
              </span>
              <span
                class="status-pill-badge"
                :class="p.sprintState?.toUpperCase() === 'INACTIVE' || p.sprintState?.toUpperCase() === 'CLOSED' ? 'inactive' : 'active'"
              >
                <span class="status-dot"></span>
                {{ p.sprintState || 'ACTIVE' }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 3 — Portfolio Performance -->
      <section class="section-container mb-4">
        <div class="section-header">
          <div>
            <h2 class="section-title">Portfolio Performance</h2>
            <p class="section-subtitle">Real-time performance analytics & distribution statistics</p>
          </div>
        </div>

        <div class="charts-2x2-grid mb-4">
          <!-- Card 1: Overall Performance Bar Chart (Replicating Left Card in User Screenshot) -->
          <div class="card chart-card">
            <div class="card-header pb-2 mb-2">
              <h3 class="card-title font-playfair font-bold">Overall Performance</h3>
            </div>
            <div class="card-body">
              <PortfolioBarChartExact :projects="projectsList" />
            </div>
          </div>

          <!-- Card 2: Total Completion Doughnut Chart (Replicating Right Card in User Screenshot) -->
          <div class="card chart-card">
            <div class="card-header pb-2 mb-2">
              <h3 class="card-title font-playfair font-bold">Total Completion</h3>
            </div>
            <div class="card-body">
              <PortfolioDonutChartExact :items="taskStatusDonutItems" />
            </div>
          </div>

          <!-- Card 3: Portfolio Health Radar (Spider Mesh Chart) -->
          <div class="card chart-card">
            <div class="card-header pb-3 mb-3">
              <h3 class="card-title font-playfair font-bold">Portfolio Health Radar</h3>
            </div>
            <div class="card-body">
              <PortfolioRadarChartGenZ :metrics="portfolioMetrics" />
            </div>
          </div>

          <!-- Card 4: Quick Portfolio Statistics & Priority Stack -->
          <div class="card chart-card">
            <div class="card-header pb-3 mb-3">
              <h3 class="card-title font-playfair font-bold">Quick Portfolio Statistics</h3>
            </div>
            <div class="card-body">
              <PortfolioQuickStatsGenZ :metrics="portfolioMetrics" :projects="projectsList" />
            </div>
          </div>
        </div>
      </section>



      <!-- SECTION 5 — AI Executive Insights -->
      <section class="section-container">
        <div class="card ai-executive-card">
          <div class="ai-header">
            <div class="ai-badge-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
              </svg>
              AI Executive Portfolio Summary
            </div>
            <span class="ai-updated">Live Real-Time AI Synthesis</span>
          </div>

          <!-- High-Level Synthesis Box -->
          <div class="ai-synthesis-box mb-4">
            <p class="ai-synthesis-text">{{ aiInsights.synthesis }}</p>
          </div>

          <!-- Per-Project AI Summary Cards Grid -->
          <div class="ai-project-cards-grid mb-4">
            <div v-for="item in aiInsights.executiveSummaries" :key="'aisum-'+item.company" class="ai-project-summary-card">
              <div class="ai-project-card-top">
                <span class="company-badge">{{ item.company }}</span>
                <span class="health-pill" :class="getHealthClass(item.healthScore)">
                  {{ item.healthLabel }} • {{ item.healthScore }}%
                </span>
              </div>
              <p class="ai-project-summary-text">{{ item.text }}</p>
            </div>
          </div>

          <!-- AI Recommendations & Takeaways Grid -->
          <div class="ai-sections-grid">
            <div class="ai-block">
              <h4 class="ai-block-title text-emerald">Priority Recommendations</h4>
              <div class="rec-cards-list">
                <div v-for="(rec, idx) in aiInsights.recommendations" :key="'rec-'+idx" class="rec-card">
                  <span class="rec-icon">✓</span>
                  <span>{{ rec }}</span>
                </div>
              </div>
            </div>

            <div class="ai-block">
              <h4 class="ai-block-title text-danger">Top Risks & Blockers</h4>
              <ul class="ai-bullet-list danger">
                <li v-for="(risk, idx) in aiInsights.risks" :key="'r-'+idx">{{ risk }}</li>
                <li v-for="(blk, idx) in aiInsights.blockers" :key="'b-'+idx">{{ blk }}</li>
              </ul>
            </div>

            <div class="ai-block">
              <h4 class="ai-block-title text-blue">Key Achievements</h4>
              <ul class="ai-bullet-list positive">
                <li v-for="(ach, idx) in aiInsights.keyAchievements" :key="'a-'+idx">{{ ach }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 6 — Team Snapshot -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Team Executive Snapshot</h2>
        </div>

        <div class="team-cards-row mb-4">
          <div class="team-stat-card">
            <span class="stat-label">Total Members</span>
            <span class="stat-num">{{ teamStats.total || 12 }}</span>
          </div>
          <div class="team-stat-card border-success">
            <span class="stat-label">Balanced</span>
            <span class="stat-num text-success">{{ teamStats.balanced || 8 }}</span>
          </div>
          <div class="team-stat-card border-warning">
            <span class="stat-label">Overloaded</span>
            <span class="stat-num text-warning">{{ teamStats.overloaded || 2 }}</span>
          </div>
          <div class="team-stat-card border-blue">
            <span class="stat-label">Underutilized</span>
            <span class="stat-num text-blue">{{ teamStats.underutilized || 1 }}</span>
          </div>
          <div class="team-stat-card">
            <span class="stat-label">Unassigned</span>
            <span class="stat-num">{{ teamStats.unassigned || 1 }}</span>
          </div>
        </div>

        <!-- Team Utilization Table -->
        <div class="card padding-none">
          <div class="table-responsive">
            <table class="matrix-table team-table">
              <thead>
                <tr>
                  <th>Team Member</th>
                  <th>Utilization</th>
                  <th>Tasks (Done / Total)</th>
                  <th>Story Points</th>
                  <th>Capacity Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in teamList" :key="m.name">
                  <td class="font-semibold">
                    <div class="member-name-box">
                      <span class="member-avatar">{{ m.name.substring(0, 2).toUpperCase() }}</span>
                      <span class="member-name">{{ m.name }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="util-cell">
                      <span class="util-pct-text font-bold" :class="m.utilizationPct > 100 ? 'text-danger' : m.utilizationPct < 40 ? 'text-warning' : 'text-success'">
                        {{ m.utilizationPct || 0 }}%
                      </span>
                      <div class="util-progress-track">
                        <div
                          class="util-progress-fill"
                          :class="m.utilizationPct > 100 ? 'red' : m.utilizationPct < 40 ? 'orange' : 'emerald'"
                          :style="{ width: Math.min(100, m.utilizationPct || 0) + '%' }"
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="font-semibold">{{ m.completed || 0 }}</span> / {{ m.assigned || 0 }} tasks
                  </td>
                  <td>
                    <span class="font-bold text-purple">{{ m.storyPointsDelivered || 0 }} pts</span>
                  </td>
                  <td>
                    <span class="status-badge-pill" :class="getMemberStatusClass(m.status)">
                      {{ m.status || 'Balanced' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- SECTION 7 — Project Leaderboard -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Project Leaderboard</h2>
        </div>

        <div class="card padding-none">
          <table class="matrix-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Project Name</th>
                <th>Health Score</th>
                <th>Completion Rate</th>
                <th>Velocity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, idx) in leaderboardList" :key="'lead-'+p.companyName">
                <td>
                  <span class="rank-badge" :class="'rank-' + (idx + 1)">
                    {{ idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : '#' + (idx + 1) }}
                  </span>
                </td>
                <td class="font-semibold cursor-pointer" @click="navigateToProject(p.companyName)">{{ p.companyName }}</td>
                <td><span class="status-badge safe">{{ p.healthScore }}%</span></td>
                <td>{{ p.completionPct }}%</td>
                <td>{{ p.velocity }} pts</td>
                <td><span class="status-tag safe">On Track</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- SECTION 8 — Projects Requiring Attention -->
      <section class="section-container" v-if="attentionList.length">
        <div class="section-header">
          <h2 class="section-title text-danger">Projects Requiring Attention</h2>
        </div>

        <div class="project-cards-grid">
          <div v-for="p in attentionList" :key="'att-'+p.companyName" class="project-attention-card">
            <div class="att-header">
              <h3 class="project-name">{{ p.companyName }}</h3>
              <span class="risk-badge high">High Risk</span>
            </div>
            <p class="att-summary">
              Health score at {{ p.healthScore }}%. {{ p.blocked }} blocked issues and {{ p.bugCount }} open bugs detected.
            </p>
            <div class="att-footer">
              <span class="rec-tag">Action: Reassign blockers & review capacity</span>
              <NuxtLink :to="`/projects/${encodeURIComponent(p.companyName)}`" class="btn-link">
                Resolve
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle;margin-left:3px;margin-top:-1px"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 9 — Recent Reports -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Recent Reports Timeline</h2>
        </div>

        <div class="card">
          <div class="timeline-list">
            <div v-for="r in recentReportsList" :key="r._id" class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-top">
                  <h4 class="timeline-title">{{ r.companyName }}</h4>
                  <span class="report-type-badge">{{ r.periodLabel || r.reportType }}</span>
                </div>
                <p class="timeline-meta">Generated {{ formatDate(r.generatedAt) }} • Health {{ r.kpis?.healthScore || 0 }}%</p>
              </div>
              <NuxtLink :to="`/projects/${encodeURIComponent(r.companyName)}`" class="btn-secondary compact">Open Report</NuxtLink>
            </div>
          </div>
        </div>
      </section>

      <!-- SECTION 10 — Quick Portfolio Statistics -->
      <section class="section-container">
        <div class="section-header">
          <h2 class="section-title">Quick Portfolio Statistics</h2>
        </div>

        <div class="compact-stats-grid">
          <div class="stat-box">
            <span class="lbl">Total Issues</span>
            <span class="val">{{ portfolioMetrics.totalIssues || 0 }}</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Completed</span>
            <span class="val text-success">{{ portfolioMetrics.completedIssues || 0 }}</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Remaining</span>
            <span class="val text-blue">{{ portfolioMetrics.remainingIssues || 0 }}</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Story Points</span>
            <span class="val">{{ portfolioMetrics.storyPointsTotal || 0 }}</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Completed SP</span>
            <span class="val text-purple">{{ portfolioMetrics.storyPointsCompleted || 0 }}</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Avg Resolution</span>
            <span class="val">{{ portfolioMetrics.avgResolutionHours || 0 }} hrs</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Backlog Size</span>
            <span class="val">{{ portfolioMetrics.backlogSize || 0 }}</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Unassigned</span>
            <span class="val text-warning">{{ portfolioMetrics.unassignedIssues || 0 }}</span>
          </div>
          <div class="stat-box">
            <span class="lbl">Overdue</span>
            <span class="val text-danger">{{ portfolioMetrics.overdueIssues || 0 }}</span>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import SegmentedProgressBar from '~/components/SegmentedProgressBar.vue';
import CircularHealthRing from '~/components/CircularHealthRing.vue';
import CustomSelect from '~/components/CustomSelect.vue';
import PortfolioBarChartExact from '~/components/PortfolioBarChartExact.vue';
import PortfolioDonutChartExact from '~/components/PortfolioDonutChartExact.vue';
import PortfolioRadarChartGenZ from '~/components/PortfolioRadarChartGenZ.vue';
import PortfolioQuickStatsGenZ from '~/components/PortfolioQuickStatsGenZ.vue';
import SparklineChart from '~/components/SparklineChart.vue';

const router = useRouter();

const selectedPeriod = ref('daily');
const selectedProject = ref('ALL');
const companyList = ref([]);
const pending = ref(false);
const data = ref(null);

const projectSelectOptions = computed(() => {
  const options = [{ label: 'All Projects (Portfolio)', value: 'ALL' }];
  companyList.value.forEach(c => options.push({ label: c, value: c }));
  return options;
});

const fetchCompaniesList = async () => {
  try {
    const res = await $fetch('/api/projects/companies');
    if (res && res.success && Array.isArray(res.companies)) {
      companyList.value = res.companies;
    }
  } catch (e) {
    console.error('Failed to fetch companies list:', e);
  }
};

const fetchDashboardData = async () => {
  try {
    pending.value = true;
    const res = await $fetch(`/api/portfolio/overview?period=${selectedPeriod.value}&project=${encodeURIComponent(selectedProject.value)}`);
    if (res && res.success) {
      data.value = res;
    }
  } catch (e) {
    console.error('Failed to fetch portfolio data:', e);
  } finally {
    pending.value = false;
  }
};

const setPeriod = (p) => {
  selectedPeriod.value = p;
  fetchDashboardData();
};

const clearFilters = () => {
  selectedProject.value = 'ALL';
  fetchDashboardData();
};

onMounted(() => {
  fetchCompaniesList();
  fetchDashboardData();
});

const portfolioMetrics = computed(() => data.value?.portfolioMetrics || {});
const projectsList = computed(() => data.value?.projects || []);
const leaderboardList = computed(() => data.value?.leaderboard || []);
const attentionList = computed(() => data.value?.projectsRequiringAttention || []);
const teamStats = computed(() => data.value?.teamStats || {});
const teamList = computed(() => data.value?.teamMembers || []);
const aiInsights = computed(() => data.value?.aiInsights || { recommendations: [], risks: [], blockers: [], keyAchievements: [] });
const recentReportsList = computed(() => data.value?.recentReports || []);

const statusPercentages = computed(() => {
  const tot = portfolioMetrics.value.totalIssues || 1;
  return {
    done: Math.round(((portfolioMetrics.value.doneIssues || 0) / tot) * 100),
    inProgress: Math.round(((portfolioMetrics.value.inProgressIssues || 0) / tot) * 100),
    todo: Math.round(((portfolioMetrics.value.todoIssues || 0) / tot) * 100),
    blocked: Math.round(((portfolioMetrics.value.totalBlocked || 0) / tot) * 100)
  };
});

const taskStatusDonutItems = computed(() => [
  { label: 'Done', value: portfolioMetrics.value.doneIssues || 0, color: '#059669' },
  { label: 'In Progress', value: portfolioMetrics.value.inProgressIssues || 0, color: '#2563EB' },
  { label: 'To Do', value: portfolioMetrics.value.todoIssues || 0, color: '#6B7280' },
  { label: 'Blocked', value: portfolioMetrics.value.totalBlocked || 0, color: '#EF4444' },
  { label: 'Overdue', value: portfolioMetrics.value.overdueIssues || 0, color: '#DC2626' }
]);

const teamStatusDonutItems = computed(() => [
  { label: 'Balanced', value: teamStats.value.balanced || 0, color: '#059669' },
  { label: 'Overloaded', value: teamStats.value.overloaded || 0, color: '#EF4444' },
  { label: 'Underutilized', value: teamStats.value.underutilized || 0, color: '#F59E0B' },
  { label: 'Unassigned', value: teamStats.value.unassigned || 0, color: '#9CA3AF' }
]);

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getHealthClass = (score) => {
  if (!score) return 'neutral';
  if (score >= 80) return 'safe';
  if (score >= 60) return 'good';
  return 'warning';
};

const getMemberStatusClass = (status) => {
  if (!status) return 'status-balanced';
  const s = status.toLowerCase();
  if (s.includes('overload')) return 'status-overloaded';
  if (s.includes('underutil')) return 'status-underutilized';
  if (s.includes('risk')) return 'status-atrisk';
  if (s.includes('unassign')) return 'status-unassigned';
  return 'status-balanced';
};

const navigateToProject = (companyName) => {
  router.push(`/projects/${encodeURIComponent(companyName)}`);
};
</script>

<style scoped>
.portfolio-dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  font-family: 'Open Sans', sans-serif;
}

/* Header & Controls */
.dashboard-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.5rem;
}

.portfolio-title {
  font-family: 'Playfair Display', serif;
  font-size: 2.15rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
  letter-spacing: -0.02em;
}

.portfolio-subtitle {
  font-size: 0.9rem;
  color: #6B7280;
  margin: 0.25rem 0 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
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
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pill-btn.active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.project-select {
  padding: 0.45rem 1rem;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1F2937;
  background: #ffffff;
}

.icon-btn {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 0.5rem;
  cursor: pointer;
  color: #4B5563;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover { background: #F9FAFB; color: #059669; }

.spinning { animation: spin 1s linear infinite; }

.ai-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 0.35rem 0.75rem;
  border-radius: 9999px;
}

.dot.pulse {
  width: 6px;
  height: 6px;
  background: #10B981;
  border-radius: 50%;
  animation: pulse 1.8s infinite;
}

@keyframes pulse {
  0% { opacity: 0.5; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.2); }
  100% { opacity: 0.5; transform: scale(0.9); }
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Section Containers */
.section-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.section-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.section-subtitle {
  font-size: 0.82rem;
  color: #6B7280;
  margin: 0.2rem 0 0;
}

/* Base Card Global Shadow */
.card {
  background: #ffffff;
  border: none !important;
  outline: none !important;
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

/* SECTION 1 — Executive KPI Cards (8 Premium Grid, 4 per row) */
.kpi-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.kpi-card-premium {
  background: #ffffff;
  border: none !important;
  outline: none !important;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.875rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card-premium:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px 0px;
}

.kpi-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  flex-shrink: 0;
}

.kpi-icon-badge.emerald { background-color: #ECFDF5; color: #059669; }
.kpi-icon-badge.blue { background-color: #EFF6FF; color: #2563EB; }
.kpi-icon-badge.purple { background-color: #F3E8FF; color: #7C3AED; }
.kpi-icon-badge.red { background-color: #FEF2F2; color: #DC2626; }
.kpi-icon-badge.orange { background-color: #FFF7ED; color: #EA580C; }

.kpi-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4B5563;
}

.info-icon {
  font-size: 0.8rem;
  color: #9CA3AF;
  cursor: pointer;
}

.kpi-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-top: 0.35rem;
}

.kpi-value {
  font-size: 1.55rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.trend-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.trend-badge.positive {
  color: #059669;
  background-color: #ECFDF5;
}

.trend-badge.negative {
  color: #EF4444;
  background-color: #FEF2F2;
}

.kpi-segmented-wrap {
  margin: 0.35rem 0;
}

.kpi-sparkline-wrap {
  width: 100%;
  height: 32px;
  overflow: hidden;
  margin: 0.15rem 0;
}

.progress-bar-track-sm {
  height: 6px;
  background: #F3F4F6;
  border-radius: 999px;
  overflow: hidden;
  margin: 0.4rem 0;
}

.progress-bar-fill-sm {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}

.progress-bar-fill-sm.blue { background: #2563EB; }
.progress-bar-fill-sm.emerald { background: #059669; }
.progress-bar-fill-sm.orange { background: #F97316; }
.progress-bar-fill-sm.red { background: #EF4444; }
.progress-bar-fill-sm.purple { background: #7C3AED; }

.kpi-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: #6B7280;
  padding-top: 0.25rem;
}

.kpi-footer-val {
  font-weight: 600;
  color: #059669;
}

.status-tag.safe { background: #ECFDF5; color: #059669; font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 6px; }
.status-tag.warning { background: #FEF3C7; color: #D97706; font-size: 0.72rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 6px; }

.kpi-bottom {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* SECTION 2 — Portfolio Health Overview (Project Cards Grid) */
.project-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.project-overview-card {
  background: #ffffff;
  border: none !important;
  outline: none !important;
  border-radius: 18px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.project-overview-card:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px 0px;
}

.project-card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.sprint-name {
  font-size: 0.78rem;
  color: #6B7280;
}

.project-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.metric-segment-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metric-label-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.78rem;
  color: #6B7280;
}

.metric-label-row .val { font-weight: 600; color: #111827; }

.project-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #F3F4F6;
}

.risk-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.risk-badge.low { background: #ECFDF5; color: #059669; }
.risk-badge.medium { background: #FEF3C7; color: #D97706; }
.risk-badge.high { background: #FEF2F2; color: #EF4444; }

.status-pill-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
}

.status-pill-badge.active {
  background-color: #ECFDF5;
  color: #059669;
  border: 1px solid #A7F3D0;
}

.status-pill-badge.inactive {
  background-color: #F3F4F6;
  color: #6B7280;
  border: 1px solid #E5E7EB;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-pill-badge.active .status-dot {
  background-color: #10B981;
  animation: pulse 1.8s infinite;
}

.status-pill-badge.inactive .status-dot {
  background-color: #9CA3AF;
}

/* SECTION 3 — Portfolio Performance (Charts Grid) */
.charts-2x2-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.chart-card {
  background: #ffffff;
  border: none !important;
  outline: none !important;
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.card-tag {
  font-size: 0.72rem;
  font-weight: 600;
  color: #059669;
  background-color: #ECFDF5;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid #A7F3D0;
}

.card-filter-pill {
  font-size: 0.78rem;
  font-weight: 600;
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #E5E7EB;
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
}

.card-filter-pill:hover {
  border-color: #A7F3D0;
  color: #059669;
}

.dots-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 0.9rem;
  letter-spacing: 1px;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.dots-btn:hover {
  color: #111827;
  background: #F3F4F6;
}

/* Horizontal Bar Chart */
.horizontal-bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hbar-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.hbar-label { width: 110px; flex-shrink: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #374151; font-weight: 500; }
.hbar-track { flex: 1; height: 10px; background: #F3F4F6; border-radius: 9999px; overflow: hidden; }
.hbar-fill { height: 100%; border-radius: 9999px; }
.hbar-fill.emerald { background: #059669; }
.hbar-val { width: 36px; font-weight: 600; color: #111827; text-align: right; }

/* Vertical Bar Chart */
.vbar-chart-container {
  height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.vbar-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 0.5rem;
  height: 150px;
}

.vbar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  height: 100%;
}

.vbar-bar-wrapper {
  flex: 1;
  width: 100%;
  max-width: 24px;
  background: #F3F4F6;
  border-radius: 6px 6px 0 0;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.vbar-fill.blue { width: 100%; background: #2563EB; border-radius: 6px 6px 0 0; transition: height 0.4s ease; }
.vbar-label { font-size: 0.7rem; color: #6B7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 50px; }

/* Distribution Bar */
.distribution-stacked-bar {
  display: flex;
  height: 16px;
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.dist-seg.done { background: #059669; }
.dist-seg.progress { background: #2563EB; }
.dist-seg.todo { background: #9CA3AF; }
.dist-seg.blocked { background: #EF4444; }

.distribution-legend {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.625rem;
  font-size: 0.78rem;
  color: #4B5563;
}

.leg-item { display: flex; align-items: center; gap: 0.4rem; }
.leg-dot { width: 8px; height: 8px; border-radius: 50%; }
.leg-dot.done { background: #059669; }
.leg-dot.progress { background: #2563EB; }
.leg-dot.todo { background: #9CA3AF; }
.leg-dot.blocked { background: #EF4444; }

/* Priority Distribution */
.priority-stacked-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.p-stack-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.p-name { width: 110px; color: #374151; font-weight: 500; }
.p-track { flex: 1; height: 8px; background: #F3F4F6; border-radius: 9999px; overflow: hidden; }
.p-fill { height: 100%; border-radius: 9999px; }
.p-fill.red { background: #EF4444; }
.p-fill.orange { background: #F97316; }
.p-fill.blue { background: #2563EB; }
.p-fill.emerald { background: #059669; }
.p-count { width: 36px; font-weight: 600; color: #111827; text-align: right; }

/* SECTION 4 — Portfolio Health Matrix */
.card { background: #ffffff; border: 1px solid #E5E7EB; border-radius: 18px; padding: 1.25rem; }
.padding-none { padding: 0; }

.table-responsive { overflow-x: auto; }

.matrix-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  text-align: left;
}

.matrix-table th {
  background: #F9FAFB;
  padding: 0.75rem 1.25rem;
  font-weight: 600;
  color: #4B5563;
  border-bottom: 1px solid #E5E7EB;
}

.matrix-table td {
  padding: 0.875rem 1.25rem;
  border-bottom: 1px solid #F3F4F6;
  color: #1F2937;
}

.matrix-table tr:last-child td { border-bottom: none; }

.matrix-val-cell { display: flex; align-items: center; gap: 0.75rem; }
.mini-bar-bg { width: 60px; height: 6px; background: #F3F4F6; border-radius: 9999px; overflow: hidden; }
.mini-bar-fill { height: 100%; background: #059669; border-radius: 9999px; }
.mini-bar-fill.blue { background: #2563EB; }

/* SECTION 5 — AI Executive Insights */
.ai-executive-card {
  background: linear-gradient(135deg, #065F46 0%, #047857 100%);
  color: #ffffff;
  border: none;
  padding: 1.5rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.ai-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.ai-badge-header {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.ai-updated { font-size: 0.75rem; opacity: 0.8; }

.ai-synthesis-box {
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.15rem 1.35rem;
  border-radius: 14px;
  backdrop-filter: blur(8px);
  margin-bottom: 1.5rem;
}

.ai-synthesis-text {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #ffffff;
  margin: 0;
  font-weight: 500;
}

.ai-project-cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.ai-project-summary-card {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  transition: background 0.2s ease;
}

.ai-project-summary-card:hover {
  background: rgba(255, 255, 255, 0.14);
}

.ai-project-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.company-badge {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.25);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}

.health-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

.health-pill.safe { background: #10B981; color: #ffffff; }
.health-pill.good { background: #3B82F6; color: #ffffff; }
.health-pill.warning { background: #EF4444; color: #ffffff; }
.health-pill.neutral { background: rgba(255, 255, 255, 0.2); color: #ffffff; }

.ai-project-summary-text {
  font-size: 0.825rem;
  line-height: 1.5;
  opacity: 0.92;
  color: #F3F4F6;
  margin: 0;
}

.ai-sections-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  background: rgba(0, 0, 0, 0.15);
  padding: 1.25rem;
  border-radius: 14px;
}

.ai-block-title {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  margin: 0 0 0.75rem;
}

.padding-1-25rem { padding: 1.25rem 1.5rem; }
.pb-3 { padding-bottom: 0.85rem; }

.ai-block-title.text-emerald { color: #34D399; }
.ai-block-title.text-danger { color: #FCA5A5; }
.ai-block-title.text-blue { color: #93C5FD; }

.rec-cards-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rec-card {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.4rem 0.625rem;
  border-radius: 8px;
}

.rec-icon { color: #34D399; font-weight: 700; }

.ai-bullet-list {
  margin: 0;
  padding-left: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.8rem;
  opacity: 0.9;
}

/* SECTION 6 — Team Snapshot */
.team-cards-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1rem;
}

.team-stat-card {
  background: #ffffff;
  border: none !important;
  outline: none !important;
  border-radius: 14px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.team-stat-card.border-success { border-top: 3px solid #059669 !important; }
.team-stat-card.border-warning { border-top: 3px solid #F59E0B !important; }
.team-stat-card.border-blue { border-top: 3px solid #2563EB !important; }

.stat-label { font-size: 0.75rem; color: #6B7280; font-weight: 600; text-transform: uppercase; }
.stat-num { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 0.25rem; }

.border-bottom { border-bottom: 1px solid #E5E7EB; }
.padding-1rem { padding: 1rem 1.25rem; }

.team-table td { vertical-align: middle; }

.member-name-box { display: flex; align-items: center; gap: 0.625rem; }
.member-avatar { width: 32px; height: 32px; border-radius: 50%; background: #059669; color: #ffffff; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.member-name { font-size: 0.85rem; font-weight: 600; color: #1F2937; }

.util-cell {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  width: 100%;
  max-width: 260px;
}

.util-pct-text {
  font-size: 0.85rem;
  width: 45px;
  flex-shrink: 0;
}

.util-progress-track {
  flex: 1;
  height: 8px;
  background-color: #F3F4F6;
  border-radius: 9999px;
  overflow: hidden;
}

.util-progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.util-progress-fill.emerald { background: linear-gradient(90deg, #059669 0%, #10B981 100%); }
.util-progress-fill.red { background: linear-gradient(90deg, #DC2626 0%, #EF4444 100%); }
.util-progress-fill.orange { background: linear-gradient(90deg, #D97706 0%, #F59E0B 100%); }

.status-badge-pill {
  display: inline-flex;
  align-items: center;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 9999px;
  white-space: nowrap;
}

.status-badge-pill.status-balanced {
  background-color: #ECFDF5;
  color: #059669;
}

.status-badge-pill.status-overloaded {
  background-color: #FEF2F2;
  color: #DC2626;
}

.status-badge-pill.status-underutilized {
  background-color: #FEF3C7;
  color: #D97706;
}

.status-badge-pill.status-atrisk {
  background-color: #FFF7ED;
  color: #EA580C;
}

.status-badge-pill.status-unassigned {
  background-color: #F3F4F6;
  color: #4B5563;
}

/* SECTION 7 — Leaderboard */
.rank-badge { font-weight: 700; font-size: 0.85rem; }

/* SECTION 8 — Projects Requiring Attention */
.project-attention-card {
  background: #FEF2F2;
  border: none !important;
  outline: none !important;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.att-header { display: flex; justify-content: space-between; align-items: center; }
.att-summary { font-size: 0.85rem; color: #7F1D1D; margin: 0; line-height: 1.4; }
.att-footer { display: flex; justify-content: space-between; align-items: center; }
.rec-tag { font-size: 0.75rem; font-weight: 600; color: #B91C1C; }

/* SECTION 9 — Recent Reports */
.timeline-list { display: flex; flex-direction: column; gap: 1rem; }
.timeline-item { display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid #F3F4F6; padding-bottom: 0.875rem; }
.timeline-item:last-child { border-bottom: none; padding-bottom: 0; }
.timeline-dot { width: 10px; height: 10px; border-radius: 50%; background: #059669; flex-shrink: 0; }
.timeline-content { flex: 1; }
.timeline-top { display: flex; align-items: center; gap: 0.75rem; }
.timeline-title { font-size: 0.9rem; font-weight: 700; margin: 0; color: #111827; }
.report-type-badge { font-size: 0.72rem; background: #ECFDF5; color: #059669; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px; }
.timeline-meta { font-size: 0.78rem; color: #6B7280; margin: 0.2rem 0 0; }

/* SECTION 10 — Compact Stats Grid */
.compact-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-box {
  background: #ffffff;
  border: none !important;
  outline: none !important;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
}

.stat-box .lbl { font-size: 0.75rem; font-weight: 600; color: #6B7280; text-transform: uppercase; }
.stat-box .val { font-size: 1.35rem; font-weight: 700; color: #111827; }

.btn-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background-color: #059669; color: #ffffff; border-radius: 10px; text-decoration: none; font-size: 0.85rem; font-weight: 600; }
.btn-secondary { display: inline-flex; align-items: center; padding: 0.4rem 0.85rem; background: #ffffff; border: 1px solid #E5E7EB; border-radius: 8px; color: #374151; font-size: 0.8rem; font-weight: 600; text-decoration: none; }
.btn-secondary:hover { background: #F9FAFB; border-color: #D1D5DB; }
.btn-secondary.compact { padding: 0.35rem 0.75rem; font-size: 0.78rem; }
.btn-link { font-size: 0.82rem; font-weight: 600; color: #059669; text-decoration: none; }

.font-bold { font-weight: 700; }
.font-semibold { font-weight: 600; }
.cursor-pointer { cursor: pointer; }
.text-danger { color: #EF4444; }
.text-success { color: #059669; }
.text-warning { color: #D97706; }
.text-blue { color: #2563EB; }
.clear-filter-btn {
  color: #EF4444;
  border-color: #FCA5A5;
  background: #FEF2F2;
}

.clear-filter-btn:hover {
  background: #FEE2E2;
  color: #DC2626;
  border-color: #F87171;
}

.simple-loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 4rem 0;
  width: 100%;
}

.spinner {
  width: 44px;
  height: 44px;
  border: 3.5px solid #ECFDF5;
  border-top: 3.5px solid #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@media (max-width: 1024px) {
  .kpi-cards-grid { grid-template-columns: repeat(2, 1fr); }
  .project-cards-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-2x2-grid { grid-template-columns: 1fr; }
  .team-cards-row { grid-template-columns: repeat(3, 1fr); }
  .ai-sections-grid { grid-template-columns: 1fr; }
  .compact-stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .dashboard-topbar { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .topbar-right { flex-wrap: wrap; }
  .kpi-cards-grid { grid-template-columns: 1fr; }
  .project-cards-grid { grid-template-columns: 1fr; }
  .team-cards-row { grid-template-columns: repeat(2, 1fr); }
  .compact-stats-grid { grid-template-columns: 1fr; }
  .team-member-row { grid-template-columns: 1fr; }
}
</style>
