<template>
  <div class="line-chart-wrapper">
    <!-- Chart Top Info Header -->
    <div class="chart-top-info">
      <div class="main-metric">
        <span class="metric-val">{{ activeMetricVal }}</span>
        <span class="metric-trend positive">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
          </svg>
          +4.8% from prev period
        </span>
      </div>
      <div class="time-filter-pills">
        <button
          v-for="t in ['1W', '1M', '3M', '1Y']"
          :key="t"
          class="time-pill"
          :class="{ active: activeTime === t }"
          @click="activeTime = t"
        >
          {{ t }}
        </button>
      </div>
    </div>

    <!-- SVG Area Line Chart -->
    <div class="svg-container" @mousemove="handleMouseMove" @mouseleave="hoverIdx = null">
      <svg :viewBox="`0 0 ${width} ${height}`" class="line-svg">
        <defs>
          <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#059669" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#059669" stop-opacity="0.00" />
          </linearGradient>
          <linearGradient id="blueAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563EB" stop-opacity="0.20" />
            <stop offset="100%" stop-color="#2563EB" stop-opacity="0.00" />
          </linearGradient>
        </defs>

        <!-- Y-Axis Grid Lines & Labels -->
        <g class="y-grid">
          <g v-for="grid in yGridLines" :key="grid.val">
            <line :x1="margin.left" :y1="grid.y" :x2="width - margin.right" :y2="grid.y" stroke="#E5E7EB" stroke-width="1" stroke-dasharray="3,3" />
            <text :x="margin.left - 8" :y="grid.y + 4" text-anchor="end" fill="#9CA3AF" font-size="10" font-weight="500">{{ grid.val }}%</text>
          </g>
        </g>

        <!-- Gradient Area Under Curve -->
        <path :d="areaPath" fill="url(#emeraldAreaGradient)" />
        <path :d="completionAreaPath" fill="url(#blueAreaGradient)" />

        <!-- Main Smooth Curve Lines (No permanent dots) -->
        <path :d="linePath" fill="none" stroke="#059669" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <path :d="completionLinePath" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="5,4" />

        <!-- Vertical Guide Line & Hover Dots on Hover -->
        <g v-if="hoverIdx !== null">
          <!-- Vertical Crosshair Line -->
          <line
            :x1="points[hoverIdx].x"
            :y1="margin.top"
            :x2="points[hoverIdx].x"
            :y2="height - margin.bottom"
            stroke="#64748B"
            stroke-width="1.5"
            stroke-dasharray="4,4"
          />

          <!-- Active Hover Dot on Health Line -->
          <circle :cx="points[hoverIdx].x" :cy="points[hoverIdx].y" r="5" fill="#059669" stroke="#ffffff" stroke-width="2.5" />
          <!-- Active Hover Dot on Completion Line -->
          <circle :cx="completionPoints[hoverIdx].x" :cy="completionPoints[hoverIdx].y" r="5" fill="#2563EB" stroke="#ffffff" stroke-width="2.5" />
        </g>

        <!-- X-Axis Labels -->
        <g class="x-grid">
          <text
            v-for="(pt, idx) in points"
            :key="'x-'+idx"
            :x="pt.x"
            :y="height - 8"
            text-anchor="middle"
            fill="#6B7280"
            font-size="10.5"
            font-weight="500"
          >
            {{ chartData[idx]?.shortName }}
          </text>
        </g>
      </svg>

      <!-- Floating Dual-Value Tooltip Box -->
      <div
        v-if="hoverIdx !== null"
        class="chart-tooltip-popup"
        :style="tooltipStyle"
      >
        <div class="tooltip-header">{{ chartData[hoverIdx]?.name }}</div>
        <div class="tooltip-row emerald">
          <span class="dot emerald"></span>
          <span class="label">Health Score:</span>
          <span class="val font-bold">{{ chartData[hoverIdx]?.val }}%</span>
        </div>
        <div class="tooltip-row blue">
          <span class="dot blue"></span>
          <span class="label">Completion Rate:</span>
          <span class="val font-bold">{{ chartData[hoverIdx]?.completion }}%</span>
        </div>
      </div>
    </div>

    <!-- Bottom Action Footer Row -->
    <div class="chart-bottom-footer">
      <div class="footer-legend">
        <div class="leg-item"><span class="leg-indicator emerald"></span> Health Score (%)</div>
        <div class="leg-item"><span class="leg-indicator blue"></span> Completion Rate (%)</div>
      </div>
      <button class="btn-report-link">View detailed report ›</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  reports: { type: Array, default: () => [] }
});

const activeTime = ref('1M');
const hoverIdx = ref(null);

const width = 560;
const height = 210;
const margin = { top: 25, right: 20, bottom: 28, left: 35 };

const yGridLines = [
  { val: 100, y: margin.top },
  { val: 75, y: margin.top + (height - margin.top - margin.bottom) * 0.25 },
  { val: 50, y: margin.top + (height - margin.top - margin.bottom) * 0.5 },
  { val: 25, y: margin.top + (height - margin.top - margin.bottom) * 0.75 },
  { val: 0, y: height - margin.bottom }
];

