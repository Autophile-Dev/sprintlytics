<template>
  <div class="workspace-container">
    <div v-if="loading" class="loader-state">
      <div class="spinner"></div>
      <p>Verifying session...</p>
    </div>
    
    <div v-else-if="user" class="workspace-card">
      <div class="header">
        <img src="/wide-logo.png" alt="Sprintlytics Logo" class="logo" />
        <button @click="handleLogout" class="logout-btn">
          Sign Out
        </button>
      </div>
      
      <div class="content">
        <h1 class="title">Welcome back, {{ user.email }}!</h1>
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
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const response = await $fetch('/api/auth/me');
    if (response && response.success) {
      user.value = response.user;
    } else {
      router.push('/login');
    }
  } catch (error) {
    router.push('/login');
  } finally {
    loading.value = false;
  }
});

const handleLogout = async () => {
  try {
    loading.value = true;
    const csrfToken = useCookie('csrf_token').value;
    await $fetch('/api/auth/logout', { 
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken || ''
      }
    });
    user.value = null;
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

.workspace-container {
  min-height: 100vh;
  background-color: #F9FAFB;
  font-family: 'Open Sans', sans-serif;
  color: #1F2937;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
}

.loader-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(5, 150, 105, 0.1);
  border-left-color: #059669;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.workspace-card {
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  border: 1px solid #E5E7EB;
  width: 100%;
  max-width: 800px;
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
  padding-bottom: 1.5rem;
  margin-bottom: 2rem;
}

.logo {
  height: 36px;
  object-fit: contain;
}

.logout-btn {
  background-color: transparent;
  color: #DC2626;
  border: 1px solid #FEE2E2;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background-color: #FEF2F2;
  border-color: #FCA5A5;
}

.title {
  font-family: 'Tan Mon Cherie', 'Playfair Display', serif;
  font-size: 2.25rem;
  color: #065F46;
  margin-bottom: 0.5rem;
}

.subtitle {
  font-size: 1.125rem;
  color: #4B5563;
  margin-bottom: 2rem;
}

.dashboard-preview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 2.5rem;
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
  font-size: 0.875rem;
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
}

@media (max-width: 640px) {
  .dashboard-preview {
    grid-template-columns: 1fr;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .logout-btn {
    align-self: flex-end;
  }
}
</style>
