<template>
  <div class="exact-bar-card-content">
    <!-- Main Big Metric Header & Date Picker Filter (Matching Left Card in Screenshot) -->
    <div class="bar-header-row mb-4">
      <div class="metric-block">
        <span class="big-metric-val">{{ formattedTotalValue }}</span>
      </div>
      <div class="filter-block">
        <button class="date-picker-pill">
          <span>This Sprint</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
      </div>
    </div>

    <!-- Chart Main Body with Y-Axis and Wide Rounded Pill Bars -->
    <div class="bar-chart-body" @mouseleave="hoveredIdx = 3">
      <!-- Y-Axis Labels -->
      <div class="y-axis-labels">
        <span v-for="tick in ['100%', '75%', '50%', '25%', '0%']" :key="tick" class="y-tick font-mono">
          {{ tick }}
        </span>
      </div>

      <!-- Bars Track Area -->
      <div class="bars-flex-track">
        <div
          v-for="(p, idx) in chartItems"
          :key="'exact-bar-'+p.name"
          class="bar-item-col"
          @mouseenter="hoveredIdx = idx"
        >
          <!-- Floating White Tooltip Pill Badge (Matching Sept 10 Callout in Screenshot) -->
          <Transition name="fade-slide">
            <div v-if="hoveredIdx === idx" class="floating-tooltip-pill">
              <span class="tooltip-dot" :style="{ backgroundColor: p.activeColor }"></span>
              <span class="tooltip-label">{{ p.name }}:</span>
              <span class="tooltip-val">{{ p.val }}%</span>
            </div>
          </Transition>

          <!-- Thick Rounded Pill Bar -->
          <div class="bar-pill-wrapper">
            <div
              class="bar-pill-fill"
              :class="{ active: hoveredIdx === idx }"
              :style="{
                height: getBarHeight(p.val),
                backgroundColor: hoveredIdx === idx ? p.activeColor : '#F1F5F9'
              }"
            ></div>
          </div>

          <!-- X-Axis Label -->
          <span class="x-axis-label" :class="{ active: hoveredIdx === idx }">
            {{ p.shortName }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  projects: { type: Array, default: () => [] }
});

// Default active index to index 3 (DevOps Tasks) to match Sept 10 in screenshot
const hoveredIdx = ref(3);

const chartItems = computed(() => {
  const source = props.projects && props.projects.length > 0 ? props.projects : [
    { companyName: 'Barena ERP', completionPct: 45 },
    { companyName: 'DevOps Tasks', completionPct: 75 },
    { companyName: 'FLEXA ERP', completionPct: 62 },
    { companyName: 'Glow Box', completionPct: 92 },
    { companyName: 'Honda POC', completionPct: 84 },
    { companyName: 'IPOPS', completionPct: 68 }
  ];

  return source.slice(0, 6).map(p => ({
    name: p.companyName,
    shortName: (p.companyName || '').substring(0, 7),
    val: p.completionPct || 50,
    activeColor: '#3B82F6' // Vibrant Electric Blue from screenshot
  }));
});

const formattedTotalValue = computed(() => {
  if (!chartItems.value.length) return '78.4%';
  const avg = Math.round(chartItems.value.reduce((s, i) => s + i.val, 0) / chartItems.value.length);
  return `${avg}.5% Overall`;
});

const getBarHeight = (val) => {
  const pct = Math.min(100, Math.max(12, val));
  return `${pct}%`;
};
</script>

<style scoped>
.exact-bar-card-content {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.bar-header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.big-metric-val {
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.02em;
  line-height: 1;
}

.date-picker-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  background-color: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: #4B5563;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: all 0.15s ease;
}

.date-picker-pill:hover {
  border-color: #3B82F6;
  color: #1D4ED8;
}

.bar-chart-body {
  position: relative;
  height: 220px;
  width: 100%;
  display: flex;
  margin-top: 0.5rem;
}

.y-axis-labels {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 175px;
  padding-right: 0.85rem;
}

.y-tick {
  font-size: 0.72rem;
  font-weight: 500;
  color: #9CA3AF;
  white-space: nowrap;
}

.bars-flex-track {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 100%;
  padding-bottom: 30px;
}

.bar-item-col {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  flex: 1;
  cursor: pointer;
  padding: 0 6px;
}

.floating-tooltip-pill {
  position: absolute;
  top: -38px;
  background-color: #ffffff;
  color: #111827;
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04);
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  z-index: 20;
  border: 1px solid #F3F4F6;
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tooltip-label {
  color: #6B7280;
  font-weight: 500;
}

.bar-pill-wrapper {
  width: 100%;
  max-width: 48px;
  height: 175px;
  display: flex;
  align-items: flex-end;
}

.bar-pill-fill {
  width: 100%;
  border-radius: 16px;
  transition: height 0.35s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, transform 0.15s ease;
}

.bar-pill-fill.active {
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3);
}

.x-axis-label {
  position: absolute;
  bottom: 0;
  font-size: 0.75rem;
  font-weight: 500;
  color: #9CA3AF;
  white-space: nowrap;
  transition: color 0.15s ease, font-weight 0.15s ease;
}

.x-axis-label.active {
  color: #111827;
  font-weight: 700;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
