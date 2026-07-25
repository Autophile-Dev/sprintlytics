<template>
  <div class="app-layout">
    <AppLoader v-if="loading" />

    <template v-else-if="user">
      <!-- Mobile Backdrop Overlay -->
      <div 
        v-if="!isCollapsed" 
        class="mobile-backdrop" 
        @click="isCollapsed = true"
      ></div>

      <!-- Sidebar -->
      <AppSidebar :user="user" :riskCount="0" @logout="confirmLogout" />

      <!-- Main Layout container on right -->
      <div
        class="main-container"
        :class="{ 'main-container--collapsed': isCollapsed }"
      >
        <!-- Topbar -->
        <AppTopbar :user="user" @logout="confirmLogout" />

        <!-- Screen Content View -->
        <main class="page-content">
          <slot />
        </main>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { user } = useAuth();
const loading = ref(true);

const { isCollapsed } = useSidebar();
const modal = useModal();

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
.app-layout {
  height: 100vh;
  width: 100%;
  background-color: #F9FAFB;
  display: flex;
  overflow: hidden;
}

.main-container {
  flex: 1;
  margin-left: var(--sidebar-width); /* Default sidebar expanded width */
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  transition: margin-left var(--transition);
  min-width: 0;
}

.main-container--collapsed {
  margin-left: var(--sidebar-collapsed-width); /* Collapsed sidebar width */
}

.page-content {
  flex: 1;
  padding: 1.75rem 1.30rem 2.5rem 1.70rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.mobile-backdrop {
  display: none;
}

@media (max-width: 768px) {
  .app-layout {
    height: auto;
    min-height: 100vh;
    overflow-y: auto;
  }

  .main-container {
    margin-left: 0 !important;
    height: auto;
    max-height: none;
    overflow: visible;
  }

  .page-content {
    padding: 1rem 0.85rem 2rem 0.85rem;
    overflow-y: visible;
  }

  .mobile-backdrop {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(17, 24, 39, 0.4);
    backdrop-filter: blur(4px);
    z-index: 180;
  }
}
</style>
