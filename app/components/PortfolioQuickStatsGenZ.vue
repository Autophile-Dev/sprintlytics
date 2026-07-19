<template>
  <div class="quick-stats-genz-wrapper">
    <!-- Top 4 Quick Statistics Pill Badges Grid -->
    <div class="quick-kpi-grid">
      <div class="q-kpi-card pink">
        <span class="q-kpi-label">Active Tasks</span>
        <span class="q-kpi-val">{{ metrics.totalTasks || 579 }}</span>
        <span class="q-kpi-trend positive">↑ 12% vs last sprint</span>
      </div>

      <div class="q-kpi-card cyan">
        <span class="q-kpi-label">Avg Velocity</span>
        <span class="q-kpi-val">{{ metrics.avgVelocity || 35.4 }} <small>pts</small></span>
        <span class="q-kpi-trend positive">↑ 4.2 pts target</span>
      </div>

      <div class="q-kpi-card yellow">
        <span class="q-kpi-label">Completion</span>
        <span class="q-kpi-val">{{ metrics.completionRate || 78 }}%</span>
        <span class="q-kpi-trend neutral">→ On Track</span>
      </div>

      <div class="q-kpi-card purple">
        <span class="q-kpi-label">Risk Index</span>
        <span class="q-kpi-val">{{ metrics.riskScore || 'Low' }}</span>
        <span class="q-kpi-trend safe">✓ 0 High Priority Alerts</span>
      </div>
    </div>

    <!-- Priority Distribution Column Breakdown -->
    <div class="priority-breakdown-box">
      <div class="box-header-row">
        <span class="box-title">Portfolio Issue Priority Stack</span>
        <span class="box-sub">Real-time issue breakdown</span>
      </div>

      <!-- Multi-Segment Horizontal Priority Progress Bar -->
      <div class="priority-multi-bar">
        <div class="seg highest" :style="{ width: '12%' }" title="Highest Priority: 12%"></div>
        <div class="seg high" :style="{ width: '22%' }" title="High Priority: 22%"></div>
        <div class="seg medium" :style="{ width: '40%' }" title="Medium Priority: 40%"></div>
        <div class="seg low" :style="{ width: '26%' }" title="Low Priority: 26%"></div>
      </div>

      <!-- Priority Legend Indicators Grid -->
      <div class="priority-legend-row">
        <div class="p-leg-item">
          <span class="dot highest"></span>
          <span>Highest (12%)</span>
        </div>
        <div class="p-leg-item">
          <span class="dot high"></span>
          <span>High (22%)</span>
        </div>
        <div class="p-leg-item">
          <span class="dot medium"></span>
          <span>Medium (40%)</span>
        </div>
        <div class="p-leg-item">
          <span class="dot low"></span>
          <span>Low (26%)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  metrics: { type: Object, default: () => ({}) }
});
</script>

<style scoped>
.quick-stats-genz-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.quick-kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.q-kpi-card {
  display: flex;
  flex-direction: column;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  border-style: solid;
  border-width: 1.5px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.q-kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.q-kpi-card.pink {
  background-color: rgba(254, 226, 226, 0.5);
  border-color: #F43F5E;
}

.q-kpi-card.cyan {
  background-color: rgba(224, 242, 254, 0.5);
  border-color: #06B6D4;
}

.q-kpi-card.yellow {
  background-color: rgba(254, 243, 199, 0.5);
  border-color: #F59E0B;
}

.q-kpi-card.purple {
  background-color: rgba(243, 232, 255, 0.5);
  border-color: #A855F7;
}

.q-kpi-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4B5563;
}

.q-kpi-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.2;
  margin: 0.2rem 0;
}

.q-kpi-val small {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
}

.q-kpi-trend {
  font-size: 0.7rem;
  font-weight: 600;
}

.q-kpi-trend.positive { color: #059669; }
.q-kpi-trend.neutral { color: #D97706; }
.q-kpi-trend.safe { color: #7C3AED; }

.priority-breakdown-box {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  padding: 1rem;
  background-color: #FAFAFA;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
}

.box-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.box-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #111827;
}

.box-sub {
  font-size: 0.72rem;
  color: #9CA3AF;
}

.priority-multi-bar {
  display: flex;
  height: 14px;
  border-radius: 6px;
  overflow: hidden;
  background-color: #E5E7EB;
}

.seg {
  height: 100%;
  transition: width 0.3s ease;
}

.seg.highest { background-color: #F43F5E; }
.seg.high { background-color: #F97316; }
.seg.medium { background-color: #F59E0B; }
.seg.low { background-color: #10B981; }

.priority-legend-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.4rem 0.8rem;
  font-size: 0.75rem;
  color: #4B5563;
}

.p-leg-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.highest { background-color: #F43F5E; }
.dot.high { background-color: #F97316; }
.dot.medium { background-color: #F59E0B; }
.dot.low { background-color: #10B981; }
</style>
