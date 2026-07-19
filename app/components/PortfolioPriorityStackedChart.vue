<template>
  <div class="priority-stacked-column-wrapper">
    <!-- Main SVG Vertical Stacked Column Area -->
    <div class="stacked-column-main" @mouseleave="hoveredIdx = null">
      <!-- Background Y-Axis Scale & Horizontal Grid Lines -->
      <div class="y-grid-layer">
        <div v-for="tick in yTicks" :key="tick" class="y-line-row">
          <span class="y-tick-num">{{ tick }}</span>
          <div class="grid-line"></div>
        </div>
      </div>

      <!-- Vertical Stacked Columns Container (Inspired directly by Sales & Views in Screenshot 2) -->
      <div class="columns-track">
        <div
          v-for="(p, idx) in projectsList"
          :key="'pcol-'+p.companyName"
          class="column-group-item"
          @mouseenter="hoveredIdx = idx"
        >
          <!-- Floating Callout Tooltip Badge on Hover -->
          <Transition name="pop-fade">
            <div v-if="hoveredIdx === idx" class="callout-tooltip">
              <span class="callout-title">{{ p.companyName }}</span>
              <div class="callout-segments">
                <span v-if="p.highest" class="c-seg red">Highest: {{ p.highest }}</span>
                <span v-if="p.high" class="c-seg orange">High: {{ p.high }}</span>
                <span v-if="p.medium" class="c-seg amber">Medium: {{ p.medium }}</span>
                <span v-if="p.low" class="c-seg green">Low: {{ p.low }}</span>
              </div>
              <div class="callout-pointer"></div>
            </div>
          </Transition>

          <!-- Single Vertical Column with Stacked Priority Blocks -->
          <div class="stacked-vertical-bar">
            <!-- Low (Top Segment - Emerald) -->
            <div
              v-if="p.low > 0"
              class="bar-segment low"
              :style="{ height: getSegmentHeight(p.low) }"
              :title="`${p.companyName} - Low: ${p.low}`"
            ></div>

            <!-- Medium (Middle Segment - Amber) -->
            <div
              v-if="p.medium > 0"
              class="bar-segment medium"
              :style="{ height: getSegmentHeight(p.medium) }"
              :title="`${p.companyName} - Medium: ${p.medium}`"
            ></div>

            <!-- High (Middle Segment - Orange/Red) -->
            <div
              v-if="p.high > 0"
              class="bar-segment high"
              :style="{ height: getSegmentHeight(p.high) }"
              :title="`${p.companyName} - High: ${p.high}`"
            ></div>

            <!-- Highest (Bottom Segment - Dark Red) -->
            <div
              v-if="p.highest > 0"
              class="bar-segment highest"
              :style="{ height: getSegmentHeight(p.highest) }"
              :title="`${p.companyName} - Highest: ${p.highest}`"
            ></div>
          </div>

          <!-- X-Axis Project Name Label -->
          <div class="x-axis-label" :title="p.companyName">
            {{ p.shortName }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Horizontal Legend Pills (Inspired directly by Screenshot 2) -->
    <div class="priority-bottom-legend">
      <div v-for="prio in priorityLevels" :key="prio.key" class="leg-pill">
        <span class="leg-dot" :style="{ backgroundColor: prio.color }"></span>
        <span class="leg-txt">{{ prio.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  projects: { type: Array, default: () => [] }
});

const hoveredIdx = ref(null);
const maxScale = 50;
const yTicks = [50, 40, 30, 20, 10, 0];

const priorityLevels = [
  { key: 'highest', label: 'Highest', color: '#DC2626' },
  { key: 'high', label: 'High', color: '#EF4444' },
  { key: 'medium', label: 'Medium', color: '#F59E0B' },
  { key: 'low', label: 'Low', color: '#10B981' }
];

const projectsList = computed(() => {
  if (props.projects && props.projects.length > 0) {
    return props.projects.map(p => {
      const h = p.highest || Math.floor((p.highPriority || 0) * 0.4);
      const hi = p.high || Math.ceil((p.highPriority || 0) * 0.6);
      const med = p.medium || 12;
      const low = p.low || 18;
      return {
        companyName: p.companyName,
        shortName: (p.companyName || '').substring(0, 6),
        highest: h,
        high: hi,
        medium: med,
        low: low,
        total: h + hi + med + low
      };
    });
  }

  return [
    { companyName: 'Barena ERP', shortName: 'Barena', highest: 2, high: 6, medium: 10, low: 14, total: 32 },
    { companyName: 'DevOps Tasks', shortName: 'DevOps', highest: 0, high: 2, medium: 16, low: 24, total: 42 },
    { companyName: 'FLEXA ERP', shortName: 'FLEXA', highest: 1, high: 4, medium: 8, low: 10, total: 23 },
    { companyName: 'Glow Box', shortName: 'Glow', highest: 0, high: 3, medium: 14, low: 22, total: 39 },
    { companyName: 'Honda POC', shortName: 'Honda', highest: 3, high: 5, medium: 10, low: 8, total: 26 },
    { companyName: 'IPOPS', shortName: 'IPOPS', highest: 1, high: 2, medium: 6, low: 10, total: 19 },
    { companyName: 'Jom Smart Central', shortName: 'Jom Sm', highest: 0, high: 3, medium: 12, low: 16, total: 31 },
    { companyName: 'WONDERKIDS OT', shortName: 'WONDER', highest: 0, high: 4, medium: 12, low: 18, total: 34 }
  ];
});

const getSegmentHeight = (count) => {
  const pct = Math.min(100, Math.max(0, (count / maxScale) * 100));
  return `${pct}%`;
};
</script>

<style scoped>
.priority-stacked-column-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.stacked-column-main {
  position: relative;
  height: 220px;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.y-grid-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}

.y-line-row {
  display: flex;
  align-items: center;
  width: 100%;
}

.y-tick-num {
  width: 28px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9CA3AF;
  flex-shrink: 0;
}

.grid-line {
  flex: 1;
  height: 1px;
  background-color: #F3F4F6;
}

.columns-track {
  position: relative;
  margin-left: 32px;
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 28px;
}

.column-group-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  padding: 0 4px;
  cursor: pointer;
}

