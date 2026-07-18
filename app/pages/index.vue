<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-left">
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Real-time health, velocity, and risks overview.</p>
      </div>
      <div class="header-right">
        <span class="sync-badge">
          <span class="dot"></span> Live Analytics
        </span>
      </div>
    </header>

    <!-- Stat Card Details -->
    <div class="workspace-card">
      <div class="content">
        <h2 class="title">Welcome back, {{ userName }}!</h2>
        <p class="subtitle">Your Sprintlytics AI-Powered Project Management Workspace is ready.</p>
        
        <div class="dashboard-preview">
          <div class="stat-card">
            <h3>Sprint Health</h3>
            <span class="value">94%</span>
            <span class="trend positive">Excellent</span>
          </div>
          <div class="stat-card">
            <h3>Team Velocity</h3>
            <span class="value">42 pts</span>
            <span class="trend positive">+12% vs last sprint</span>
          </div>
          <div class="stat-card">
            <h3>Active Risks</h3>
            <span class="value">0</span>
            <span class="trend neutral">All clear</span>
          </div>
        </div>
        
        <div class="main-action">
          <p>This is a demonstration of the Sprintlytics platform. Authenticated successfully!</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const { user } = useAuth();

const userName = computed(() => {
  if (!user.value?.email) return 'User';
  return user.value.email.split('@')[0];
});
</script>

<style scoped>
/* Dashboard Header styling */
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 1.25rem;
}

.dashboard-title {
  font-family: 'Tan Mon Cherie', 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.dashboard-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
  margin: 0.25rem 0 0;
}

/* Live Analytics Badge */
.sync-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background-color: #ECFDF5;
  border: 1px solid #A7F3D0;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
}

.sync-badge .dot {
  width: 6px;
  height: 6px;
  background-color: #10B981;
  border-radius: 50%;
  animation: pulse-dot 1.8s infinite;
}

@keyframes pulse-dot {
  0% { transform: scale(0.9); opacity: 0.6; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.6; }
}

/* Workspace Card Container */
.workspace-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #E5E7EB;
  width: 100%;
  max-width: 960px;
  padding: 2.25rem;
}

.title {
  font-family: 'Tan Mon Cherie', 'Playfair Display', serif;
  font-size: 1.75rem;
  font-weight: 400;
  color: #065F46;
  margin-bottom: 0.5rem;
  letter-spacing: -0.01em;
}

.subtitle {
  font-size: 0.95rem;
  color: #4B5563;
  margin-bottom: 2rem;
}

.dashboard-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.25rem;
}

.stat-card {
  background-color: #F0FDF4;
  border: 1px solid #DCFCE7;
  padding: 1.25rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
}

.stat-card h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #065F46;
  margin-bottom: 0.5rem;
}

.stat-card .value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #059669;
  margin-bottom: 0.25rem;
}

.stat-card .trend {
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-card .trend.positive {
  color: #047857;
}

.stat-card .trend.neutral {
  color: #6B7280;
}

.main-action {
  background: #F9FAFB;
  border: 1px dashed #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  color: #4B5563;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .dashboard-preview {
    grid-template-columns: 1fr;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>
