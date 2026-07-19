<template>
  <div class="donut-card-inner">
    <!-- Main Content: Left SVG Donut + Right 2-Column Legend Grid -->
    <div class="donut-main-grid">
      <!-- Left SVG Radial Ring with Center Counter & Segment Text Labels -->
      <div class="donut-svg-wrapper">
        <svg viewBox="0 0 220 220" class="donut-svg">
          <g transform="rotate(-90 110 110)">
            <!-- Base background track ring -->
            <circle cx="110" cy="110" r="76" fill="none" stroke="#F3F4F6" stroke-width="26" />
            
            <!-- Donut Segments -->
            <circle
              v-for="(seg, idx) in segments"
              :key="'seg-'+idx"
              cx="110"
              cy="110"
              r="76"
              fill="none"
              :stroke="seg.color"
              stroke-width="26"
              :stroke-dasharray="`${seg.dashLen} ${circumference}`"
              :stroke-dashoffset="seg.dashOffset"
              stroke-linecap="round"
              class="donut-segment"
            >
              <title>{{ seg.label }}: {{ seg.value }} ({{ seg.pct }}%)</title>
            </circle>
          </g>

          <!-- Percentage Labels Printed INSIDE Donut Ring Segments (Inspired by Screenshot 2) -->
          <g class="segment-labels-group">
            <text
              v-for="(seg, idx) in segments"
              :key="'lbl-'+idx"
              v-show="seg.pct > 5"
              :x="seg.labelX"
              :y="seg.labelY"
              text-anchor="middle"
              dominant-baseline="central"
              fill="#ffffff"
              font-size="10.5"
              font-weight="700"
            >
              {{ seg.pct }}%
            </text>
          </g>
        </svg>

        <!-- Center Counter Badge -->
        <div class="donut-center-badge">
          <span class="center-pct">{{ completedPct }}%</span>
          <span class="center-sub">{{ centerLabel || 'Completed' }}</span>
        </div>
      </div>

      <!-- Right Side 2-Column Legend Grid (Inspired directly by Screenshot 1) -->
      <div class="donut-legend-grid">
        <div v-for="(seg, idx) in segments" :key="'leg-'+idx" class="legend-grid-item">
          <div class="item-top">
            <span class="color-dot" :style="{ backgroundColor: seg.color }"></span>
            <span class="item-name">{{ seg.label }}</span>
          </div>
          <div class="item-value-row">
            <span class="item-count">{{ seg.value }}</span>
            <span class="item-pct-sub">{{ seg.pct }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  centerLabel: { type: String, default: 'Completed' }
});

const circumference = 2 * Math.PI * 76; // radius = 76 => 477.52

const totalValue = computed(() => {
  if (!props.items || props.items.length === 0) return 0;
  return props.items.reduce((sum, item) => sum + (item.value || 0), 0);
});

const completedPct = computed(() => {
  if (totalValue.value === 0) return 0;
  const doneItem = (props.items || []).find(i => (i.label || '').toLowerCase().includes('done'));
  const doneVal = doneItem ? doneItem.value : (props.items[0]?.value || 0);
  return Math.round((doneVal / totalValue.value) * 100);
});

const segments = computed(() => {
  const total = totalValue.value || 1;
  let accumulatedOffset = 0;
  let accumulatedAngle = 0;

  return (props.items || []).map(item => {
    const val = item.value || 0;
    const pct = Math.round((val / total) * 100);
    const dashLen = Math.max(2, (val / total) * circumference);
    const dashOffset = -accumulatedOffset;

    // Angle calculation for placing percentage text inside ring segment
    const segmentAngle = (val / total) * 360;
    const midAngle = accumulatedAngle + segmentAngle / 2;
    const rad = (midAngle - 90) * (Math.PI / 180);
    const labelX = 110 + 76 * Math.cos(rad);
    const labelY = 110 + 76 * Math.sin(rad);

    accumulatedOffset += dashLen;
    accumulatedAngle += segmentAngle;

    return {
      label: item.label || 'Item',
      value: val,
      pct,
      color: item.color || '#059669',
      dashLen,
      dashOffset,
      labelX,
      labelY
    };
  });
});
</script>

<style scoped>
.donut-card-inner {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.donut-main-grid {
  display: grid;
  grid-template-columns: 210px 1fr;
  gap: 1.5rem;
  align-items: center;
  width: 100%;
}

.donut-svg-wrapper {
  position: relative;
  width: 210px;
  height: 210px;
}

.donut-svg {
  width: 100%;
  height: 100%;
}

.donut-segment {
  transition: stroke-width 0.2s ease, opacity 0.2s ease;
  cursor: pointer;
}

.donut-segment:hover {
  stroke-width: 30;
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

.center-pct {
  font-size: 1.85rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
}

.center-sub {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6B7280;
  margin-top: 0.25rem;
  white-space: nowrap;
}

.donut-legend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem 1.25rem;
  width: 100%;
}

.legend-grid-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.item-top {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.color-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.item-name {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6B7280;
}

.item-value-row {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  padding-left: 0.95rem;
}

.item-count {
  font-size: 1.1rem;
  font-weight: 700;
  color: #111827;
}

.item-pct-sub {
  font-size: 0.75rem;
  font-weight: 600;
  color: #9CA3AF;
}

@media (max-width: 640px) {
  .donut-main-grid {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}
</style>
