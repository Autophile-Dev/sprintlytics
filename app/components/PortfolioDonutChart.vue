<template>
  <div class="donut-chart-wrapper">
    <!-- SVG Radial Donut Chart (Large 230px Display) -->
    <div class="donut-display">
      <div class="donut-svg-box">
        <svg viewBox="0 0 200 200" class="donut-svg">
          <g transform="rotate(-90 100 100)">
            <!-- Base background track ring -->
            <circle cx="100" cy="100" r="78" fill="none" stroke="#F3F4F6" stroke-width="18" />
            
            <!-- Segment Rings -->
            <circle
              v-for="(seg, idx) in segments"
              :key="'seg-'+idx"
              cx="100"
              cy="100"
              r="78"
              fill="none"
              :stroke="seg.color"
              stroke-width="18"
              :stroke-dasharray="`${seg.dashLen} ${circumference}`"
              :stroke-dashoffset="seg.dashOffset"
              stroke-linecap="round"
              class="donut-ring-segment"
            >
              <title>{{ seg.label }}: {{ seg.value }} ({{ seg.pct }}%)</title>
            </circle>
          </g>
        </svg>

        <!-- Center Counter Badge (Large) -->
        <div class="donut-center-badge">
          <div class="center-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <span class="center-main-num">{{ totalValue }}</span>
          <span class="center-sub-label">{{ centerLabel }}</span>
        </div>
      </div>
    </div>

    <!-- Aligned Legend List -->
    <div class="donut-legend-list">
      <div v-for="(seg, idx) in segments" :key="'item-'+idx" class="legend-row">
        <div class="row-left">
          <span class="item-square-icon" :style="{ backgroundColor: seg.color }"></span>
          <span class="item-label">{{ seg.label }}</span>
        </div>
        <span class="row-right font-bold">{{ seg.pct }}% <span class="count-sub">({{ seg.value }})</span></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  centerLabel: { type: String, default: 'Total Items' }
});

const circumference = 2 * Math.PI * 78; // radius = 78 => 490.09

const totalValue = computed(() => {
  if (!props.items || props.items.length === 0) return 0;
  return props.items.reduce((sum, item) => sum + (item.value || 0), 0);
});

const segments = computed(() => {
  const total = totalValue.value || 1;
  let accumulatedOffset = 0;

  return (props.items || []).map(item => {
    const val = item.value || 0;
    const pct = Math.round((val / total) * 100);
    const dashLen = Math.max(2, (val / total) * circumference);
    const dashOffset = -accumulatedOffset;

    accumulatedOffset += dashLen;

    return {
      label: item.label || 'Item',
      value: val,
      pct,
      color: item.color || '#059669',
      dashLen,
      dashOffset
    };
  });
});
</script>

<style scoped>
.donut-chart-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.donut-display {
  display: flex;
  justify-content: center;
  width: 100%;
  padding-top: 0.5rem;
}

.donut-svg-box {
  position: relative;
  width: 230px;
  height: 230px;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-ring-segment {
  transition: stroke-width 0.25s ease, opacity 0.25s ease;
  cursor: pointer;
}

.donut-ring-segment:hover {
  stroke-width: 22;
}

.donut-center-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
}

.center-icon {
  color: #059669;
  margin-bottom: 0.2rem;
}

.center-main-num {
  font-size: 2.2rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.center-sub-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6B7280;
  margin-top: 0.3rem;
  white-space: nowrap;
}

.donut-legend-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.legend-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #374151;
  padding: 0.3rem 0;
  border-bottom: 1px stroke #F3F4F6;
}

.legend-row:last-child {
  border-bottom: none;
}

.row-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.item-square-icon {
  width: 11px;
  height: 11px;
  border-radius: 3px;
  flex-shrink: 0;
}

.item-label {
  font-weight: 500;
  color: #4B5563;
}

.row-right {
  font-size: 0.875rem;
  color: #111827;
}

.count-sub {
  font-size: 0.78rem;
  color: #9CA3AF;
  font-weight: 500;
}
</style>
