<template>
  <div class="circular-ring-wrapper" :style="{ width: size + 'px', height: size + 'px' }">
    <svg :width="size" :height="size" class="circular-ring-svg">
      <!-- Track Circle -->
      <circle
        class="ring-track"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        fill="none"
      />
      <!-- Progress Circle -->
      <circle
        class="ring-fill"
        :cx="center"
        :cy="center"
        :r="radius"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        :stroke="color"
        stroke-linecap="round"
        fill="none"
      />
    </svg>
    <div class="ring-content">
      <span class="ring-value" :style="{ fontSize: valueFontSize }">{{ value }}%</span>
      <span class="ring-label" v-if="showLabel">{{ label }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: 0 },
  size: { type: Number, default: 72 },
  strokeWidth: { type: Number, default: 7 },
  showLabel: { type: Boolean, default: false },
  label: { type: String, default: 'Health' }
});

const center = computed(() => props.size / 2);
const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

const dashOffset = computed(() => {
  const pct = Math.max(0, Math.min(100, props.value || 0));
  return circumference.value - (pct / 100) * circumference.value;
});

const color = computed(() => {
  const val = props.value || 0;
  if (val >= 80) return '#059669'; // Emerald
  if (val >= 60) return '#2563EB'; // Blue
  if (val >= 40) return '#F59E0B'; // Amber
  return '#EF4444'; // Red
});

const valueFontSize = computed(() => {
  if (props.size >= 80) return '1.25rem';
  if (props.size >= 60) return '0.95rem';
  return '0.8rem';
});
</script>

<style scoped>
.circular-ring-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.circular-ring-svg {
  transform: rotate(-90deg);
}

.ring-track {
  stroke: #F3F4F6;
}

.ring-fill {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.ring-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.ring-value {
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.ring-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: uppercase;
  margin-top: 2px;
}
</style>
