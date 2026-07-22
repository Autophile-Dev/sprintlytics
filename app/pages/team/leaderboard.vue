<template>
  <div class="leaderboard-analytics-page">

    <!-- ── Global Filters Topbar ── -->
    <header class="va-topbar">
      <div class="topbar-left">
        <div class="title-with-badge">
          <h1 class="page-main-title">Team Leaderboard &amp; Hall of Fame</h1>
          <span class="ai-live-tag">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
            </svg>
            AI POWERED
          </span>
        </div>
        <p class="page-main-subtitle">Gamified engineering performance, MVP rankings, delivery metrics &amp; AI achievement analysis</p>
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
        <button class="icon-btn" @click="fetchData" :disabled="pending" title="Refresh Leaderboard">
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
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      </div>
      <h2>No Leaderboard Data Found</h2>
      <p>No performance records found for <strong>{{ selectedProject }}</strong>.</p>
    </div>

    <!-- ── MAIN CONTENT VIEW ── -->
    <template v-else>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 1 — Executive Overview (8 KPI Cards)  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Leaderboard Executive Overview</h2>
            <span class="sec-subtitle">Engineering velocity summary, MVP indicators &amp; overall team output</span>
          </div>
        </div>

        <div class="exec-kpi-grid">
          <div v-for="(kpi, key) in executiveKpis" :key="key" class="kpi-card-premium">
            <div class="kpi-header-row">
              <div class="kpi-title-with-icon">
                <div class="kpi-icon-badge" :class="kpi.variant">
                  <svg v-if="key === 'totalEngineers'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <svg v-else-if="key === 'mvpMember'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <svg v-else-if="key === 'totalSpDelivered'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                  <svg v-else-if="key === 'avgCompletionRate'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  <svg v-else-if="key === 'teamVelocityIndex'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  <svg v-else-if="key === 'outstandingDeliveryRatio'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
                  <svg v-else-if="key === 'atRiskMembersCount'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
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
      <!-- SECTION 2 — Podium Showcase (Top 3 Performers) -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Sprint Champions Podium</h2>
            <span class="sec-subtitle">Top 3 engineering performers based on Sprintlytics XP score</span>
          </div>
        </div>

        <div class="podium-grid">

          <!-- #2 Silver Podium Card -->
          <div v-if="data.podium?.silver" class="podium-card silver-podium" @click="openMemberProfile(data.podium.silver)">
            <div class="podium-rank-badge silver">
              <span>Rank #2</span>
            </div>
            <div class="podium-avatar-wrapper silver">
              <div class="podium-avatar">{{ getInitials(data.podium.silver.name) }}</div>
            </div>
            <h3 class="podium-name">{{ data.podium.silver.name }}</h3>
            <p class="podium-role">{{ data.podium.silver.role }}</p>
            <p class="podium-company">{{ data.podium.silver.companyName }}</p>

            <div class="podium-score-chip silver">
              <span class="score-num">{{ data.podium.silver.sprintlyticsScore }}</span>
              <span class="score-lbl">XP SCORE</span>
            </div>

            <div class="podium-metrics-list">
              <div class="pm-item">
                <span class="pm-label">Story Points</span>
                <span class="pm-val">{{ data.podium.silver.storyPointsDelivered }} SP</span>
              </div>
              <div class="pm-item">
                <span class="pm-label">Completion Rate</span>
                <span class="pm-val">{{ data.podium.silver.completionPct }}%</span>
              </div>
              <div class="pm-item">
                <span class="pm-label">Tasks Done</span>
                <span class="pm-val">{{ data.podium.silver.completed }}</span>
              </div>
            </div>

            <div class="podium-tags">
              <span class="p-tag" v-for="(s, idx) in (data.podium.silver.strengths || []).slice(0, 2)" :key="idx" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> {{ s }}
              </span>
            </div>
          </div>

          <!-- #1 Gold MVP Podium Card -->
          <div v-if="data.podium?.gold" class="podium-card gold-podium" @click="openMemberProfile(data.podium.gold)">
            <div class="crown-banner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#F59E0B" stroke="#D97706" stroke-width="1.5">
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/>
              </svg>
              <span>SPRINT MVP #1</span>
            </div>
            <div class="podium-rank-badge gold">
              <span>Gold Champion</span>
            </div>
            <div class="podium-avatar-wrapper gold">
              <div class="podium-avatar">{{ getInitials(data.podium.gold.name) }}</div>
            </div>
            <h3 class="podium-name">{{ data.podium.gold.name }}</h3>
            <p class="podium-role">{{ data.podium.gold.role }}</p>
            <p class="podium-company">{{ data.podium.gold.companyName }}</p>

            <div class="podium-score-chip gold">
              <span class="score-num">{{ data.podium.gold.sprintlyticsScore }}</span>
              <span class="score-lbl">XP SCORE</span>
            </div>

            <div class="podium-metrics-list">
              <div class="pm-item">
                <span class="pm-label">Story Points</span>
                <span class="pm-val">{{ data.podium.gold.storyPointsDelivered }} SP</span>
              </div>
              <div class="pm-item">
                <span class="pm-label">Completion Rate</span>
                <span class="pm-val">{{ data.podium.gold.completionPct }}%</span>
              </div>
              <div class="pm-item">
                <span class="pm-label">Tasks Done</span>
                <span class="pm-val">{{ data.podium.gold.completed }}</span>
              </div>
            </div>

            <div class="podium-tags">
              <span class="p-tag gold-tag" v-for="(s, idx) in (data.podium.gold.strengths || []).slice(0, 2)" :key="idx" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> {{ s }}
              </span>
            </div>
          </div>

          <!-- #3 Bronze Podium Card -->
          <div v-if="data.podium?.bronze" class="podium-card bronze-podium" @click="openMemberProfile(data.podium.bronze)">
            <div class="podium-rank-badge bronze">
              <span>Rank #3</span>
            </div>
            <div class="podium-avatar-wrapper bronze">
              <div class="podium-avatar">{{ getInitials(data.podium.bronze.name) }}</div>
            </div>
            <h3 class="podium-name">{{ data.podium.bronze.name }}</h3>
            <p class="podium-role">{{ data.podium.bronze.role }}</p>
            <p class="podium-company">{{ data.podium.bronze.companyName }}</p>

            <div class="podium-score-chip bronze">
              <span class="score-num">{{ data.podium.bronze.sprintlyticsScore }}</span>
              <span class="score-lbl">XP SCORE</span>
            </div>

            <div class="podium-metrics-list">
              <div class="pm-item">
                <span class="pm-label">Story Points</span>
                <span class="pm-val">{{ data.podium.bronze.storyPointsDelivered }} SP</span>
              </div>
              <div class="pm-item">
                <span class="pm-label">Completion Rate</span>
                <span class="pm-val">{{ data.podium.bronze.completionPct }}%</span>
              </div>
              <div class="pm-item">
                <span class="pm-label">Tasks Done</span>
                <span class="pm-val">{{ data.podium.bronze.completed }}</span>
              </div>
            </div>

            <div class="podium-tags">
              <span class="p-tag" v-for="(s, idx) in (data.podium.bronze.strengths || []).slice(0, 2)" :key="idx" style="display: inline-flex; align-items: center; gap: 0.3rem;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> {{ s }}
              </span>
            </div>
          </div>

        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 3 — Specialty Hall of Fame Badges      -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="section-header">
          <div class="sh-title-wrap">
            <h2 class="section-title">Specialty Hall of Fame Awards</h2>
            <span class="sec-subtitle">Recognizing exceptional engineering contributions across specialized dimensions</span>
          </div>
        </div>

        <div class="specialty-awards-grid">
          <div v-for="award in data.specialtyAwards" :key="award.id" class="award-card-premium" @click="openMemberProfileByName(award.winner)">
            <div class="award-header-row">
              <div class="award-badge-icon">{{ award.badge }}</div>
              <div class="award-info">
                <h4 class="award-title">{{ award.title }}</h4>
                <p class="award-desc">{{ award.description }}</p>
              </div>
            </div>

            <div class="award-winner-box">
              <div class="winner-avatar">{{ getInitials(award.winner) }}</div>
              <div class="winner-details">
                <div class="winner-name">{{ award.winner }}</div>
                <div class="winner-role">{{ award.winnerRole }} • {{ award.winnerCompany }}</div>
              </div>
              <div class="award-metric-pill">
                {{ award.metricValue }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 4 — Interactive Leaderboard Table      -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="card-analytics">

          <!-- Table Filter & Search Controls Header -->
          <div class="table-controls-header">
            <div class="tc-left">
              <h3 class="card-title">Engineering Rankings &amp; XP Standings</h3>
              <p class="card-desc">Detailed performance scorecard for all active project team members</p>
            </div>

            <div class="tc-right">
              <!-- Tier Filter Pills -->
              <div class="tier-pills">
                <button
                  v-for="t in ['ALL', 'S-Tier (Elite)', 'A-Tier (High Performer)', 'B-Tier (Solid Contributor)', 'Needs Support']"
                  :key="t"
                  class="t-pill-btn"
                  :class="{ active: selectedTier === t }"
                  @click="selectedTier = t"
                >
                  {{ t === 'ALL' ? 'All Tiers' : t.split(' ')[0] }}
                </button>
              </div>

              <!-- Search Input -->
              <div class="search-box">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search engineer or role..."
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <!-- Rankings Table -->
          <div class="table-responsive">
            <table class="leaderboard-table">
              <thead>
                <tr>
                  <th @click="toggleSort('rank')" class="sortable-th">
                    Rank
                    <span v-if="sortBy === 'rank'" class="sort-arrow">{{ sortDesc ? '↓' : '↑' }}</span>
                  </th>
                  <th>Engineer</th>
                  <th>Tier</th>
                  <th @click="toggleSort('sprintlyticsScore')" class="sortable-th text-right">
                    Sprintlytics Score
                    <span v-if="sortBy === 'sprintlyticsScore'" class="sort-arrow">{{ sortDesc ? '↓' : '↑' }}</span>
                  </th>
                  <th @click="toggleSort('storyPointsDelivered')" class="sortable-th text-right">
                    Story Points
                    <span v-if="sortBy === 'storyPointsDelivered'" class="sort-arrow">{{ sortDesc ? '↓' : '↑' }}</span>
                  </th>
                  <th @click="toggleSort('completionPct')" class="sortable-th text-right">
                    Completion %
                    <span v-if="sortBy === 'completionPct'" class="sort-arrow">{{ sortDesc ? '↓' : '↑' }}</span>
                  </th>
                  <th @click="toggleSort('completed')" class="sortable-th text-right">
                    Tasks Done
                    <span v-if="sortBy === 'completed'" class="sort-arrow">{{ sortDesc ? '↓' : '↑' }}</span>
                  </th>
                  <th>Utilization</th>
                  <th class="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="mem in filteredLeaderboard" :key="mem.id" class="lb-row">

                  <!-- Rank Cell -->
                  <td>
                    <div class="rank-cell">
                      <span v-if="mem.rank === 1" class="rank-medal gold">#1</span>
                      <span v-else-if="mem.rank === 2" class="rank-medal silver">#2</span>
                      <span v-else-if="mem.rank === 3" class="rank-medal bronze">#3</span>
                      <span v-else class="rank-num">#{{ mem.rank }}</span>
                    </div>
                  </td>

                  <!-- Engineer Info Cell -->
                  <td @click="openMemberProfile(mem)" class="clickable-cell">
                    <div class="eng-cell">
                      <div class="eng-avatar" :class="getAvatarClass(mem.rank)">
                        {{ getInitials(mem.name) }}
                      </div>
                      <div class="eng-details">
                        <div class="eng-name">{{ mem.name }}</div>
                        <div class="eng-meta">{{ mem.role }} • <span class="co-name">{{ mem.companyName }}</span></div>
                      </div>
                    </div>
                  </td>

                  <!-- Tier Pill -->
                  <td>
                    <span class="tier-badge" :class="getTierClass(mem.tier)">
                      {{ mem.tier }}
                    </span>
                  </td>

                  <!-- Sprintlytics Score -->
                  <td class="text-right">
                    <div class="score-progress-wrap">
                      <span class="score-val">{{ mem.sprintlyticsScore }} <small>XP</small></span>
                      <div class="mini-progress-bar">
                        <div class="mini-progress-fill" :style="{ width: `${mem.sprintlyticsScore}%`, backgroundColor: getScoreColor(mem.sprintlyticsScore) }"></div>
                      </div>
                    </div>
                  </td>

                  <!-- Story Points -->
                  <td class="text-right">
                    <span class="sp-badge">{{ mem.storyPointsDelivered }} / {{ mem.storyPointsAssigned }} SP</span>
                  </td>

                  <!-- Completion Rate -->
                  <td class="text-right">
                    <span class="comp-badge" :class="mem.completionPct >= 85 ? 'high' : mem.completionPct >= 70 ? 'mid' : 'low'">
                      {{ mem.completionPct }}%
                    </span>
                  </td>

                  <!-- Tasks Done -->
                  <td class="text-right font-medium">
                    {{ mem.completed }} / {{ mem.assigned }}
                  </td>

                  <!-- Utilization Status -->
                  <td>
                    <span class="status-pill" :class="getStatusClass(mem.status)">
                      {{ mem.status }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="text-center">
                    <button class="btn-detail primary" @click="openMemberProfile(mem)" title="View Details" style="display: inline-flex; align-items: center; gap: 0.35rem;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View Details
                    </button>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- ══════════════════════════════════════════════ -->
      <!-- SECTION 5 — AI Leaderboard Insights & Summary  -->
      <!-- ══════════════════════════════════════════════ -->
      <section class="section-container">
        <div class="ai-insights-card">
          <div class="ai-card-header">
            <div class="ai-badge-group">
              <span class="ai-spark-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              </span>
              <h3 class="ai-card-title">AI Performance &amp; Leaderboard Analytics</h3>
            </div>
            <span class="ai-tag-sm">GENERATED IN REAL TIME</span>
          </div>

          <div class="ai-headline-box">
            <h4>{{ data.aiSummary?.headline }}</h4>
          </div>

          <div class="ai-insights-grid">
            <div class="ai-col">
              <h5>Key Accomplishments</h5>
              <ul>
                <li v-for="(h, idx) in (data.aiSummary?.highlights || [])" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  <span>{{ h }}</span>
                </li>
              </ul>
            </div>

            <div class="ai-col">
              <h5>AI Recommendations</h5>
              <ul>
                <li v-for="(r, idx) in (data.aiSummary?.recommendations || [])" :key="idx">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  <span>{{ r }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

    </template>

    <!-- ══════════════════════════════════════════════ -->
    <!-- MODAL 1: Engineer Profile Detail Deep-Dive    -->
    <!-- ══════════════════════════════════════════════ -->
    <AppModal
      :show="showMemberModal"
      type="info"
      title="Engineer Performance Scorecard"
      @close="showMemberModal = false"
    >
      <div v-if="selectedMember" class="member-detail-container">
        <div class="md-header-card">
          <div class="md-avatar">{{ getInitials(selectedMember.name) }}</div>
          <div class="md-info">
            <h3>{{ selectedMember.name }}</h3>
            <p class="md-role">{{ selectedMember.role }} • {{ selectedMember.companyName }}</p>
            <p class="md-email">{{ selectedMember.email }}</p>
          </div>
          <div class="md-score-badge">
            <span class="md-score-num">#{{ selectedMember.rank }}</span>
            <span class="md-score-sub">{{ selectedMember.sprintlyticsScore }} XP</span>
          </div>
        </div>

        <div class="md-stats-row">
          <div class="md-stat-box">
            <span class="lbl">Story Points</span>
            <span class="val">{{ selectedMember.storyPointsDelivered }} / {{ selectedMember.storyPointsAssigned }} SP</span>
          </div>
          <div class="md-stat-box">
            <span class="lbl">Completion Rate</span>
            <span class="val">{{ selectedMember.completionPct }}%</span>
          </div>
          <div class="md-stat-box">
            <span class="lbl">Tasks Finished</span>
            <span class="val">{{ selectedMember.completed }} / {{ selectedMember.assigned }}</span>
          </div>
          <div class="md-stat-box">
            <span class="lbl">Utilization</span>
            <span class="val">{{ selectedMember.utilizationPct }}% ({{ selectedMember.status }})</span>
          </div>
        </div>

        <div class="md-section">
          <h4>Identified Core Strengths</h4>
          <ul class="md-list strengths">
            <li v-for="(s, idx) in selectedMember.strengths" :key="idx" style="display: flex; align-items: center; gap: 0.35rem;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>{{ s }}</span>
            </li>
          </ul>
        </div>

        <div class="modal-footer-nav">
          <button class="action-btn primary-btn" style="width:100%;justify-content:center;" @click="openMemberProfile(selectedMember)">
            Open Full Engineer Profile Page →
          </button>
        </div>
      </div>
    </AppModal>

    <!-- ══════════════════════════════════════════════ -->
    <!-- MODAL 2: Export Leaderboard Report             -->
    <!-- ══════════════════════════════════════════════ -->
    <AppModal
      :show="showReportModal"
      type="info"
      title="Export Leaderboard & Hall of Fame Report"
      @close="showReportModal = false"
    >
      <div class="export-modal-body">
        <p class="export-desc">Generate and download a comprehensive performance report for <strong>{{ selectedProject }}</strong> ({{ selectedPeriod.toUpperCase() }}).</p>

        <div class="form-group">
          <label class="form-label">Report Format</label>
          <select v-model="exportFormat" class="modal-input">
            <option value="PDF">Executive Leaderboard PDF Report</option>
            <option value="CSV">CSV Data Export</option>
            <option value="JSON">Detailed JSON Payload</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Recipient Email (Optional)</label>
          <input v-model="exportEmail" type="email" placeholder="manager@sprintlytics.com" class="modal-input" />
        </div>

        <div class="modal-actions-row">
          <button class="action-btn secondary-btn" @click="showReportModal = false">Cancel</button>
          <button class="action-btn primary-btn" @click="handleExportReport" :disabled="isExporting">
            {{ isExporting ? 'Generating Report...' : 'Download & Dispatch Report' }}
          </button>
        </div>
      </div>
    </AppModal>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// ── State Variables ────────────────────────────────────────────────────────
const selectedPeriod  = ref('daily');
const selectedProject = ref('ALL');
const selectedRange   = ref(10);
const selectedTier    = ref('ALL');

const searchQuery = ref('');
const sortBy      = ref('sprintlyticsScore');
const sortDesc    = ref(true);

const pending = ref(false);
const data    = ref(null);

const showMemberModal = ref(false);
const selectedMember  = ref(null);

const showReportModal = ref(false);
const exportFormat    = ref('PDF');
const exportEmail     = ref('');
const isExporting     = ref(false);

const toast = ref({ show: false, message: '', type: 'success' });

// ── Dropdown Options ────────────────────────────────────────────────────────
const projectOptions = computed(() => {
  const list = data.value?.projectsList || ['Barena ERP', 'DevOps Tasks', 'FLEXA ERP', 'Glow Box', 'Honda POC', 'IPOPS', 'Jom Smart Central', 'WONDERKIDS OT'];
  const opts = [{ label: 'All Projects', value: 'ALL' }];
  list.forEach(p => opts.push({ label: p, value: p }));
  return opts;
});

const executiveKpis = computed(() => data.value?.executiveKpis || {});

// ── Leaderboard Table Filtering & Sorting ──────────────────────────────────
const filteredLeaderboard = computed(() => {
  if (!data.value?.leaderboard) return [];
  let list = [...data.value.leaderboard];

  // Tier Filter
  if (selectedTier.value !== 'ALL') {
    list = list.filter(m => m.tier === selectedTier.value);
  }

  // Search Filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    list = list.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.companyName.toLowerCase().includes(q)
    );
  }

  // Sort
  list.sort((a, b) => {
    let valA = a[sortBy.value];
    let valB = b[sortBy.value];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortDesc.value ? 1 : -1;
    if (valA > valB) return sortDesc.value ? -1 : 1;
    return 0;
  });

  return list;
});

// ── Fetch Data ─────────────────────────────────────────────────────────────
const fetchData = async () => {
  pending.value = true;
  try {
    const res = await fetch(`/api/team/leaderboard?project=${encodeURIComponent(selectedProject.value)}&period=${selectedPeriod.value}&range=${selectedRange.value}`);
    const json = await res.json();
    if (json.success) {
      data.value = json;
    } else {
      showToast(json.error || 'Failed to fetch leaderboard data', 'error');
    }
  } catch (err) {
    showToast('Network error while fetching leaderboard', 'error');
  } finally {
    pending.value = false;
  }
};

const setPeriod = (p) => {
  selectedPeriod.value = p;
  fetchData();
};

const setRange = (r) => {
  selectedRange.value = r;
  fetchData();
};

const onProjectChange = () => {
  fetchData();
};

const toggleSort = (col) => {
  if (sortBy.value === col) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortBy.value = col;
    sortDesc.value = true;
  }
};

