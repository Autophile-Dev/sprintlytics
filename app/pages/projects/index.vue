<template>
  <div class="projects-overview-container">
    <header class="page-header">
      <div>
        <h1 class="page-title">Company Projects & Analytics</h1>
        <p class="page-subtitle">Select a project to view detailed performance metrics, velocity, and AI risk reports.</p>
      </div>
    </header>

    <div v-if="pending" class="loading-box">
      <div class="spinner"></div>
      <p>Loading projects...</p>
    </div>

    <div v-else class="company-grid">
      <div 
        v-for="item in companyList" 
        :key="item.companyName" 
        class="company-card"
        @click="navigateToCompany(item.companyName)"
      >
        <div class="company-card-header">
          <div class="company-avatar">{{ getInitials(item.companyName) }}</div>
          <div class="company-meta">
            <h3 class="company-name">{{ item.companyName }}</h3>
            <span class="report-type">{{ item.periodLabel || 'Sprint Report' }}</span>
          </div>
        </div>

        <div class="company-card-body">
          <div class="stat-row">
            <span class="stat-label">Health Score</span>
            <span class="stat-val text-success">{{ item.kpis?.healthScore || 0 }}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Velocity</span>
            <span class="stat-val">{{ item.kpis?.velocity || 0 }} pts</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Completion Rate</span>
            <span class="stat-val">{{ item.kpis?.completionPct || 0 }}%</span>
          </div>
        </div>

        <div class="company-card-footer">
          <NuxtLink :to="`/projects/${encodeURIComponent(item.companyName)}`" class="btn-link">
            View Analytics &rarr;
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const { data, pending } = await useFetch('/api/projects/by-company');

const companyList = computed(() => {
  if (!data.value || !data.value.data) return [];
  return data.value.data;
});

const getInitials = (name) => {
  if (!name) return 'PR';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
};

const navigateToCompany = (name) => {
  router.push(`/projects/${encodeURIComponent(name)}`);
};
</script>

<style scoped>
.projects-overview-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: 'Open Sans', sans-serif;
}

.page-header {
  border-bottom: 1px solid #E5E7EB;
  padding-bottom: 1.25rem;
}

.page-title {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  font-weight: 400;
  color: #111827;
  margin: 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: #6B7280;
  margin: 0.25rem 0 0;
}

.loading-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #E5E7EB;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #E5E7EB;
  border-top-color: #059669;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.company-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.company-card {
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.company-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.08);
  border-color: #A7F3D0;
}

.company-card-header {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.company-avatar {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: linear-gradient(135deg, #059669, #065F46);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.company-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.report-type {
  font-size: 0.75rem;
  color: #6B7280;
}

.company-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.75rem 0;
  border-top: 1px solid #F3F4F6;
  border-bottom: 1px solid #F3F4F6;
  margin-bottom: 1rem;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
}

.stat-label { color: #6B7280; }
.stat-val { font-weight: 600; color: #111827; }
.text-success { color: #059669; }

.btn-link {
  font-size: 0.82rem;
  font-weight: 600;
  color: #059669;
  text-decoration: none;
}

@media (max-width: 1024px) {
  .company-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .company-grid { grid-template-columns: 1fr; }
}
</style>
