<template>
  <div class="heatmap-wrapper">
    <!-- Heatmap Card Header -->
    <div class="heatmap-header-row">
      <div class="heatmap-title-box">
        <h4 class="heatmap-title">Sprint Workload & Performance Heatmap</h4>
        <span class="heatmap-sub font-medium">Real-time resolution density by time & project metrics</span>
      </div>
      <div class="heatmap-actions">
        <span class="live-pill">Live Updates</span>
      </div>
    </div>

    <!-- Matrix Heatmap Table Grid -->
    <div class="heatmap-grid-container">
      <div class="heatmap-matrix">
        <!-- Header Row: Metric Columns -->
        <div class="matrix-row header-row">
          <div class="matrix-label-cell project-col font-bold">Connected Project</div>
          <div v-for="m in metricCols" :key="m.key" class="matrix-header-cell">
            <span>{{ m.label }}</span>
          </div>
        </div>

        <!-- Body Rows: Projects x Metrics Heat Cells -->
        <div v-for="p in projectsList" :key="'hm-row-'+p.companyName" class="matrix-row">
          <div class="matrix-label-cell project-col">
            <span class="project-dot" :class="p.healthScore >= 80 ? 'green' : p.healthScore >= 60 ? 'blue' : 'red'"></span>
            <span class="project-name">{{ p.companyName }}</span>
          </div>

          <div v-for="m in metricCols" :key="m.key" class="matrix-data-cell">
            <div
              class="heat-tile"
              :style="getTileStyle(m.key, p[m.key])"
              :title="`${p.companyName} - ${m.label}: ${p[m.key]}`"
            >
              <span class="tile-val">{{ formatValue(m.key, p[m.key]) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Heat Intensity Scale Legend Bar -->
    <div class="heatmap-bottom-scale">
      <span class="scale-title">Intensity Index</span>
      <div class="scale-bar-track">
        <span class="scale-tick level-1">Low</span>
        <span class="scale-tick level-2">Normal</span>
        <span class="scale-tick level-3">Optimal</span>
        <span class="scale-tick level-4">Critical</span>
      </div>
      <div class="scale-indicators">
        <span class="indicator-chip shade-1">0 - 25</span>
        <span class="indicator-chip shade-2">26 - 50</span>
        <span class="indicator-chip shade-3">51 - 75</span>
        <span class="indicator-chip shade-4">76 - 100+</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  projects: { type: Array, default: () => [] }
});

const metricCols = [
  { key: 'healthScore', label: 'Health Score' },
  { key: 'completionPct', label: 'Completion' },
  { key: 'velocity', label: 'Velocity (pts)' },
  { key: 'blocked', label: 'Blocked' },
  { key: 'bugCount', label: 'Bugs' },
  { key: 'highPriority', label: 'High Priority' }
];

const projectsList = computed(() => {
  if (props.projects && props.projects.length > 0) return props.projects;
  return [
    { companyName: 'Barena ERP', healthScore: 15, completionPct: 0, velocity: 0, blocked: 4, bugCount: 0, highPriority: 8 },
    { companyName: 'DevOps Tasks', healthScore: 61, completionPct: 90, velocity: 0, blocked: 0, bugCount: 0, highPriority: 0 },
    { companyName: 'FLEXA ERP', healthScore: 29, completionPct: 11, velocity: 0, blocked: 0, bugCount: 0, highPriority: 0 },
    { companyName: 'Glow Box', healthScore: 64, completionPct: 97, velocity: 0, blocked: 0, bugCount: 2, highPriority: 0 },
    { companyName: 'Honda POC', healthScore: 36, completionPct: 28, velocity: 0, blocked: 0, bugCount: 0, highPriority: 0 },
    { companyName: 'IPOPS', healthScore: 25, completionPct: 0, velocity: 0, blocked: 0, bugCount: 0, highPriority: 0 }
  ];
});

const formatValue = (key, val) => {
  const v = val || 0;
  if (key === 'healthScore' || key === 'completionPct') return `${v}%`;
  return v;
};

const getTileStyle = (key, val) => {
  const v = val || 0;

  // Positive metrics (Health & Completion)
  if (key === 'healthScore' || key === 'completionPct') {
    if (v >= 80) return { backgroundColor: '#059669', color: '#ffffff', fontWeight: '700' };
    if (v >= 60) return { backgroundColor: '#34D399', color: '#065F46', fontWeight: '600' };
    if (v >= 30) return { backgroundColor: '#A7F3D0', color: '#065F46', fontWeight: '600' };
    return { backgroundColor: '#FEE2E2', color: '#991B1B', fontWeight: '700' };
  }

  // Risk metrics (Blocked, Bugs, High Priority)
  if (key === 'blocked' || key === 'bugCount' || key === 'highPriority') {
    if (v === 0) return { backgroundColor: '#F3F4F6', color: '#9CA3AF', fontWeight: '500' };
    if (v <= 2) return { backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: '600' };
    return { backgroundColor: '#EF4444', color: '#ffffff', fontWeight: '700' };
  }

  // Velocity (Story Points)
  if (v > 20) return { backgroundColor: '#2563EB', color: '#ffffff', fontWeight: '700' };
  if (v > 0) return { backgroundColor: '#93C5FD', color: '#1E3A8A', fontWeight: '600' };
  return { backgroundColor: '#F3F4F6', color: '#9CA3AF', fontWeight: '500' };
};
</script>

<style scoped>
.heatmap-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.heatmap-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.heatmap-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.heatmap-sub {
  font-size: 0.78rem;
  color: #6B7280;
  margin-top: 0.15rem;
  display: block;
}

.live-pill {
  font-size: 0.72rem;
  font-weight: 600;
  color: #059669;
  background-color: #ECFDF5;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  border: 1px solid #A7F3D0;
}

.heatmap-grid-container {
  width: 100%;
  overflow-x: auto;
}

.heatmap-matrix {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 650px;
}

.matrix-row {
  display: grid;
  grid-template-columns: 180px repeat(6, 1fr);
  gap: 0.4rem;
  align-items: center;
}

.matrix-row.header-row {
  margin-bottom: 0.25rem;
}

.matrix-label-cell {
  font-size: 0.825rem;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.matrix-header-cell {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  text-align: center;
  text-transform: uppercase;
}

.project-col {
  padding-left: 0.25rem;
}

.project-name {
  font-weight: 600;
  color: #1F2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.project-dot.green { background-color: #10B981; }
.project-dot.blue { background-color: #3B82F6; }
.project-dot.red { background-color: #EF4444; }

.heat-tile {
  height: 38px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
}

.heat-tile:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
}

.heatmap-bottom-scale {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px stroke #F3F4F6;
  font-size: 0.75rem;
  color: #6B7280;
}

.scale-title {
  font-weight: 600;
  color: #374151;
}

.scale-indicators {
  display: flex;
  gap: 0.4rem;
}

.indicator-chip {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.indicator-chip.shade-1 { background-color: #F3F4F6; color: #6B7280; }
.indicator-chip.shade-2 { background-color: #A7F3D0; color: #065F46; }
.indicator-chip.shade-3 { background-color: #34D399; color: #065F46; }
.indicator-chip.shade-4 { background-color: #059669; color: #ffffff; }
</style>
