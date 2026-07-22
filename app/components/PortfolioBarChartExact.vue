<template>
  <div class="genzchart-bar">
    <!-- Metric Summary Row -->
    <div class="bar-meta-row">
      <div class="bar-meta-left">
        <span class="meta-avg-label">Portfolio Avg</span>
        <span class="meta-avg-val">{{ avgCompletion }}%</span>
      </div>
      <div class="bar-meta-right">
        <span class="meta-range-badge">{{ minVal }}% – {{ maxVal }}%</span>
      </div>
    </div>

    <!-- Chart SVG Area -->
    <div class="bar-chart-svg-area" @mouseleave="hovered = null">
      <!-- Y-Axis Tick Labels -->
      <div class="y-axis">
        <span v-for="t in yAxis" :key="t" class="y-tick">{{ t }}%</span>
      </div>

      <!-- Bars + X-Axis -->
      <div class="bars-and-xaxis">
        <!-- Horizontal Grid Lines -->
        <div class="grid-lines">
          <div v-for="t in yAxis" :key="'gl'+t" class="grid-line"></div>
        </div>

        <!-- Column Bars -->
        <div class="columns-row">
          <div
            v-for="(p, i) in items"
            :key="p.name"
            class="col-group"
            @mouseenter="hovered = i"
          >
            <!-- Hover Tooltip -->
            <Transition name="tooltipfade">
              <div v-if="hovered === i" class="bar-tooltip">
                <span class="tip-dot" :style="{ background: p.color }"></span>
                <span class="tip-name">{{ p.name }}</span>
                <span class="tip-val">{{ p.val }}%</span>
              </div>
            </Transition>

            <!-- The Actual Bar -->
            <div class="bar-col-track">
              <div
                class="bar-col-fill"
                :style="{
                  height: `${(p.val / maxAxisVal) * 100}%`,
                  background: p.color,
                  opacity: hovered === null || hovered === i ? 1 : 0.8,
                  boxShadow: hovered === i ? `0 -4px 16px ${p.color}88` : `0 2px 8px ${p.color}33`
                }"
              >
                <span class="bar-val-text">{{ p.val }}%</span>
              </div>
            </div>

            <!-- X-Axis Name -->
            <span class="x-label" :class="{ active: hovered === i }">{{ p.short }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend Chips -->
    <div class="bar-legend-chips">
      <div v-for="p in items" :key="'lg'+p.name" class="chip">
        <span class="chip-dot" :style="{ background: p.color }"></span>
        <span class="chip-lbl">{{ p.name }}</span>
        <span class="chip-pct">{{ p.val }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  projects: { type: Array, default: () => [] }
})

const hovered = ref(null)

const COLORS = ['#6366F1','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#A855F7','#14B8A6']

const items = computed(() => {
  const src = props.projects.length > 0 ? props.projects : [
    { companyName: 'Barena ERP', completionPct: 65 },
    { companyName: 'DevOps', completionPct: 92 },
    { companyName: 'FLEXA ERP', completionPct: 43 },
    { companyName: 'Glow Box', completionPct: 78 },
    { companyName: 'Honda POC', completionPct: 55 },
    { companyName: 'IPOPS', completionPct: 88 },
  ]
  return src.slice(0, 8).map((p, i) => ({
    name: p.companyName,
    short: (p.companyName || '').substring(0, 6),
    val: p.completionPct || 0,
    color: COLORS[i % COLORS.length]
  }))
})

const avgCompletion = computed(() => {
  if (!items.value.length) return 0
  return Math.round(items.value.reduce((s, i) => s + i.val, 0) / items.value.length)
})
const minVal = computed(() => items.value.length ? Math.min(...items.value.map(i => i.val)) : 0)
const maxVal = computed(() => items.value.length ? Math.max(...items.value.map(i => i.val)) : 100)
const maxAxisVal = computed(() => {
  const top = Math.ceil((maxVal.value + 10) / 20) * 20
  return Math.min(top, 100)
})
const yAxis = computed(() => {
  const steps = []
  for (let v = maxAxisVal.value; v >= 0; v -= 20) steps.push(v)
  return steps
})
</script>

<style scoped>
.genzchart-bar { display: flex; flex-direction: column; gap: 0.85rem; width: 100%; }

.bar-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.meta-avg-label { font-size: 0.72rem; color: #9CA3AF; font-weight: 500; }
.meta-avg-val { font-size: 1.4rem; font-weight: 800; color: #111827; margin-left: 0.4rem; }
.meta-range-badge {
  font-size: 0.72rem; font-weight: 600; color: #6B7280;
  background: #F3F4F6; padding: 0.2rem 0.6rem; border-radius: 999px;
}

.bar-chart-svg-area {
  position: relative;
  display: flex;
  height: 200px;
  gap: 0;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 36px;
  flex-shrink: 0;
  padding-bottom: 22px;
}
.y-tick { font-size: 0.68rem; font-weight: 500; color: #9CA3AF; text-align: right; }

.bars-and-xaxis {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.grid-lines {
  position: absolute;
  top: 0; left: 0; right: 0;
  bottom: 22px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.grid-line {
  width: 100%; height: 1px;
  background: #F3F4F6;
}

.columns-row {
  position: relative;
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 6px;
  padding-bottom: 22px;
}

.col-group {
  position: relative;
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
}

.bar-tooltip {
  position: absolute;
  top: -40px;
  left: 50%; transform: translateX(-50%);
  background: #1E293B;
  border-radius: 8px;
  padding: 0.3rem 0.65rem;
  display: flex; align-items: center; gap: 0.4rem;
  white-space: nowrap;
  z-index: 30;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}
.tip-dot { width: 7px; height: 7px; border-radius: 50%; }
.tip-name { font-size: 0.7rem; color: #CBD5E1; font-weight: 500; }
.tip-val { font-size: 0.78rem; font-weight: 800; color: #F8FAFC; }

.bar-col-track {
  width: 100%;
  height: 100%;
  display: flex; align-items: flex-end;
}
.bar-col-fill {
  width: 100%;
  border-radius: 8px 8px 0 0;
  transition: height 0.4s cubic-bezier(.4,0,.2,1), background 0.2s, box-shadow 0.2s;
  min-height: 4px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 4px;
}

.bar-val-text {
  font-size: 0.72rem;
  font-weight: 800;
  color: #000000;
  line-height: 1;
  white-space: nowrap;
  pointer-events: none;
}

.x-label {
  position: absolute; bottom: 0;
  font-size: 0.72rem; font-weight: 800; color: #000000;
  transition: color 0.15s, font-weight 0.15s;
  white-space: nowrap;
}
.x-label.active { color: #000000; font-weight: 900; }

.bar-legend-chips {
  display: flex; flex-wrap: wrap; gap: 0.5rem;
}
.chip {
  display: flex; align-items: center; gap: 0.35rem;
  background: #F9FAFB; border: 1px solid #E5E7EB;
  border-radius: 999px; padding: 0.2rem 0.55rem;
  font-size: 0.7rem;
}
.chip-dot { width: 7px; height: 7px; border-radius: 50%; }
.chip-lbl { color: #4B5563; font-weight: 500; }
.chip-pct { color: #111827; font-weight: 700; }

/* Transition */
.tooltipfade-enter-active, .tooltipfade-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.tooltipfade-enter-from, .tooltipfade-leave-to { opacity: 0; transform: translateX(-50%) translateY(4px); }
</style>
