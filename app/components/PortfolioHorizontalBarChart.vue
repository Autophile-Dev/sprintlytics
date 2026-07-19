<template>
  <div class="hbar-chart-container">
    <!-- SVG Grid Background Lines & X-Axis Scale Header -->
    <div class="chart-scale-header">
      <div class="scale-label-spacer"></div>
      <div class="scale-ticks-track">
        <span v-for="tick in [0, 25, 50, 75, 100]" :key="tick" class="scale-tick-label">
          {{ tick }}%
        </span>
      </div>
      <div class="scale-val-spacer"></div>
    </div>

    <div class="hbar-rows-list">
      <div v-for="p in projects" :key="'hbar-'+p.companyName" class="hbar-row-item">
        <!-- Project Name Label -->
        <div class="hbar-company-label" :title="p.companyName">
          <span class="company-name-text">{{ p.companyName }}</span>
        </div>

        <!-- Bar Track with Grid Lines Background -->
        <div class="hbar-bar-track">
          <!-- Background Grid Lines -->
          <div class="grid-lines-bg">
            <span class="grid-line" style="left: 0%"></span>
            <span class="grid-line" style="left: 25%"></span>
            <span class="grid-line" style="left: 50%"></span>
            <span class="grid-line" style="left: 75%"></span>
            <span class="grid-line" style="left: 100%"></span>
          </div>

          <!-- Color Fill Bar -->
          <div
            class="hbar-bar-fill"
            :class="p.completionPct >= 80 ? 'emerald' : p.completionPct >= 50 ? 'blue' : p.completionPct > 0 ? 'orange' : 'gray'"
            :style="{ width: Math.min(100, Math.max(0, p.completionPct || 0)) + '%' }"
          ></div>
        </div>

        <!-- Percentage Value Column -->
        <div class="hbar-value-col font-bold">
          <span :class="p.completionPct > 0 ? 'text-dark' : 'text-muted'">
            {{ p.completionPct || 0 }}%
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  projects: { type: Array, default: () => [] }
});
</script>

<style scoped>
.hbar-chart-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.chart-scale-header {
  display: flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9CA3AF;
  padding-bottom: 0.25rem;
  border-bottom: 1px stroke #F3F4F6;
}

.scale-label-spacer {
  width: 130px;
  flex-shrink: 0;
}

.scale-ticks-track {
  flex: 1;
  display: flex;
  justify-content: space-between;
  padding: 0 2px;
}

.scale-tick-label {
  width: 0;
  text-anchor: middle;
  display: flex;
  justify-content: center;
  white-space: nowrap;
}

.scale-val-spacer {
  width: 45px;
  flex-shrink: 0;
}

.hbar-rows-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.hbar-row-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hbar-company-label {
  width: 130px;
  flex-shrink: 0;
  font-size: 0.825rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hbar-bar-track {
  flex: 1;
  position: relative;
  height: 14px;
  background-color: #F3F4F6;
  border-radius: 9999px;
  overflow: hidden;
}

.grid-lines-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.grid-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background-color: rgba(209, 213, 219, 0.6);
}

.hbar-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.4s ease;
  position: relative;
  z-index: 2;
}

.hbar-bar-fill.emerald { background: linear-gradient(90deg, #059669 0%, #10B981 100%); }
.hbar-bar-fill.blue { background: linear-gradient(90deg, #2563EB 0%, #3B82F6 100%); }
.hbar-bar-fill.orange { background: linear-gradient(90deg, #D97706 0%, #F59E0B 100%); }
.hbar-bar-fill.gray { background-color: #E5E7EB; }

.hbar-value-col {
  width: 45px;
  flex-shrink: 0;
  text-align: right;
  font-size: 0.85rem;
}

.text-dark { color: #111827; }
.text-muted { color: #9CA3AF; }
</style>