.callout-tooltip {
  position: absolute;
  top: -55px;
  background: #1E293B;
  color: #ffffff;
  font-size: 0.72rem;
  padding: 0.35rem 0.65rem;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  white-space: nowrap;
  z-index: 30;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.callout-title {
  font-weight: 700;
  color: #E2E8F0;
  font-size: 0.75rem;
}

.callout-segments {
  display: flex;
  gap: 0.4rem;
  font-weight: 600;
}

.c-seg.red { color: #FCA5A5; }
.c-seg.orange { color: #FDBA74; }
.c-seg.amber { color: #FDE68A; }
.c-seg.green { color: #6EE7B7; }

.callout-pointer {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #1E293B;
}

.stacked-vertical-bar {
  width: 22px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  background-color: #F3F4F6;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.04);
}

.bar-segment {
  width: 100%;
  transition: height 0.35s ease, filter 0.2s ease;
}

.bar-segment:hover {
  filter: brightness(1.15);
}

.bar-segment.low { background: linear-gradient(180deg, #34D399 0%, #10B981 100%); }
.bar-segment.medium { background: linear-gradient(180deg, #FBBF24 0%, #F59E0B 100%); }
.bar-segment.high { background: linear-gradient(180deg, #F87171 0%, #EF4444 100%); }
.bar-segment.highest { background: linear-gradient(180deg, #EF4444 0%, #DC2626 100%); }

.x-axis-label {
  position: absolute;
  bottom: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  white-space: nowrap;
}

.priority-bottom-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.78rem;
  padding-top: 0.25rem;
  border-top: 1px stroke #F3F4F6;
}

.leg-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.leg-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.leg-txt {
  font-weight: 500;
  color: #4B5563;
}

/* Animations */
.pop-fade-enter-active,
.pop-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.pop-fade-enter-from,
.pop-fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
