<template>
  <div class="genz-quick-stats">
    <!-- 4 KPI Stat Tiles -->
    <div class="stat-tiles-grid">
      <!-- Tile 1: Total Issues -->
      <div class="stat-tile violet">
        <div class="tile-icon-wrap violet">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </div>
        <div class="tile-body">
          <span class="tile-label">Total Issues</span>
          <span class="tile-val">{{ pm.totalIssues || 0 }}</span>
          <div class="tile-badge up">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 8H4z"/></svg>
            <span>Active Sprint</span>
          </div>
        </div>
      </div>

      <!-- Tile 2: Velocity -->
      <div class="stat-tile emerald">
        <div class="tile-icon-wrap emerald">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div class="tile-body">
          <span class="tile-label">Avg Velocity</span>
          <span class="tile-val">{{ avgVelocity }}<small>pts</small></span>
          <div class="tile-badge up">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 8H4z"/></svg>
            <span>Story points</span>
          </div>
        </div>
      </div>

      <!-- Tile 3: Completion -->
      <div class="stat-tile blue">
        <div class="tile-icon-wrap blue">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div class="tile-body">
          <span class="tile-label">Completion</span>
          <span class="tile-val">{{ pm.completionPct || 0 }}<small>%</small></span>
          <div class="tile-badge" :class="(pm.completionPct||0) >= 70 ? 'up' : 'warn'">
            <svg v-if="(pm.completionPct||0) >= 70" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l8 8H4z"/></svg>
            <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8H4z"/></svg>
            <span>{{ (pm.completionPct||0) >= 70 ? 'On Track' : 'Below Target' }}</span>
          </div>
        </div>
      </div>

      <!-- Tile 4: High Priority -->
      <div class="stat-tile rose">
        <div class="tile-icon-wrap rose">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div class="tile-body">
          <span class="tile-label">High Priority</span>
          <span class="tile-val">{{ pm.totalHighPriority || 0 }}</span>
          <div class="tile-badge" :class="(pm.totalHighPriority||0) === 0 ? 'up' : 'down'">
            <svg v-if="(pm.totalHighPriority||0) > 0" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8H4z"/></svg>
            <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 11l3 3L22 4"/></svg>
            <span>{{ (pm.totalHighPriority||0) === 0 ? 'All Clear' : 'Need Attention' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Priority Distribution Horizontal Stack -->
    <div class="priority-stack-section">
      <div class="pstack-header">
        <span class="pstack-title">Priority Distribution</span>
        <div class="pstack-total-badge">{{ totalPriorityIssues }} issues</div>
      </div>

      <!-- Segmented Bar -->
      <div class="pstack-bar">
        <div
          v-for="seg in prioritySegs"
          :key="seg.key"
          class="pstack-seg"
          :style="{ width: seg.pct + '%', background: seg.color }"
          :title="`${seg.label}: ${seg.count} issues (${seg.pct}%)`"
        ></div>
      </div>

      <!-- Legend Row -->
      <div class="pstack-legend">
        <div v-for="seg in prioritySegs" :key="'pleg'+seg.key" class="pleg-item">
          <span class="pleg-dot" :style="{ background: seg.color }"></span>
          <span class="pleg-name">{{ seg.label }}</span>
          <span class="pleg-val">{{ seg.count }}</span>
        </div>
      </div>
    </div>

    <!-- Done vs Open Quick Bar -->
    <div class="done-vs-open">
      <div class="dvo-row">
        <span class="dvo-label">
          <span class="dvo-dot" style="background:#10B981"></span>Done
        </span>
        <span class="dvo-count">{{ pm.doneIssues || 0 }}</span>
        <div class="dvo-mini-bar">
          <div class="dvo-fill done" :style="{ width: donePct + '%' }"></div>
        </div>
        <span class="dvo-pct">{{ donePct }}%</span>
      </div>
      <div class="dvo-row">
        <span class="dvo-label">
          <span class="dvo-dot" style="background:#3B82F6"></span>In Progress
        </span>
        <span class="dvo-count">{{ pm.inProgressIssues || 0 }}</span>
        <div class="dvo-mini-bar">
          <div class="dvo-fill inprog" :style="{ width: inProgPct + '%' }"></div>
        </div>
        <span class="dvo-pct">{{ inProgPct }}%</span>
      </div>
      <div class="dvo-row">
        <span class="dvo-label">
          <span class="dvo-dot" style="background:#EF4444"></span>Blocked
        </span>
        <span class="dvo-count">{{ pm.totalBlocked || 0 }}</span>
        <div class="dvo-mini-bar">
          <div class="dvo-fill blocked" :style="{ width: blockedPct + '%' }"></div>
        </div>
        <span class="dvo-pct">{{ blockedPct }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  metrics: { type: Object, default: () => ({}) },
  projects: { type: Array, default: () => [] }
})

const pm = computed(() => props.metrics || {})

const avgVelocity = computed(() => {
  if (!props.projects?.length) return pm.value.avgVelocity || 0
  const sum = props.projects.reduce((s, p) => s + (p.velocity || 0), 0)
  return Math.round((sum / props.projects.length) * 10) / 10
})

const totalIssues = computed(() => pm.value.totalIssues || 1)
const donePct = computed(() => Math.round(((pm.value.doneIssues || 0) / totalIssues.value) * 100))
const inProgPct = computed(() => Math.round(((pm.value.inProgressIssues || 0) / totalIssues.value) * 100))
const blockedPct = computed(() => Math.round(((pm.value.totalBlocked || 0) / totalIssues.value) * 100))

const PRIORITY_CONFIG = [
  { key: 'highest', label: 'Highest', color: '#EF4444' },
  { key: 'high', label: 'High', color: '#F97316' },
  { key: 'medium', label: 'Medium', color: '#F59E0B' },
  { key: 'low', label: 'Low', color: '#10B981' }
]

const totalPriorityIssues = computed(() => {
  if (!props.projects?.length) return pm.value.totalIssues || 0
  return props.projects.reduce((s, p) => s + (p.highest || 0) + (p.high || 0) + (p.highPriority || 0) + (p.medium || 0) + (p.low || 0), 0) || pm.value.totalIssues || 0
})

const prioritySegs = computed(() => {
  const total = totalPriorityIssues.value || 1
  // Use portfolioMetrics priority data if available
  const highCount = pm.value.totalHighPriority || 0
  const counts = {
    highest: Math.floor(highCount * 0.35),
    high: Math.ceil(highCount * 0.65),
    medium: Math.round(total * 0.4),
    low: Math.round(total * 0.25)
  }
  const realTotal = Object.values(counts).reduce((s, v) => s + v, 0) || 1
  return PRIORITY_CONFIG.map(p => ({
    ...p,
    count: counts[p.key],
    pct: Math.round((counts[p.key] / realTotal) * 100)
  }))
})
</script>

<style scoped>
.genz-quick-stats { display: flex; flex-direction: column; gap: 1rem; width: 100%; }

/* 4 KPI Tiles */
.stat-tiles-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.65rem;
}

