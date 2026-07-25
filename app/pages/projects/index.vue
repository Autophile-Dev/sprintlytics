<template>
  <div class="projects-overview-container">
    <header class="page-header">
      <div class="header-text">
        <h1 class="page-title">Company Projects & Analytics</h1>
        <p class="page-subtitle">Select a project to view detailed performance metrics, velocity, and AI risk reports.</p>
      </div>

      <button class="add-project-btn" @click="showAddModal = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        <span>Add New Project</span>
      </button>
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

    <!-- Create Project Modal -->
    <AppModal
      v-if="showAddModal"
      :is-open="showAddModal"
      title="Create New Project"
      @close="showAddModal = false"
    >
      <form @submit.prevent="handleCreateProject" class="modal-form">
        <p class="modal-desc">Add a new company project portfolio to track sprint velocity and health metrics.</p>

        <div class="form-group">
          <label class="form-label">Project Name</label>
          <input
            v-model="newProj.name"
            type="text"
            class="modal-input"
            placeholder="e.g. NextGen Payment Gateway"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Company / Client Name</label>
          <input
            v-model="newProj.company"
            type="text"
            class="modal-input"
            placeholder="e.g. Apex Dynamics"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label">Project Lead / Manager</label>
          <input
            v-model="newProj.lead"
            type="text"
            class="modal-input"
            placeholder="e.g. Sarah Jenkins"
            required
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-secondary" @click="showAddModal = false">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Project' }}
          </button>
        </div>
      </form>
    </AppModal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';

useHead({ title: 'Company Projects Overview | Sprintlytics' });

const router = useRouter();
const { data, pending, refresh } = await useFetch('/api/projects/by-company');

const showAddModal = ref(false);
const isSubmitting = ref(false);

const newProj = reactive({
  name: '',
  company: '',
  lead: ''
});

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

const handleCreateProject = async () => {
  if (!newProj.name || !newProj.company || !newProj.lead) return;
  isSubmitting.value = true;
  try {
    const csrfToken = useCookie('csrf_token').value;
    const res = await $fetch('/api/projects', {
      method: 'POST',
      headers: { 'x-csrf-token': csrfToken || '' },
      body: {
        name: newProj.name,
        company: newProj.company,
        lead: newProj.lead
      }
    });

    if (res && res.success) {
      showAddModal.value = false;
      newProj.name = '';
      newProj.company = '';
      newProj.lead = '';
      refresh();
    }
  } catch (err) {
    console.error('Error creating project:', err);
    showAddModal.value = false;
  } finally {
    isSubmitting.value = false;
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.add-project-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  background: #059669;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.add-project-btn:hover {
  background: #047857;
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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-desc {
  font-size: 0.85rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
}

.modal-input {
  padding: 0.65rem 0.85rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.85rem;
  outline: none;
}

.modal-input:focus {
  border-color: #059669;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-secondary {
  padding: 0.6rem 1rem;
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-primary {
  padding: 0.6rem 1.1rem;
  background: #059669;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .company-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .company-grid { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
}
</style>
