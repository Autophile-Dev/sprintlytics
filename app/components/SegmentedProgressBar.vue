<template>
  <div class="segmented-bar-container" :style="{ height: height }">
    <div
      v-for="index in totalSegments"
      :key="index"
      class="segment"
      :class="{
        'segment--filled': index <= activeSegments,
        [`segment--${variant}`]: index <= activeSegments
      }"
    ></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: 0 }, // percentage 0 - 100
  totalSegments: { type: Number, default: 44 },
  variant: { type: String, default: 'orange' }, // 'orange' | 'emerald' | 'blue' | 'red' | 'purple'
  height: { type: String, default: '24px' }
});

const activeSegments = computed(() => {
  const pct = Math.max(0, Math.min(100, props.value || 0));
  return Math.round((pct / 100) * props.totalSegments);
});
</script>

<style scoped>
.segmented-bar-container {
  display: flex;
  align-items: center;
  gap: 1.5px;
  width: 100%;
}

.segment {
  flex: 1;
  max-width: 3px;
  height: 100%;
  border-radius: 1.5px;
  background-color: #EBF0F5;
  transition: background-color 0.25s ease;
}

.segment--filled.segment--orange { background-color: #F97316; }
.segment--filled.segment--emerald { background-color: #059669; }
.segment--filled.segment--blue { background-color: #2563EB; }
.segment--filled.segment--red { background-color: #EF4444; }
.segment--filled.segment--purple { background-color: #7C3AED; }
</style>
