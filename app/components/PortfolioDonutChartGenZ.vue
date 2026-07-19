<template>
  <div class="genz-donut-wrapper">
    <!-- Top Legend Pills (Directly matching Screenshot 2 top legend style) -->
    <div class="genz-legend-pills">
      <div v-for="(seg, idx) in segments" :key="'gleg-'+idx" class="legend-pill-item">
        <span class="color-bar-pill" :style="{ backgroundColor: seg.color }"></span>
        <span class="legend-text">{{ seg.label }}</span>
      </div>
    </div>

    <!-- Doughnut SVG Display (Matching Screenshot 2 Doughnut) -->
    <div class="genz-donut-display">
      <svg viewBox="0 0 240 240" class="genz-donut-svg">
        <g transform="rotate(-90 120 120)">
          <!-- Base Track -->
          <circle cx="120" cy="120" r="70" fill="none" stroke="#F3F4F6" stroke-width="50" />

          <!-- Donut Segments with White Divider Strokes -->
          <circle
            v-for="(seg, idx) in segments"
            :key="'gseg-'+idx"
            cx="120"
            cy="120"
            r="70"
            fill="none"
            :stroke="seg.color"
            stroke-width="50"
            :stroke-dasharray="`${seg.dashLen} ${circumference}`"
            :stroke-dashoffset="seg.dashOffset"
            stroke-linecap="butt"
            class="donut-slice"
          >
            <title>{{ seg.label }}: {{ seg.value }} ({{ seg.pct }}%)</title>
          </circle>

          <!-- White Divider Lines overlay for crisp separation -->
          <circle
            v-for="(seg, idx) in segments"
            :key="'div-'+idx"
            cx="120"
            cy="120"
            r="70"
            fill="none"
            stroke="#ffffff"
            stroke-width="50"
            :stroke-dasharray="`4 ${circumference}`"
            :stroke-dashoffset="seg.dashOffset"
            stroke-linecap="butt"
            class="divider-line"
          />
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  items: { type: Array, default: () => [] }
});

const circumference = 2 * Math.PI * 70; // radius = 70 => 439.82

const defaultColors = ['#F43F5E', '#3B82F6', '#F59E0B', '#10B981', '#A855F7', '#64748B'];

const totalValue = computed(() => {
  if (!props.items || props.items.length === 0) return 0;
  return props.items.reduce((sum, item) => sum + (item.value || 0), 0);
});

const segments = computed(() => {
  const total = totalValue.value || 1;
  let accumulatedOffset = 0;

  return (props.items || []).map((item, idx) => {
    const val = item.value || 0;
    const pct = Math.round((val / total) * 100);
    const dashLen = Math.max(2, (val / total) * circumference);
    const dashOffset = -accumulatedOffset;

    accumulatedOffset += dashLen;

    return {
      label: item.label || 'Item',
      value: val,
      pct,
      color: item.color || defaultColors[idx % defaultColors.length],
      dashLen,
      dashOffset
    };
  });
});
</script>

<style scoped>
.genz-donut-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
  width: 100%;
}

.genz-legend-pills {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-pill-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.color-bar-pill {
  width: 18px;
  height: 8px;
  border-radius: 2px;
}

.legend-text {
  font-size: 0.78rem;
  font-weight: 600;
  color: #4B5563;
}

.genz-donut-display {
  position: relative;
  width: 220px;
  height: 220px;
}

.genz-donut-svg {
  width: 100%;
  height: 100%;
}

.donut-slice {
  transition: opacity 0.2s ease, filter 0.2s ease;
  cursor: pointer;
}

.donut-slice:hover {
  filter: brightness(1.08);
}

.divider-line {
  pointer-events: none;
}
</style>
