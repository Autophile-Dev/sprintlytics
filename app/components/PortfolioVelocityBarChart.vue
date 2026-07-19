<template>
  <div class="velocity-chart-wrapper">
    <!-- Main SVG Column Chart Grid -->
    <div class="vchart-main" @mouseleave="hoveredIdx = null">
      <!-- Background Y-Axis Grid Lines & Tick Labels -->
      <div class="y-grid-layer">
        <div v-for="tick in yTicks" :key="tick" class="y-line-row">
          <span class="y-tick-num">{{ tick }}</span>
          <div class="grid-line"></div>
        </div>
      </div>

      <!-- Vertical Columns Container -->
      <div class="columns-track">
        <div
          v-for="(p, idx) in projectsList"
          :key="'vcol-'+p.companyName"
          class="column-group-item"
          @mouseenter="hoveredIdx = idx"
        >
          <!-- Floating Blue Callout Tooltip Badge (Directly Inspired by N300,000 Callout in Screenshot 1) -->
          <Transition name="pop-fade">
            <div v-if="hoveredIdx === idx" class="callout-tooltip">
              <span class="callout-val">{{ p.velocity || 0 }} pts</span>
              <div class="callout-pointer"></div>
            </div>
          </Transition>

          <!-- Dual Vertical Column Bars -->
          <div class="bar-pair">
            <!-- Target Bar (Background Light Bar) -->
            <div class="single-bar target-bar">
              <div
                class="bar-fill target"
                :style="{ height: getBarHeight(targetPoints) }"
              ></div>
            </div>

            <!-- Delivered Bar (Primary Solid Emerald Bar) -->
            <div class="single-bar delivered-bar">
              <div
                class="bar-fill delivered"
                :class="{ active: hoveredIdx === idx }"
                :style="{ height: getBarHeight(p.velocity || 0) }"
              ></div>
            </div>
          </div>

          <!-- X-Axis Project Name Label -->
          <div class="x-axis-label" :title="p.companyName">
            {{ p.shortName }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Horizontal Legend Pills (Inspired by Screenshot 2 Legends) -->
    <div class="vchart-bottom-legend">
      <div class="leg-pill">
        <span class="leg-dot emerald"></span>
        <span class="leg-txt">Delivered Velocity</span>
      </div>
      <div class="leg-pill">
        <span class="leg-dot gray"></span>
        <span class="leg-txt">Target Points</span>
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
const targetPoints = 35;
const yTicks = [50, 40, 30, 20, 10, 0];

const projectsList = computed(() => {
  if (props.projects && props.projects.length > 0) {
    return props.projects.map(p => ({
      companyName: p.companyName,
      shortName: (p.companyName || '').substring(0, 6),
      velocity: p.velocity || 0
    }));
  }
  return [
    { companyName: 'Barena ERP', shortName: 'Barena', velocity: 12 },
    { companyName: 'DevOps Tasks', shortName: 'DevOps', velocity: 42 },
    { companyName: 'FLEXA ERP', shortName: 'FLEXA', velocity: 18 },
    { companyName: 'Glow Box', shortName: 'Glow', velocity: 48 },
    { companyName: 'Honda POC', shortName: 'Honda', velocity: 22 },
    { companyName: 'IPOPS', shortName: 'IPOPS', velocity: 15 },
    { companyName: 'Jom Smart Central', shortName: 'Jom Sm', velocity: 30 },
    { companyName: 'WONDERKIDS OT', shortName: 'WONDER', velocity: 36 }
  ];
});

const getBarHeight = (val) => {
  const pct = Math.min(100, Math.max(6, (val / maxScale) * 100));
  return `${pct}%`;
};
</script>

<style scoped>
.velocity-chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.vchart-main {
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
  top: -34px;
  background: #2563EB;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.28rem 0.65rem;
  border-radius: 8px;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  white-space: nowrap;
  z-index: 20;
}

.callout-pointer {
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: #2563EB;
}

.bar-pair {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  height: 100%;
}

.single-bar {
  width: 14px;
  height: 100%;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  border-radius: 6px 6px 0 0;
  transition: height 0.35s ease, background 0.2s ease, transform 0.15s ease;
}

.bar-fill.target {
  background-color: #E5E7EB;
}

.bar-fill.delivered {
  background: linear-gradient(180deg, #2563EB 0%, #1D4ED8 100%);
}

.bar-fill.delivered.active {
  background: linear-gradient(180deg, #3B82F6 0%, #1E40AF 100%);
  transform: scaleY(1.03);
}

.x-axis-label {
  position: absolute;
  bottom: 0;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6B7280;
  white-space: nowrap;
}

.vchart-bottom-legend {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.78rem;
}

.leg-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.leg-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.leg-dot.emerald { background-color: #2563EB; }
.leg-dot.gray { background-color: #E5E7EB; }

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
