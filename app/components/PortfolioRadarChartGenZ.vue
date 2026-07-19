<template>
  <div class="genz-radar-wrapper">
    <!-- Top Legend Badges (Directly matching Screenshot 3 top legend style) -->
    <div class="genz-radar-legend">
      <div class="radar-leg-item pink">
        <span class="leg-box pink"></span>
        <span class="leg-txt">Current Sprint</span>
      </div>
      <div class="radar-leg-item blue">
        <span class="leg-box blue"></span>
        <span class="leg-txt">Target Benchmark</span>
      </div>
    </div>

    <!-- Polygon Spider Radar Chart (Directly matching Screenshot 3 Radar Chart) -->
    <div class="radar-svg-container">
      <svg viewBox="0 0 300 260" class="radar-svg">
        <!-- Concentric Mesh Hexagon Rings -->
        <g class="mesh-rings">
          <polygon
            v-for="ring in [1, 0.8, 0.6, 0.4, 0.2]"
            :key="ring"
            :points="getMeshPolygonPoints(ring)"
            fill="none"
            stroke="#E5E7EB"
            stroke-width="1"
          />
        </g>

        <!-- Spokes Lines from Center to Perimeter Vertices -->
        <g class="mesh-spokes">
          <line
            v-for="(axis, idx) in axes"
            :key="'spoke-'+idx"
            :x1="center.x"
            :y1="center.y"
            :x2="getAxisPoint(idx, 1).x"
            :y2="getAxisPoint(idx, 1).y"
            stroke="#E5E7EB"
            stroke-width="1"
          />
        </g>

        <!-- Center Ticks Labels (20, 40, 60, 80, 100) -->
        <g class="mesh-tick-labels">
          <text
            v-for="ring in [0.2, 0.4, 0.6, 0.8, 1]"
            :key="'tlabel-'+ring"
            :x="center.x + 3"
            :y="center.y - (ring * radius) + 4"
            fill="#9CA3AF"
            font-size="9"
            font-weight="500"
          >
            {{ ring * 100 }}
          </text>
        </g>

        <!-- Filled Radar Dataset 2 (Blue - Target Benchmark) -->
        <polygon
          :points="dataset2PolygonPoints"
          fill="rgba(59, 130, 246, 0.18)"
          stroke="#3B82F6"
          stroke-width="2"
        />

        <!-- Filled Radar Dataset 1 (Pink - Current Sprint) -->
        <polygon
          :points="dataset1PolygonPoints"
          fill="rgba(244, 63, 94, 0.20)"
          stroke="#F43F5E"
          stroke-width="2"
        />

        <!-- Dataset 1 Dots on Vertices -->
        <g class="dataset1-dots">
          <circle
            v-for="(pt, idx) in dataset1Points"
            :key="'d1-'+idx"
            :cx="pt.x"
            :cy="pt.y"
            r="3.5"
            fill="#F43F5E"
            stroke="#ffffff"
            stroke-width="1.5"
          >
            <title>{{ axes[idx] }}: {{ dataset1Values[idx] }}%</title>
          </circle>
        </g>

        <!-- Dataset 2 Dots on Vertices -->
        <g class="dataset2-dots">
          <circle
            v-for="(pt, idx) in dataset2Points"
            :key="'d2-'+idx"
            :cx="pt.x"
            :cy="pt.y"
            r="3.5"
            fill="#3B82F6"
            stroke="#ffffff"
            stroke-width="1.5"
          >
            <title>{{ axes[idx] }}: {{ dataset2Values[idx] }}%</title>
          </circle>
        </g>

        <!-- Perimeter Axis Text Labels (Eating, Drinking, Sleeping, Designing, Coding, Cycling) -->
        <g class="axis-text-labels">
          <text
            v-for="(axis, idx) in axes"
            :key="'label-'+idx"
            :x="getLabelPoint(idx).x"
            :y="getLabelPoint(idx).y"
            :text-anchor="getLabelAnchor(idx)"
            fill="#4B5563"
            font-size="10"
            font-weight="600"
          >
            {{ axis }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  metrics: { type: Object, default: () => ({}) }
});

const center = { x: 150, y: 130 };
const radius = 85;

const axes = [
  'Health Score',
  'Completion',
  'Velocity Rate',
  'Code Quality',
  'Team Balance',
  'Risk Mitigation'
];

const dataset1Values = computed(() => [
  props.metrics.healthScore || 72,
  props.metrics.completionPct || 78,
  props.metrics.velocityRate || 65,
  82,
  88,
  70
]);

const dataset2Values = computed(() => [
  85,
  90,
  80,
  75,
  75,
  85
]);

const numAxes = axes.length;

const getAxisPoint = (index, factor = 1) => {
  const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
  const r = radius * factor;
  return {
    x: center.x + r * Math.cos(angle),
    y: center.y + r * Math.sin(angle)
  };
};

const getMeshPolygonPoints = (factor) => {
  return Array.from({ length: numAxes })
    .map((_, idx) => {
      const pt = getAxisPoint(idx, factor);
      return `${pt.x},${pt.y}`;
    })
    .join(' ');
};

const dataset1Points = computed(() => {
  return dataset1Values.value.map((val, idx) => {
    return getAxisPoint(idx, val / 100);
  });
});

const dataset2Points = computed(() => {
  return dataset2Values.value.map((val, idx) => {
    return getAxisPoint(idx, val / 100);
  });
});

const dataset1PolygonPoints = computed(() => {
  return dataset1Points.value.map(pt => `${pt.x},${pt.y}`).join(' ');
});

const dataset2PolygonPoints = computed(() => {
  return dataset2Points.value.map(pt => `${pt.x},${pt.y}`).join(' ');
});

const getLabelPoint = (index) => {
  const angle = (index * 2 * Math.PI) / numAxes - Math.PI / 2;
  const r = radius + 22;
  return {
    x: center.x + r * Math.cos(angle),
    y: center.y + r * Math.sin(angle) + 4
  };
};

const getLabelAnchor = (index) => {
  const pt = getLabelPoint(index);
  if (Math.abs(pt.x - center.x) < 10) return 'middle';
  return pt.x > center.x ? 'start' : 'end';
};
</script>

<style scoped>
.genz-radar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.genz-radar-legend {
  display: flex;
  justify-content: center;
  gap: 1.25rem;
}

.radar-leg-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
}

.radar-leg-item.pink {
  border: 1px solid #F43F5E;
  background-color: rgba(254, 226, 226, 0.4);
}

.radar-leg-item.blue {
  border: 1px solid #3B82F6;
  background-color: rgba(219, 234, 254, 0.4);
}

.leg-box {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.leg-box.pink {
  background-color: rgba(244, 63, 94, 0.8);
}

.leg-box.blue {
  background-color: rgba(59, 130, 246, 0.8);
}

.leg-txt {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
}

.radar-svg-container {
  width: 100%;
  max-width: 300px;
  height: 240px;
  display: flex;
  justify-content: center;
}

.radar-svg {
  width: 100%;
  height: 100%;
}

polygon {
  transition: all 0.3s ease;
}
</style>
