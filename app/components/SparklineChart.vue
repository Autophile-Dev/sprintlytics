<template>
  <div class="sparkline-container" :style="{ height: height + 'px' }">
    <svg viewBox="0 0 120 40" class="sparkline-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="strokeColor" stop-opacity="0.3"/>
          <stop offset="100%" :stop-color="strokeColor" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <!-- Area Fill -->
      <path :d="areaPath" :fill="`url(#${gradientId})`" />
      <!-- Line -->
      <path :d="linePath" fill="none" :stroke="strokeColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: { type: String, default: 'positive' }, // 'positive' | 'negative' | 'neutral' | 'orange'
  height: { type: Number, default: 32 },
  points: { type: Array, default: null }
});

const gradientId = computed(() => 'sparkGrad-' + Math.random().toString(36).substr(2, 9));

const strokeColor = computed(() => {
  if (props.variant === 'positive') return '#059669';
  if (props.variant === 'negative') return '#EF4444';
  if (props.variant === 'orange') return '#F97316';
  return '#2563EB';
});

// Generated fallback points if none provided
const dataPoints = computed(() => {
  if (props.points && props.points.length >= 2) return props.points;
  if (props.variant === 'positive') return [12, 18, 14, 22, 19, 28, 24, 32, 30, 36];
  if (props.variant === 'negative') return [34, 28, 30, 22, 25, 18, 19, 14, 16, 10];
  if (props.variant === 'orange') return [15, 20, 18, 26, 22, 30, 28, 35, 31, 38];
  return [15, 22, 19, 25, 24, 28, 26, 30, 29, 34];
});

const pathData = computed(() => {
  const pts = dataPoints.value;
  const width = 120;
  const height = 40;
  const min = Math.min(...pts);
  const max = Math.max(...pts) || 1;
  const range = max - min || 1;

  const coords = pts.map((val, idx) => {
    const x = (idx / (pts.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  });

  const line = 'M ' + coords.join(' L ');
  const area = `${line} L 120,40 L 0,40 Z`;

  return { line, area };
});

const linePath = computed(() => pathData.value.line);
const areaPath = computed(() => pathData.value.area);
</script>

<style scoped>
.sparkline-container {
  width: 100%;
  overflow: hidden;
}

.sparkline-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
