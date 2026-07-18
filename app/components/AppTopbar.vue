<template>
  <header class="topbar">
    <div class="topbar__left">
      <!-- Toggle Button (Hamburger) -->
      <button 
        class="topbar__toggle" 
        @click="isCollapsed = !isCollapsed" 
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <svg 
          class="chevron-toggle-icon" 
          :class="{ 'chevron-toggle-icon--collapsed': isCollapsed }"
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2.5" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- Breadcrumb / Section Title -->
      <div class="topbar__breadcrumb">
        <span class="breadcrumb-parent">Workspace</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-active">{{ activeRouteLabel }}</span>
      </div>
    </div>

    <div class="topbar__right">
      <!-- Search Bar -->
      <div class="topbar__search">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" placeholder="Search analytics, sprints, team..." class="search-input" />
      </div>

      <!-- Quick Actions -->
      <div class="topbar__actions">
        <!-- Notification Bell -->
        <button class="action-btn" aria-label="Notifications" title="Notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span class="action-badge"></span>
        </button>

        <!-- Help Center -->
        <button class="action-btn" aria-label="Help Center" title="Help Center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </button>
      </div>

      <!-- Vertical Divider -->
      <div class="topbar__divider"></div>

      <!-- User Dropdown Menu -->
      <div class="topbar__user-menu" ref="dropdownRef">
        <button class="user-trigger" @click="isOpen = !isOpen" aria-haspopup="true" :aria-expanded="isOpen">
          <div class="user-avatar">
            {{ userInitial }}
          </div>
          <div class="user-meta">
            <span class="user-name">{{ userName }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <svg class="chevron-icon" :class="{ 'chevron-icon--open': isOpen }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <!-- Dropdown Card -->
        <Transition name="slide-up">
          <div v-show="isOpen" class="user-dropdown">
            <div class="dropdown-header">
              <p class="dropdown-user-email">{{ user?.email }}</p>
            </div>
            
            <div class="dropdown-links">
              <NuxtLink to="/profile" class="dropdown-link" @click="isOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>My Profile</span>
              </NuxtLink>
              <NuxtLink to="/settings" class="dropdown-link" @click="isOpen = false">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Account Settings</span>
              </NuxtLink>
            </div>

            <div class="dropdown-divider"></div>

            <div class="dropdown-footer">
              <button class="dropdown-logout" @click="triggerLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';

const { isCollapsed } = useSidebar();

const props = defineProps({
  user: { type: Object, default: null }
});

const emit = defineEmits(['logout']);

const route = useRoute();
const isOpen = ref(false);
const dropdownRef = ref(null);

// Get current route name for breadcrumbs
const activeRouteLabel = computed(() => {
  const path = route.path;
  if (path === '/') return 'Dashboard';
  
  // Format /sprint/health -> Health, /team/utilization -> Utilization
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return 'Dashboard';
  
  const lastPart = parts[parts.length - 1];
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace('-', ' ');
});

const userName = computed(() => props.user?.email?.split('@')[0] || 'User');
const userRole = computed(() => props.user?.roles?.[0] || 'Member');
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

const triggerLogout = () => {
  isOpen.value = false;
  emit('logout');
};

// Close dropdown on click outside
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.topbar {
  height: 80px;
  background-color: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1.25rem 0 0.75rem;
  position: sticky;
  top: 0;
  z-index: 90;
  font-family: 'Open Sans', sans-serif;
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.08);
}

.topbar__left {
  display: flex;
  align-items: center;
}

.topbar__toggle {
  background: none;
  border: none;
  color: #4B5563;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.topbar__toggle:hover {
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
}

.chevron-toggle-icon {
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  color: #4B5563;
}

.topbar__toggle:hover .chevron-toggle-icon {
  color: #059669;
}

.chevron-toggle-icon--collapsed {
  transform: rotate(180deg);
}

/* Breadcrumb Navigation */
.topbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.breadcrumb-parent {
  color: #6B7280;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #D1D5DB;
}

.breadcrumb-active {
  color: #111827;
  font-weight: 600;
}

/* Right Section */
.topbar__right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

/* Search Bar styling */
.topbar__search {
  position: relative;
  display: flex;
  align-items: center;
  width: 280px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: #9CA3AF;
  pointer-events: none;
}

.search-input {
  width: 100%;
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 0.5rem 1rem 0.5rem 2.5rem;
  font-size: 0.85rem;
  color: #111827;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #059669;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
}

/* Quick Actions buttons */
.topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.action-btn {
  background: none;
  border: none;
  color: #6B7280;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background-color: #F9FAFB;
  color: #111827;
}

.action-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 7px;
  height: 7px;
  background-color: #EF4444;
  border-radius: 50%;
  border: 1.5px solid #ffffff;
}

.topbar__divider {
  width: 1px;
  height: 28px;
  background-color: #E5E7EB;
}

/* User Menu Trigger */
.topbar__user-menu {
  position: relative;
}

.user-trigger {
  background: none;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.375rem 0.625rem;
  border-radius: 10px;
  transition: all 0.2s ease;
  text-align: left;
}

.user-trigger:hover {
  background-color: #F9FAFB;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669, #14B8A6);
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.15);
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
}

.user-role {
  font-size: 0.72rem;
  color: #9CA3AF;
  text-transform: capitalize;
}

.chevron-icon {
  color: #9CA3AF;
  transition: transform 0.2s ease;
}

.chevron-icon--open {
  transform: rotate(180deg);
}

/* Dropdown Menu Box */
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background-color: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 0.5rem 0;
  will-change: transform, opacity;
  z-index: 1000;
}

.dropdown-header {
  padding: 0.5rem 1rem;
}

.dropdown-user-email {
  font-size: 0.78rem;
  color: #6B7280;
  word-break: break-all;
}

.dropdown-links {
  padding: 0 0.5rem;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.0125rem;
  color: #374151;
  text-decoration: none;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  cursor: pointer;
  border-radius: 8px;
}

.dropdown-link:hover {
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
}

.dropdown-divider {
  height: 1px;
  background-color: #E5E7EB;
  margin: 0.5rem 0;
}

.dropdown-footer {
  padding: 0 0.5rem;
}

.dropdown-logout {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  color: #EF4444;
  background-color: #FEF2F2;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  width: 100%;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.dropdown-logout:hover {
  background-color: #FEE2E2;
  color: #DC2626;
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(8px);
  opacity: 0;
}
</style>
