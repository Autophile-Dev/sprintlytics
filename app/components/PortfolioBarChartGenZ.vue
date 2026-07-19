<template>
  <div class="genz-bar-wrapper">
    <!-- Top Dataset Legend Pill -->
    <div class="genz-legend-top">
      <div class="legend-badge">
        <span class="legend-color-box"></span>
        <span class="legend-label-text">Completion Rate (%)</span>
      </div>
    </div>

    <!-- Main Chart Area with Y-Axis and Columns -->
    <div class="genz-bar-chart-area" @mouseleave="hoveredIdx = null">
      <!-- Background Y-Axis Scale & Horizontal Grid Lines -->
      <div class="y-grid-layer">
        <div v-for="tick in yTicks" :key="tick" class="y-grid-row">
          <span class="y-tick-num">{{ tick }}</span>
          <div class="y-grid-line"></div>
        </div>
      </div>

      <!-- Vertical Bars Container -->
      <div class="bars-container">
        <div
          v-for="(p, idx) in barData"
          :key="'genz-bar-'+p.name"
          class="bar-column-group"
          @mouseenter="hoveredIdx = idx"
        >
          <!-- Hover Tooltip Box (Inspired by Screenshot 1 Tooltip) -->
          <Transition name="fade-pop">
            <div v-if="hoveredIdx === idx" class="genz-tooltip-box">
              <span class="tooltip-title">{{ p.fullName }}</span>
              <div class="tooltip-detail">
                <span class="t-color-square" :style="{ backgroundColor: p.borderColor }"></span>
                <span>Completion: <strong>{{ p.val }}%</strong></span>
              </div>
            </div>
          </Transition>

          <!-- Rectangular Vertical Column Bar with Pastel Fill & Colored Border -->
          <div class="bar-column-track">
            <div
              class="bar-rect-fill"
              :style="{
                height: getBarHeight(p.val),
                backgroundColor: p.bgColor,
                borderColor: p.borderColor
              }"
            ></div>
          </div>

          <!-- X-Axis Label -->
          <div class="x-axis-label" :title="p.fullName">
            {{ p.shortName }}
          </div>
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

const hoveredIdx = ref(null);
const yTicks = [100, 80, 60, 40, 20, 0];

const colorPalettes = [
  { bg: 'rgba(254, 226, 226, 0.75)', border: '#F43F5E' }, // Pink
  { bg: 'rgba(255, 237, 213, 0.75)', border: '#F97316' }, // Orange
  { bg: 'rgba(254, 243, 199, 0.75)', border: '#F59E0B' }, // Yellow
  { bg: 'rgba(224, 242, 254, 0.75)', border: '#06B6D4' }, // Cyan
  { bg: 'rgba(219, 234, 254, 0.75)', border: '#3B82F6' }, // Blue
  { bg: 'rgba(243, 232, 255, 0.75)', border: '#A855F7' }, // Purple
  { bg: 'rgba(236, 253, 245, 0.75)', border: '#10B981' }, // Emerald
  { bg: 'rgba(243, 244, 246, 0.75)', border: '#9CA3AF' }  // Gray
];

const barData = computed(() => {
  const source = props.projects && props.projects.length > 0 ? props.projects : [
    { companyName: 'Barena ERP', completionPct: 65 },
    { companyName: 'DevOps Tasks', completionPct: 90 },
    { companyName: 'FLEXA ERP', completionPct: 45 },
    { companyName: 'Glow Box', completionPct: 97 },
    { companyName: 'Honda POC', completionPct: 28 },
    { companyName: 'IPOPS', completionPct: 35 },
    { companyName: 'Jom Smart Central', completionPct: 47 },
    { companyName: 'WONDERKIDS OT', completionPct: 67 }
  ];

  return source.map((p, idx) => {
    const palette = colorPalettes[idx % colorPalettes.length];
    return {
      name: p.companyName,
      fullName: p.companyName,
      shortName: (p.companyName || '').substring(0, 6),
      val: p.completionPct || 0,
      bgColor: palette.bg,
      borderColor: palette.border
    };
  });
});

const getBarHeight = (val) => {
  const pct = Math.min(100, Math.max(4, val));
  return `${pct}%`;
};
</script>

<style scoped>
.genz-bar-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  width: 100%;
}

.genz-legend-top {
  display: flex;
  justify-content: center;
  margin-bottom: 0.25rem;
}

.legend-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.6rem;
  border: 1px solid #F43F5E;
  background-color: rgba(254, 226, 226, 0.4);
  border-radius: 4px;
}

.legend-color-box {
  width: 12px;
  height: 12px;
  background-color: rgba(254, 226, 226, 0.9);
  border: 1px solid #F43F5E;
  border-radius: 2px;
}

.legend-label-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.genz-bar-chart-area {
  position: relative;
  height: 230px;
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

.y-grid-row {
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

.y-grid-line {
  flex: 1;
  height: 1px;
  background-color: #E5E7EB;
}

.bars-container {
  position: relative;
  margin-left: 32px;
  flex: 1;
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-bottom: 28px;
}

.bar-column-group {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
  padding: 0 4px;
  cursor: pointer;
  flex: 1;
}

.genz-tooltip-box {
  position: absolute;
  top: -42px;
  background: rgba(30, 41, 59, 0.92);
  color: #ffffff;
  font-size: 0.75rem;
  padding: 0.35rem 0.65rem;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.tooltip-title {
  font-weight: 700;
  font-size: 0.78rem;
  color: #F8FAFC;
}

.tooltip-detail {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.t-color-square {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.bar-column-track {
  width: 100%;
  max-width: 44px;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.bar-rect-fill {
  width: 100%;
  border-style: solid;
  border-width: 1.5px;
  border-radius: 2px 2px 0 0;
  transition: height 0.4s ease, filter 0.2s ease;
}

.bar-rect-fill:hover {
  filter: brightness(0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.x-axis-label {
  position: absolute;
  bottom: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  white-space: nowrap;
}

/* Animations */
.fade-pop-enter-active,
.fade-pop-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-pop-enter-from,
.fade-pop-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
