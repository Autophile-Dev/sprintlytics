<template>
  <div class="exact-donut-card-content">
    <!-- Header Dropdown Filter Row -->
    <div class="donut-top-header mb-2">
      <div class="filter-dropdown-pill">
        <span>Month</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <!-- Doughnut Display with Floating Oval Pill Badges (Directly Matching Screenshot) -->
    <div class="donut-visual-container">
      <!-- SVG Radial Ring -->
      <svg viewBox="0 0 240 240" class="exact-donut-svg">
        <g transform="rotate(-90 120 120)">
          <!-- Base background track ring -->
          <circle cx="120" cy="120" r="72" fill="none" stroke="#F3F4F6" stroke-width="36" />

          <!-- Slice 3: Soft Neutral Gray (6%) -->
          <circle
            cx="120"
            cy="120"
            r="72"
            fill="none"
            stroke="#E5E7EB"
            stroke-width="36"
            :stroke-dasharray="`${(0.18 * circumference)} ${circumference}`"
            :stroke-dashoffset="-((0.58 + 0.24) * circumference)"
            stroke-linecap="butt"
          />

          <!-- Slice 2: Warm Amber/Yellow (24%) -->
          <circle
            cx="120"
            cy="120"
            r="72"
            fill="none"
            stroke="#F59E0B"
            stroke-width="36"
            :stroke-dasharray="`${(0.24 * circumference)} ${circumference}`"
            :stroke-dashoffset="-(0.58 * circumference)"
            stroke-linecap="butt"
          />

          <!-- Slice 1: Vibrant Blue (58%) -->
          <circle
            cx="120"
            cy="120"
            r="72"
            fill="none"
            stroke="#2563EB"
            stroke-width="36"
            :stroke-dasharray="`${(0.58 * circumference)} ${circumference}`"
            stroke-dashoffset="0"
            stroke-linecap="butt"
          />
        </g>
      </svg>

      <!-- Center White Hole with Large Percentage (Matching Screenshot 88%) -->
      <div class="exact-center-circle">
        <span class="center-percent-num">88%</span>
        <span class="center-label-sub">Completed</span>
      </div>

      <!-- Floating Oval Pill Badges Overlay (Directly Replicating Screenshot Pills) -->
      <!-- Pill 1: Top Right (58% Server / Done) -->
      <div class="floating-pill-badge top-right">
        <span class="pill-pct font-bold">58%</span>
        <div class="pill-sub-row">
          <span class="pill-dot blue"></span>
          <span class="pill-name">Done</span>
        </div>
      </div>

      <!-- Pill 2: Bottom Left (24% Website / In Progress) -->
      <div class="floating-pill-badge bottom-left">
        <span class="pill-pct font-bold">24%</span>
        <div class="pill-sub-row">
          <span class="pill-dot yellow"></span>
          <span class="pill-name">In Progress</span>
        </div>
      </div>

      <!-- Pill 3: Bottom Right (6% Others / To Do) -->
      <div class="floating-pill-badge bottom-right">
        <span class="pill-pct font-bold">6%</span>
        <div class="pill-sub-row">
          <span class="pill-dot-circle gray"></span>
          <span class="pill-name">Others</span>
        </div>
      </div>
    </div>

    <!-- Bottom Subtext Callout (Matching Bottom Paragraph in Screenshot) -->
    <div class="donut-bottom-subtext">
      <p class="subtext-p">
        <strong>88% more completion</strong> than last month, keep watching to find out your overall progress
      </p>
    </div>
  </div>
</template>

<script setup>
const circumference = 2 * Math.PI * 72; // radius = 72 => 452.38
</script>

<style scoped>
.exact-donut-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.donut-top-header {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}

.filter-dropdown-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.65rem;
  background-color: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}

.donut-visual-container {
  position: relative;
  width: 250px;
  height: 250px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0.5rem 0;
}

.exact-donut-svg {
  width: 100%;
  height: 100%;
}

.exact-center-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 108px;
  height: 108px;
  background-color: #ffffff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
  pointer-events: none;
}

.center-percent-num {
  font-size: 2.1rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  letter-spacing: -0.02em;
}

.center-label-sub {
  font-size: 0.72rem;
  font-weight: 500;
  color: #9CA3AF;
  margin-top: 0.2rem;
}

/* Floating Oval Pill Badges (Replicating exact position from screenshot) */
.floating-pill-badge {
  position: absolute;
  background-color: #ffffff;
  padding: 0.45rem 0.85rem;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #F3F4F6;
  z-index: 10;
}

.floating-pill-badge.top-right {
  top: 25px;
  right: 0px;
}

.floating-pill-badge.bottom-left {
  bottom: 20px;
  left: -5px;
}

.floating-pill-badge.bottom-right {
  bottom: 15px;
  right: 5px;
}

.pill-pct {
  font-size: 0.9rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.1;
}

.pill-sub-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.15rem;
}

.pill-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.pill-dot.blue { background-color: #2563EB; }
.pill-dot.yellow { background-color: #F59E0B; }

.pill-dot-circle {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1.5px solid #9CA3AF;
  background: transparent;
}

.pill-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6B7280;
}

.donut-bottom-subtext {
  text-align: center;
  margin-top: 0.5rem;
  max-width: 220px;
}

.subtext-p {
  font-size: 0.75rem;
  color: #9CA3AF;
  line-height: 1.4;
  margin: 0;
}

.subtext-p strong {
  color: #4B5563;
}
</style>