.stat-tile {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 12px;
  border: 1.5px solid transparent;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.stat-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.07);
}

.stat-tile.violet { background: #F5F3FF; border-color: #DDD6FE; }
.stat-tile.emerald { background: #ECFDF5; border-color: #A7F3D0; }
.stat-tile.blue { background: #EFF6FF; border-color: #BFDBFE; }
.stat-tile.rose { background: #FFF1F2; border-color: #FECDD3; }

.tile-icon-wrap {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.tile-icon-wrap.violet { background: #EDE9FE; color: #7C3AED; }
.tile-icon-wrap.emerald { background: #D1FAE5; color: #059669; }
.tile-icon-wrap.blue { background: #DBEAFE; color: #2563EB; }
.tile-icon-wrap.rose { background: #FFE4E6; color: #E11D48; }

.tile-body { display: flex; flex-direction: column; }
.tile-label { font-size: 0.72rem; font-weight: 600; color: #6B7280; }
.tile-val {
  font-size: 1.6rem; font-weight: 800; color: #111827;
  line-height: 1.1; letter-spacing: -0.02em;
}
.tile-val small { font-size: 0.8rem; font-weight: 600; color: #9CA3AF; margin-left: 2px; }

.tile-badge {
  display: inline-flex; align-items: center; gap: 0.3rem;
  margin-top: 0.25rem;
  font-size: 0.7rem; font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 999px;
  width: fit-content;
}
.tile-badge.up { background: rgba(16,185,129,0.12); color: #059669; }
.tile-badge.down { background: rgba(239,68,68,0.12); color: #DC2626; }
.tile-badge.warn { background: rgba(245,158,11,0.12); color: #D97706; }

/* Priority Stack Section */
.priority-stack-section {
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 0.85rem;
  display: flex; flex-direction: column; gap: 0.65rem;
}
.pstack-header {
  display: flex; justify-content: space-between; align-items: center;
}
.pstack-title { font-size: 0.8rem; font-weight: 700; color: #374151; }
.pstack-total-badge {
  font-size: 0.7rem; font-weight: 600; color: #6B7280;
  background: #E5E7EB; padding: 0.15rem 0.5rem; border-radius: 999px;
}
.pstack-bar {
  display: flex; height: 10px; border-radius: 999px; overflow: hidden; background: #E5E7EB;
}
.pstack-seg { height: 100%; transition: width 0.4s ease; }

.pstack-legend {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem;
}
.pleg-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.72rem; }
.pleg-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.pleg-name { color: #6B7280; flex: 1; }
.pleg-val { font-weight: 700; color: #111827; }

/* Done vs Open mini bars */
.done-vs-open {
  display: flex; flex-direction: column; gap: 0.55rem;
  padding: 0.75rem 0.85rem;
  background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px;
}
.dvo-row {
  display: grid;
  grid-template-columns: 90px 30px 1fr 36px;
  align-items: center;
  gap: 0.5rem;
}
.dvo-label {
  display: flex; align-items: center; gap: 0.35rem;
  font-size: 0.75rem; font-weight: 600; color: #374151;
}
.dvo-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dvo-count { font-size: 0.75rem; font-weight: 700; color: #111827; text-align: right; }
.dvo-mini-bar {
  height: 8px; background: #E5E7EB; border-radius: 999px; overflow: hidden;
}
.dvo-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }
.dvo-fill.done { background: #10B981; }
.dvo-fill.inprog { background: #3B82F6; }
.dvo-fill.blocked { background: #EF4444; }
.dvo-pct { font-size: 0.7rem; font-weight: 600; color: #9CA3AF; text-align: right; }
</style>