const chartData = computed(() => {
  if (props.reports && props.reports.length >= 3) {
    return props.reports.slice(0, 8).map(r => ({
      name: r.companyName || r.periodLabel || 'Report',
      shortName: (r.companyName || r.periodLabel || 'Rpt').substring(0, 6),
      val: r.kpis?.healthScore || r.healthScore || 50,
      completion: r.kpis?.completionPct || r.completionPct || 40
    }));
  }
  return [
    { name: 'DevOps Tasks', shortName: 'DevOps', val: 61, completion: 90 },
    { name: 'IPOPS', shortName: 'IPOPS', val: 25, completion: 0 },
    { name: 'Glow Box', shortName: 'Glow Box', val: 64, completion: 97 },
    { name: 'V-SARA', shortName: 'V-SARA', val: 23, completion: 40 },
    { name: 'Jom Food', shortName: 'Jom Food', val: 25, completion: 40 },
    { name: 'Barena ERP', shortName: 'Barena', val: 15, completion: 45 },
    { name: 'Jom Smart Central', shortName: 'Jom Smart', val: 47, completion: 50 },
    { name: 'WONDERKIDS OT', shortName: 'WONDER', val: 52, completion: 67 }
  ];
});

const activeMetricVal = computed(() => {
  const last = chartData.value[chartData.value.length - 1];
  return last ? `${last.val}%` : '52%';
});

const points = computed(() => {
  const data = chartData.value;
  const count = data.length || 1;
  const stepX = (width - margin.left - margin.right) / Math.max(1, count - 1);

  return data.map((d, i) => {
    const x = margin.left + i * stepX;
    const y = height - margin.bottom - ((d.val / 100) * (height - margin.top - margin.bottom));
    return { x, y };
  });
});

const completionPoints = computed(() => {
  const data = chartData.value;
  const count = data.length || 1;
  const stepX = (width - margin.left - margin.right) / Math.max(1, count - 1);

  return data.map((d, i) => {
    const x = margin.left + i * stepX;
    const y = height - margin.bottom - (((d.completion || 0) / 100) * (height - margin.top - margin.bottom));
    return { x, y };
  });
});

const getBezierPath = (pts) => {
  if (!pts || pts.length === 0) return '';
  return pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cx = (prev.x + pt.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
  }, '');
};

const linePath = computed(() => getBezierPath(points.value));
const completionLinePath = computed(() => getBezierPath(completionPoints.value));

const areaPath = computed(() => {
  const pts = points.value;
  if (!pts || pts.length === 0) return '';
  const line = getBezierPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  const bottomY = height - margin.bottom;
  return `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
});

const completionAreaPath = computed(() => {
  const pts = completionPoints.value;
  if (!pts || pts.length === 0) return '';
  const line = getBezierPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  const bottomY = height - margin.bottom;
  return `${line} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
});

const handleMouseMove = (event) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const mouseX = ((event.clientX - rect.left) / rect.width) * width;
  
  let closestIdx = 0;
  let minDiff = Infinity;

  points.value.forEach((pt, idx) => {
    const diff = Math.abs(pt.x - mouseX);
    if (diff < minDiff) {
      minDiff = diff;
      closestIdx = idx;
    }
  });

  hoverIdx.value = closestIdx;
};

const tooltipStyle = computed(() => {
  if (hoverIdx.value === null) return {};
  const pt = points.value[hoverIdx.value];
  const pctX = (pt.x / width) * 100;
  const isRightSide = pctX > 60;
  
  return {
    left: `${pctX}%`,
    top: `20px`,
    transform: isRightSide ? 'translateX(-105%)' : 'translateX(10%)'
  };
});
</script>

<style scoped>
.line-chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.chart-top-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.main-metric {
  display: flex;
  align-items: baseline;
  gap: 0.625rem;
}

.metric-val {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
}

.metric-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

.metric-trend.positive {
  background-color: #ECFDF5;
  color: #059669;
}

.time-filter-pills {
  display: flex;
  background-color: #F3F4F6;
  padding: 0.2rem;
  border-radius: 8px;
  gap: 0.15rem;
}

.time-pill {
  border: none;
  background: transparent;
  padding: 0.25rem 0.6rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: #6B7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.time-pill.active {
  background: #ffffff;
  color: #059669;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}

.svg-container {
  width: 100%;
  position: relative;
}

.line-svg {
  width: 100%;
  height: auto;
  overflow: visible;
}

.chart-tooltip-popup {
  position: absolute;
  background: #1E293B;
  color: #ffffff;
  padding: 0.625rem 0.875rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 155px;
  transition: left 0.1s ease, top 0.1s ease;
}

.tooltip-header {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94A3B8;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.25rem;
  margin-bottom: 0.15rem;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot.emerald { background-color: #10B981; }
.dot.blue { background-color: #3B82F6; }

.tooltip-row.emerald .val { color: #34D399; }
.tooltip-row.blue .val { color: #93C5FD; }

.chart-bottom-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.5rem;
  font-size: 0.78rem;
}

.footer-legend {
  display: flex;
  gap: 1.25rem;
  color: #4B5563;
}

.leg-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.leg-indicator {
  width: 12px;
  height: 3px;
  border-radius: 9999px;
}

.leg-indicator.emerald { background-color: #059669; }
.leg-indicator.blue { background-color: #2563EB; }

.btn-report-link {
  border: none;
  background: none;
  color: #059669;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-report-link:hover {
  text-decoration: underline;
}
</style>