// ── Navigation to Full Profile Page ────────────────────────────────────────
const openMemberProfile = (member) => {
  if (!member) return;
  const targetId = member.id || member.name;
  router.push(`/team/member/${encodeURIComponent(targetId)}`);
};

const openMemberProfileByName = (name) => {
  if (!name) return;
  const found = data.value?.leaderboard?.find(m => m.name === name);
  const targetId = found ? found.id : name;
  router.push(`/team/member/${encodeURIComponent(targetId)}`);
};

// ── Modals & Actions ───────────────────────────────────────────────────────
const openMemberModal = (member) => {
  selectedMember.value = member;
  showMemberModal.value = true;
};

const openReportModal = () => {
  showReportModal.value = true;
};

const handleExportReport = () => {
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
    showReportModal.value = false;
    showToast(`Leaderboard report exported as ${exportFormat.value} successfully!`, 'success');
  }, 1200);
};

const showToast = (message, type = 'success') => {
  toast.value = { show: true, message, type };
  setTimeout(() => {
    toast.value.show = false;
  }, 3500);
};

// ── Helper Utilities ───────────────────────────────────────────────────────
const getInitials = (name) => {
  if (!name) return 'SE';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Jul 2026';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getAvatarClass = (rank) => {
  if (rank === 1) return 'gold-avatar';
  if (rank === 2) return 'silver-avatar';
  if (rank === 3) return 'bronze-avatar';
  return 'default-avatar';
};

