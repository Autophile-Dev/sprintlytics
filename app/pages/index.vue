<template>
  <div class="workspace-layout">
    <AppLoader v-if="loading" />

    <template v-else-if="user">
      <!-- Collapsible Sidebar -->
      <AppSidebar :user="user" :riskCount="0" @logout="confirmLogout" />

      <!-- Main Dashboard view -->
      <main
        class="workspace-content"
        :class="{ 'workspace-content--collapsed': isCollapsed }"
      >
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
      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const user = ref(null);
const loading = ref(true);

const { isCollapsed } = useSidebar();
const modal = useModal();

const userName = computed(() => {
  if (!user.value?.email) return 'User';
  return user.value.email.split('@')[0];
});

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

const confirmLogout = () => {
  modal.show({
    type: 'logoutConfirmation',
    title: 'Sign Out',
    message: 'Are you sure you want to sign out of Sprintlytics?',
    onConfirm: handleLogout
  });
};

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

/* Shell container */
.workspace-layout {
  min-height: 100vh;
  background-color: #F9FAFB;
  font-family: 'Open Sans', sans-serif;
  color: #1F2937;
  display: flex;
}

/* Right Content Area */
.workspace-content {
  flex: 1;
  margin-left: 248px; /* Default sidebar width */
  padding: 2rem 2.5rem;
  transition: margin-left 0.26s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Adjust layout when sidebar collapses */
.workspace-content--collapsed {
  margin-left: 68px; /* Collapsed sidebar width */
}

/* Dashboard Header styling */
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
  .workspace-content {
    margin-left: 0 !important;
    padding: 1.5rem;
  }
  
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
