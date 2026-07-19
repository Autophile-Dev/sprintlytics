<template>
  <div class="genzchart-donut">
    <!-- SVG Donut + Right Legend Grid -->
    <div class="donut-layout">
      <!-- SVG Donut Ring -->
      <div class="donut-svg-wrap">
        <svg viewBox="0 0 220 220" class="donut-svg" @mouseleave="hovered = null">
          <!-- Segments -->
          <g transform="rotate(-90 110 110)">
            <circle cx="110" cy="110" r="88" fill="none" stroke="#F3F4F6" stroke-width="26" />
            <circle
              v-for="(seg, i) in segs"
              :key="i"
              cx="110" cy="110" r="88"
              fill="none"
              :stroke="seg.color"
              :stroke-width="hovered === i ? 32 : 26"
              :stroke-dasharray="`${seg.len} ${circum}`"
              :stroke-dashoffset="seg.offset"
              stroke-linecap="butt"
              class="seg-arc"
              @mouseenter="hovered = i"
              style="cursor:pointer"
            >
              <title>{{ seg.label }}: {{ seg.count }} issues ({{ seg.pct }}%)</title>
            </circle>
          </g>
          <!-- White dividers between segments -->
          <g transform="rotate(-90 110 110)">
            <circle
              v-for="(seg, i) in segs"
              :key="'d'+i"
              cx="110" cy="110" r="88"
              fill="none" stroke="white" stroke-width="26"
              :stroke-dasharray="`2 ${circum}`"
              :stroke-dashoffset="seg.offset"
              stroke-linecap="butt"
              style="pointer-events:none"
            />
          </g>
        </svg>
        <!-- Center Badge -->
        <div class="donut-center">
          <template v-if="hovered !== null">
            <span class="center-big" :style="{ color: segs[hovered]?.color }">{{ segs[hovered]?.pct }}%</span>
            <span class="center-lbl">{{ segs[hovered]?.label }}</span>
          </template>
          <template v-else>
            <span class="center-big">{{ totalCount }}</span>
            <span class="center-lbl">Total Issues</span>
          </template>
        </div>
      </div>

      <!-- Right Legend Grid (2-col) -->
      <div class="donut-legend-grid">
        <div
          v-for="(seg, i) in segs"
          :key="'lg'+i"
          class="leg-item"
          :class="{ dimmed: hovered !== null && hovered !== i }"
          @mouseenter="hovered = i"
          @mouseleave="hovered = null"
        >
          <div class="leg-item-top">
            <span class="leg-color-bar" :style="{ background: seg.color }"></span>
            <span class="leg-name">{{ seg.label }}</span>
          </div>
          <div class="leg-item-bottom">
            <span class="leg-count">{{ seg.count }}</span>
            <span class="leg-pct">{{ seg.pct }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom summary bar -->
    <div class="donut-summary-bar">
      <div class="summary-track">
        <div
          v-for="(seg, i) in segs"
          :key="'sb'+i"
          class="summary-seg"
          :style="{ width: seg.pct + '%', background: seg.color }"
          :title="`${seg.label}: ${seg.pct}%`"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: { type: Array, default: () => [] }
})

const hovered = ref(null)
const circum = 2 * Math.PI * 88 // ~552.9

const totalCount = computed(() => props.items.reduce((s, i) => s + (i.value || 0), 0))

const segs = computed(() => {
  const total = totalCount.value || 1
  let offset = 0
  return props.items
    .filter(i => i.value > 0)
    .map(item => {
      const pct = Math.round((item.value / total) * 100)
      const len = Math.max(2, (item.value / total) * circum)
      const seg = {
        label: item.label,
        count: item.value,
        pct,
        color: item.color || '#6B7280',
        len,
        offset: -offset
      }
      offset += len
      return seg
    })
})
</script>

<style scoped>
.genzchart-donut { display: flex; flex-direction: column; gap: 1rem; width: 100%; }

.donut-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 1.25rem;
  align-items: center;
}

.donut-svg-wrap {
  position: relative;
  width: 220px; height: 220px;
}

.donut-svg {
  width: 100%; height: 100%;
}

.seg-arc {
  transition: stroke-width 0.2s ease;
}

.donut-center {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center;
  pointer-events: none;
}
.center-big {
  font-size: 2.1rem; font-weight: 800; color: #111827;
  line-height: 1; transition: color 0.2s;
}
.center-lbl {
  font-size: 0.75rem; font-weight: 500; color: #9CA3AF; margin-top: 0.25rem;
}

.donut-legend-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.leg-item {
  cursor: pointer;
  transition: opacity 0.15s;
  padding: 0.5rem 0.6rem;
  border-radius: 10px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}
.leg-item:hover {
  background: #F9FAFB;
  border-color: #E5E7EB;
}
.leg-item.dimmed { opacity: 0.35; }

.leg-item-top {
  display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.3rem;
}
.leg-color-bar {
  width: 16px; height: 4px; border-radius: 2px; flex-shrink: 0;
}
.leg-name { font-size: 0.75rem; color: #6B7280; font-weight: 500; }

.leg-item-bottom {
  display: flex; align-items: baseline; gap: 0.4rem;
}
.leg-count {
  font-size: 1.35rem; font-weight: 800; color: #111827; line-height: 1;
}
.leg-pct {
  font-size: 0.72rem; font-weight: 600; color: #9CA3AF;
}

/* Bottom summary bar */
.donut-summary-bar { width: 100%; }
.summary-track {
  display: flex; height: 6px; border-radius: 999px; overflow: hidden; background: #F3F4F6;
}
.summary-seg {
  height: 100%;
  transition: width 0.4s ease;
}

/* Responsive */
@media (max-width: 480px) {
  .donut-layout { grid-template-columns: 1fr; justify-items: center; }
}
</style>