const getTierClass = (tier) => {
  if (tier?.includes('S-Tier')) return 'tier-s';
  if (tier?.includes('A-Tier')) return 'tier-a';
  if (tier?.includes('B-Tier')) return 'tier-b';
  return 'tier-needs';
};

const getScoreColor = (score) => {
  if (score >= 88) return '#10B981';
  if (score >= 75) return '#2563EB';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
};

const getStatusClass = (status) => {
  if (status === 'Balanced') return 'status-balanced';
  if (status === 'Overloaded') return 'status-overloaded';
  if (status === 'Underutilized') return 'status-underutilized';
  if (status === 'At Risk') return 'status-at-risk';
  return 'status-default';
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
/* ── Page Layout ── */
.leaderboard-analytics-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

/* ── Global Topbar Header ── */
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

/* Period & Range Pills */
.period-pills, .range-pills, .tier-pills {
  display: flex;
  background: #F3F4F6;
  padding: 3px;
  border-radius: 8px;
  gap: 2px;
}

.pill-btn, .range-btn, .t-pill-btn {
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

.pill-btn.active, .range-btn.active, .t-pill-btn.active {
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
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
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

/* ── Toast Notification ── */
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

.toast-fade-enter-active, .toast-fade-leave-active { transition: all 0.3s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* ── Section Containers & Cards ── */
.section-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
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
.kpi-icon-badge.cyan { background: #ECFEFF; color: #0891B2; }
.kpi-icon-badge.amber { background: #FEF3C7; color: #D97706; }
.kpi-icon-badge.teal { background: #F0FDFA; color: #0D9488; }
.kpi-icon-badge.rose { background: #FEF2F2; color: #EF4444; }
.kpi-icon-badge.indigo { background: #EEF2FF; color: #4F46E5; }

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

.trend-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.trend-badge.positive { background: #ECFDF5; color: #059669; }
.trend-badge.negative { background: #FEF2F2; color: #EF4444; }
.trend-badge.neutral { background: #F3F4F6; color: #4B5563; }

/* ── Section 2: Podium Grid (Top 3 Performers) ── */
.podium-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  align-items: end;
}

@media (max-width: 900px) {
  .podium-grid { grid-template-columns: 1fr; }
}

.podium-card {
  background: #ffffff;
  border-radius: 14px;
  padding: 1.5rem;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  text-align: center;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
}

.podium-card:hover {
  transform: translateY(-4px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 10px 24px 0px;
}

.gold-podium {
  border: 2px solid #F59E0B;
  background: linear-gradient(180deg, #FFFBEB 0%, #FFFFFF 100%);
  padding-top: 2rem;
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.2);
}

.silver-podium {
  border: 1px solid #CBD5E1;
  background: linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);
}

.bronze-podium {
  border: 1px solid #F97316;
  background: linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 100%);
}

.crown-banner {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: #F59E0B;
  color: #ffffff;
  padding: 0.25rem 0.85rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 800;
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.3);
}

.podium-rank-badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.podium-rank-badge.gold { background: #FEF3C7; color: #D97706; }
.podium-rank-badge.silver { background: #F1F5F9; color: #475569; }
.podium-rank-badge.bronze { background: #FFEDD5; color: #C2410C; }

.podium-avatar-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin: 0 auto 0.75rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3px;
}

.podium-avatar-wrapper.gold { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
.podium-avatar-wrapper.silver { background: linear-gradient(135deg, #94A3B8 0%, #64748B 100%); }
.podium-avatar-wrapper.bronze { background: linear-gradient(135deg, #F97316 0%, #C2410C 100%); }

.podium-avatar {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: #1E293B;
}

.podium-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.podium-role {
  font-size: 0.8rem;
  color: #4B5563;
  margin: 0.1rem 0;
}

.podium-company {
  font-size: 0.72rem;
  color: #9CA3AF;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.85rem;
}

.podium-score-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.podium-score-chip.gold { background: #FEF3C7; color: #B45309; }
.podium-score-chip.silver { background: #F1F5F9; color: #334155; }
.podium-score-chip.bronze { background: #FFEDD5; color: #9A3412; }

.score-num { font-size: 1.5rem; font-weight: 800; line-height: 1; }
.score-lbl { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.05em; margin-top: 2px; }

.podium-metrics-list {
  display: flex;
  justify-content: space-around;
  padding: 0.75rem 0;
  border-top: 1px dashed #E5E7EB;
  border-bottom: 1px dashed #E5E7EB;
  margin-bottom: 0.75rem;
}

.pm-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pm-label { font-size: 0.68rem; color: #6B7280; }
.pm-val { font-size: 0.82rem; font-weight: 700; color: #111827; }

.podium-tags {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  text-align: left;
}

.p-tag {
  font-size: 0.72rem;
  color: #4B5563;
  background: #F3F4F6;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gold-tag { background: #FEF9C3; color: #854D0E; font-weight: 600; }

/* ── Section 3: Specialty Awards Grid ── */
.specialty-awards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.award-card-premium {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.15rem;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.award-card-premium:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px 0px;
}

.award-header-row {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.award-badge-icon {
  font-size: 1.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: #F9FAFB;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  flex-shrink: 0;
}

.award-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.1rem 0;
}

.award-desc {
  font-size: 0.75rem;
  color: #6B7280;
  margin: 0;
  line-height: 1.3;
}

.award-winner-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #F9FAFB;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid #F3F4F6;
}

.winner-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #059669;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.winner-details {
  flex: 1;
  min-width: 0;
}

.winner-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.winner-role {
  font-size: 0.68rem;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.award-metric-pill {
  padding: 0.2rem 0.5rem;
  background: #ECFDF5;
  color: #059669;
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 6px;
  white-space: nowrap;
}

/* ── Section 4: Card Analytics Table ── */
.card-analytics {
  background: #ffffff;
  border-radius: 14px;
  padding: 1.5rem;
  border: none;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 5px 15px 0px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.table-controls-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.card-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.15rem 0;
}

.card-desc {
  font-size: 0.78rem;
  color: #6B7280;
  margin: 0;
}

.tc-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  background: #ffffff;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 0.8rem;
  width: 180px;
  color: #111827;
}

.table-responsive {
  overflow-x: auto;
  border-radius: 8px;
}

.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.leaderboard-table th {
  padding: 0.85rem 1rem;
  background: #F9FAFB;
  color: #4B5563;
  font-weight: 600;
  border-bottom: 1px solid #E5E7EB;
  font-size: 0.8rem;
}

.sortable-th {
  cursor: pointer;
  user-select: none;
}

.sortable-th:hover { color: #111827; }

.sort-arrow {
  margin-left: 0.2rem;
  font-weight: 700;
  color: #059669;
}

.leaderboard-table td {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #F3F4F6;
  vertical-align: middle;
}

.lb-row:hover {
  background-color: #F9FAFB;
}

.clickable-cell {
  cursor: pointer;
}

.clickable-cell:hover .eng-name {
  color: #059669;
  text-decoration: underline;
}

.rank-cell {
  font-weight: 700;
  font-size: 0.9rem;
}

.rank-medal {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 800;
}

.rank-medal.gold { background: #FEF3C7; color: #D97706; }
.rank-medal.silver { background: #F1F5F9; color: #475569; }
.rank-medal.bronze { background: #FFEDD5; color: #C2410C; }

.rank-num { color: #6B7280; font-weight: 700; }

.eng-cell {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.eng-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  color: #ffffff;
  flex-shrink: 0;
}

.gold-avatar { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); }
.silver-avatar { background: linear-gradient(135deg, #94A3B8 0%, #64748B 100%); }
.bronze-avatar { background: linear-gradient(135deg, #F97316 0%, #C2410C 100%); }
.default-avatar { background: #059669; }

.eng-name { font-weight: 700; color: #111827; transition: color 0.15s ease; }
.eng-meta { font-size: 0.72rem; color: #6B7280; }
.co-name { font-weight: 600; color: #4B5563; }

.tier-badge {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
}

.tier-s { background: #ECFDF5; color: #047857; border: 1px solid #A7F3D0; }
.tier-a { background: #EFF6FF; color: #1D4ED8; border: 1px solid #BFDBFE; }
.tier-b { background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A; }
.tier-needs { background: #FEF2F2; color: #B91C1C; border: 1px solid #FECACA; }

.score-progress-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.score-val { font-size: 0.95rem; font-weight: 800; color: #111827; }
.score-val small { font-size: 0.65rem; color: #6B7280; font-weight: 600; }

.mini-progress-bar {
  width: 70px;
  height: 5px;
  background: #E5E7EB;
  border-radius: 9999px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s ease;
}

.sp-badge {
  font-size: 0.8rem;
  font-weight: 600;
  color: #111827;
  background: #F3F4F6;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
}

.comp-badge {
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
}

.comp-badge.high { background: #ECFDF5; color: #047857; }
.comp-badge.mid { background: #EFF6FF; color: #1D4ED8; }
.comp-badge.low { background: #FEF2F2; color: #B91C1C; }

.status-pill {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
}

.status-balanced { background: #ECFDF5; color: #047857; }
.status-overloaded { background: #FEF2F2; color: #B91C1C; }
.status-underutilized { background: #FEF3C7; color: #B45309; }
.status-at-risk { background: #FEE2E2; color: #991B1B; }

.btn-detail {
  padding: 0.4rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-detail.primary {
  background: #059669;
  color: #ffffff;
}

.btn-detail.primary:hover {
  background: #047857;
}

/* ── Section 5: AI Insights Card ── */
.ai-insights-card {
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: #ffffff;
  box-shadow: rgba(0, 0, 0, 0.2) 0px 10px 25px 0px;
}

.ai-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.ai-badge-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.ai-spark-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: #34D399;
}

.ai-card-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.ai-tag-sm {
  font-size: 0.65rem;
  font-weight: 700;
  color: #34D399;
  letter-spacing: 0.05em;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

.ai-headline-box {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.ai-headline-box h4 {
  font-size: 0.92rem;
  font-weight: 600;
  color: #F1F5F9;
  margin: 0;
}

.ai-insights-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .ai-insights-grid { grid-template-columns: 1fr; }
}

.ai-col h5 {
  font-size: 0.85rem;
  font-weight: 700;
  color: #94A3B8;
  margin: 0 0 0.6rem 0;
}

.ai-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ai-col li {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #F1F5F9;
  line-height: 1.4;
}

/* ── Modal Styles ── */
.member-detail-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.md-header-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  background: #F9FAFB;
  padding: 1rem;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
}

.md-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #059669;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
}

.md-info { flex: 1; }
.md-info h3 { margin: 0; font-size: 1.05rem; font-weight: 700; color: #111827; }
.md-role { margin: 0.1rem 0; font-size: 0.8rem; color: #4B5563; }
.md-email { margin: 0; font-size: 0.72rem; color: #9CA3AF; }

.md-score-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.md-score-num { font-size: 1.3rem; font-weight: 800; color: #059669; }
.md-score-sub { font-size: 0.72rem; font-weight: 700; color: #6B7280; }

.md-stats-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.md-stat-box {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
}

.md-stat-box .lbl { font-size: 0.7rem; color: #6B7280; }
.md-stat-box .val { font-size: 0.88rem; font-weight: 700; color: #111827; }

.md-section h4 { font-size: 0.85rem; font-weight: 700; color: #111827; margin: 0 0 0.4rem 0; }
.md-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.35rem; }
.md-list li { font-size: 0.8rem; color: #374151; }

.modal-footer-nav { margin-top: 0.5rem; }

.export-modal-body { display: flex; flex-direction: column; gap: 1rem; }
.export-desc { font-size: 0.85rem; color: #4B5563; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 0.3rem; }
.form-label { font-size: 0.78rem; font-weight: 600; color: #374151; }
.modal-input { padding: 0.5rem 0.75rem; border-radius: 8px; border: 1px solid #D1D5DB; font-size: 0.85rem; outline: none; }
.modal-actions-row { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }

.text-right { text-align: right; }
.text-center { text-align: center; }
.font-medium { font-weight: 500; }
</style>
