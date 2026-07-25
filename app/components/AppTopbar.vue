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
        <!-- Notification Bell & Glassmorphic Popover -->
        <div class="notif-wrapper" ref="notifRef">
          <button 
            class="action-btn" 
            :class="{ 'ding-dong-ring': isRinging, 'has-unread': unreadCount > 0 }"
            @click="toggleNotifications" 
            aria-label="Notifications" 
            title="Notifications & Live Workspace Alerts"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span v-if="unreadCount > 0" class="action-badge-container">
              <span class="ping-aura"></span>
              <span class="action-badge-count">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
            </span>
          </button>

          <!-- Glassmorphic Notification Popover Drawer -->
          <Transition name="glass-pop">
            <div v-show="isNotificationsOpen" class="notif-popover glass-card">
              <div class="notif-header">
                <div class="notif-title-group">
                  <h4 class="notif-heading">Workspace Notifications</h4>
                  <span v-if="unreadCount > 0" class="unread-pill">{{ unreadCount }} unread</span>
                </div>
                <div class="notif-header-actions">
                  <button class="chime-test-btn" @click.stop="triggerSimulatedAlert" title="Simulate Dynamic Alert">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>
                    <span>Simulate</span>
                  </button>
                  <button class="chime-test-btn" @click.stop="playDingDongChime" title="Play Chime Sound">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                    <span>Chime</span>
                  </button>
                  <button v-if="unreadCount > 0" class="mark-all-btn" @click.stop="markAllAsRead">Clear All</button>
                </div>
              </div>

              <!-- Filter Tabs -->
              <div class="notif-tabs">
                <button :class="{ active: notifTab === 'all' }" @click="notifTab = 'all'">All ({{ notifications.length }})</button>
                <button :class="{ active: notifTab === 'unread' }" @click="notifTab = 'unread'">Unread ({{ unreadCount }})</button>
                <button :class="{ active: notifTab === 'high' }" @click="notifTab = 'high'">High Risk</button>
                <button :class="{ active: notifTab === 'sprint' }" @click="notifTab = 'sprint'">Sprints</button>
              </div>

              <!-- Notifications List -->
              <div class="notif-body custom-scroll">
                <div 
                  v-for="n in filteredNotifications" 
                  :key="n.id" 
                  class="notif-item" 
                  :class="{ 'notif-item--unread': !n.isRead, ['notif-item--' + n.priority]: true }"
                  @click="handleNotifClick(n)"
                >
                  <div class="notif-icon-col">
                    <span class="type-icon-badge" :class="'type--' + n.type">
                      <svg v-if="n.type === 'risk'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      <svg v-else-if="n.type === 'sprint'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <svg v-else-if="n.type === 'capacity'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                      <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </span>
                  </div>
                  <div class="notif-content-col">
                    <div class="notif-item-top">
                      <span class="notif-item-title">{{ n.title }}</span>
                      <span class="notif-item-time">{{ formatTimeAgo(n.createdAt) }}</span>
                    </div>
                    <p class="notif-item-desc">{{ n.message }}</p>
                    <div class="notif-meta-tags">
                      <span class="priority-tag" :class="'prio--' + n.priority">{{ n.priority.toUpperCase() }}</span>
                      <span class="type-tag">{{ n.type }}</span>
                    </div>
                  </div>
                  <div class="notif-action-col">
                    <button v-if="!n.isRead" class="dot-read-btn" @click.stop="markAsRead(n)" title="Mark as Read"></button>
                  </div>
                </div>

                <div v-if="!filteredNotifications.length" class="notif-empty">
                  <div class="empty-glow-circle">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="1.8">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  </div>
                  <p class="empty-title">All Caught Up!</p>
                  <p class="empty-desc">No unread alerts in this tab.</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>

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

    <!-- Real-Time Floating Glassmorphic Toast Banner -->
    <Transition name="toast-slide">
      <div v-if="activeToast.show" class="floating-toast-banner" :class="'toast--' + activeToast.type" @click="handleToastClick">
        <div class="toast-glow-bar"></div>
        <div class="toast-body">
          <div class="toast-badge-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </div>
          <div class="toast-text-group">
            <h5 class="toast-title">{{ activeToast.title }}</h5>
            <p class="toast-message">{{ activeToast.message }}</p>
          </div>
          <button class="toast-dismiss-btn" @click.stop="activeToast.show = false">✕</button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const { isCollapsed } = useSidebar();
const router = useRouter();

const props = defineProps({
  user: { type: Object, default: null }
});

const emit = defineEmits(['logout']);

const route = useRoute();
const isOpen = ref(false);
const dropdownRef = ref(null);

// Notifications State
const notifications = ref([]);
const unreadCount = ref(0);
const isNotificationsOpen = ref(false);
const notifTab = ref('all');
const notifRef = ref(null);
const isRinging = ref(false);
let pollingTimer = null;

// Floating Toast Banner State
const activeToast = ref({ show: false, title: '', message: '', type: 'risk', actionUrl: '' });

const activeRouteLabel = computed(() => {
  const path = route.path;
  if (path === '/') return 'Dashboard';
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

// Web Audio API Dual-Tone Chime ("Ding Dong Bell")
const playDingDongChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // 1st High Tone ('Ding' - 880Hz A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, ctx.currentTime);
    gain1.gain.setValueAtTime(0.35, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.35);

    // 2nd Low Tone ('Dong' - 659.25Hz E5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.75);

    // Trigger visual bell wobble animation
    triggerBellAnimation();
  } catch (e) {
    console.warn('[AudioChime] Web Audio API failed:', e.message);
  }
};

const triggerBellAnimation = () => {
  isRinging.value = true;
  setTimeout(() => {
    isRinging.value = false;
  }, 850);
};

const triggerFloatingToast = (title, message, type = 'risk', actionUrl = '') => {
  activeToast.value = { show: true, title, message, type, actionUrl };
  playDingDongChime();
  setTimeout(() => {
    activeToast.value.show = false;
  }, 5000);
};

const handleToastClick = () => {
  if (activeToast.value.actionUrl) {
    router.push(activeToast.value.actionUrl);
  }
  activeToast.value.show = false;
};

const fetchNotifications = async () => {
  try {
    const res = await $fetch('/api/notifications');
    if (res && res.success) {
      const prevUnread = unreadCount.value;
      notifications.value = res.notifications || [];
      unreadCount.value = res.unreadCount || 0;

      // Play chime and toast if new unread alert arrived dynamically
      if (res.unreadCount > prevUnread && prevUnread >= 0 && notifications.value.length) {
        const latest = notifications.value[0];
        triggerFloatingToast(latest.title, latest.message, latest.type, latest.actionUrl);
      }
    }
  } catch (err) {
    console.warn('Error fetching notifications:', err);
  }
};

const triggerSimulatedAlert = async () => {
  const alertTypes = [
    { title: 'High Risk Alert: API Rate Limit Warning', message: 'GitHub API quota reached 92% capacity.', type: 'risk', actionUrl: '/risks' },
    { title: 'Sprint Health Alert: Velocity Drop (-12%)', message: 'DevOps Tasks Sprint 24 health score updated to 78%.', type: 'sprint', actionUrl: '/reports/sprint' },
    { title: 'Workload Bottleneck: Lead Designer at 125%', message: 'Senior UX designer assigned story points exceed sprint allocation.', type: 'capacity', actionUrl: '/team/utilization' },
  ];
  const pick = alertTypes[Math.floor(Math.random() * alertTypes.length)];

  try {
    const res = await $fetch('/api/notifications', {
      method: 'POST',
      body: pick
    });
    if (res && res.success) {
      await fetchNotifications();
    }
  } catch (err) {
    triggerFloatingToast(pick.title, pick.message, pick.type, pick.actionUrl);
  }
};

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
  if (isNotificationsOpen.value) {
    playDingDongChime();
    fetchNotifications();
  }
};

const markAsRead = async (notif) => {
  if (notif.isRead) return;
  notif.isRead = true;
  unreadCount.value = Math.max(0, unreadCount.value - 1);
  try {
    await $fetch('/api/notifications', {
      method: 'PUT',
      body: { id: notif.id }
    });
  } catch (err) {
    console.warn('Error marking notification read:', err);
  }
};

const markAllAsRead = async () => {
  notifications.value.forEach(n => n.isRead = true);
  unreadCount.value = 0;
  try {
    await $fetch('/api/notifications', {
      method: 'PUT',
      body: { all: true }
    });
  } catch (err) {
    console.warn('Error marking all notifications read:', err);
  }
};

const handleNotifClick = (notif) => {
  markAsRead(notif);
  isNotificationsOpen.value = false;
  if (notif.actionUrl) {
    router.push(notif.actionUrl);
  }
};

const filteredNotifications = computed(() => {
  if (notifTab.value === 'unread') return notifications.value.filter(n => !n.isRead);
  if (notifTab.value === 'high') return notifications.value.filter(n => n.priority === 'high');
  if (notifTab.value === 'sprint') return notifications.value.filter(n => n.type === 'sprint');
  return notifications.value;
});

const formatTimeAgo = (d) => {
  if (!d) return 'Just now';
  const mins = Math.floor((new Date() - new Date(d)) / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
  if (notifRef.value && !notifRef.value.contains(event.target)) {
    isNotificationsOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  fetchNotifications();
  // Live polling every 20 seconds
  pollingTimer = setInterval(fetchNotifications, 20000);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  if (pollingTimer) clearInterval(pollingTimer);
});
</script>

<style scoped>
.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  padding: 0 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #E5E7EB;
  position: sticky;
  top: 0;
  z-index: 99;
}

.topbar__left, .topbar__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.topbar__toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 6px;
  color: #4B5563;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.topbar__toggle:hover {
  background-color: #F3F4F6;
  color: #111827;
}

.chevron-toggle-icon {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron-toggle-icon--collapsed {
  transform: rotate(180deg);
}

.topbar__breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.breadcrumb-parent { color: #6B7280; }
.breadcrumb-separator { color: #D1D5DB; }
.breadcrumb-active { color: #111827; font-weight: 600; }

.topbar__search {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #9CA3AF;
  pointer-events: none;
}

.search-input {
  width: 240px;
  height: 36px;
  padding: 0 0.75rem 0 2.25rem;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  background-color: #F9FAFB;
  font-size: 0.85rem;
  color: #111827;
  outline: none;
  transition: all 0.2s ease;
}

.search-input:focus {
  background-color: #ffffff;
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  width: 280px;
}

.topbar__actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.notif-wrapper {
  position: relative;
}

.action-btn {
  position: relative;
  background: none;
  border: none;
  padding: 0.55rem;
  border-radius: 9999px;
  color: #4B5563;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  background-color: rgba(5, 150, 105, 0.1);
  color: #059669;
}

.action-btn.has-unread {
  color: #059669;
}

/* Bell Wobble Animation */
@keyframes ding-dong-ring {
  0% { transform: rotate(0) scale(1); }
  15% { transform: rotate(18deg) scale(1.1); }
  30% { transform: rotate(-18deg) scale(1.1); }
  45% { transform: rotate(12deg) scale(1.05); }
  60% { transform: rotate(-12deg) scale(1.05); }
  75% { transform: rotate(6deg) scale(1.02); }
  100% { transform: rotate(0) scale(1); }
}

.ding-dong-ring svg {
  animation: ding-dong-ring 0.85s cubic-bezier(0.36, 0.07, 0.19, 0.97);
  color: #059669;
}

/* Pulsing Ping Aura Badge */
.action-badge-container {
  position: absolute;
  top: 1px;
  right: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse-ping {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.45); opacity: 0; }
  100% { transform: scale(0.95); opacity: 0; }
}

.ping-aura {
  position: absolute;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: #EF4444;
  animation: pulse-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.action-badge-count {
  position: relative;
  background: linear-gradient(135deg, #EF4444 0%, #DC2626 100%);
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 10px;
  border: 2px solid #ffffff;
  line-height: 1;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
}

/* Glassmorphic Drawer Popover */
.notif-popover.glass-card {
  position: absolute;
  top: calc(100% + 14px);
  right: -10px;
  width: 380px;
  max-width: 92vw;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(229, 231, 235, 0.8);
  z-index: 120;
  overflow: hidden;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid rgba(229, 231, 235, 0.7);
  background: rgba(249, 250, 251, 0.6);
}

.notif-title-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notif-heading {
  font-size: 0.92rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
  letter-spacing: -0.01em;
}

.unread-pill {
  font-size: 0.68rem;
  font-weight: 800;
  color: #047857;
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  padding: 2px 7px;
  border-radius: 10px;
}

.notif-header-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.chime-test-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(243, 244, 246, 0.8);
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chime-test-btn:hover {
  background: #ECFDF5;
  border-color: #A7F3D0;
  color: #047857;
}

.mark-all-btn {
  background: none;
  border: none;
  font-size: 0.72rem;
  font-weight: 700;
  color: #059669;
  cursor: pointer;
  padding: 4px;
}

.mark-all-btn:hover {
  text-decoration: underline;
}

.notif-tabs {
  display: flex;
  gap: 0.25rem;
  padding: 0.5rem 0.85rem;
  border-bottom: 1px solid rgba(243, 244, 246, 0.8);
  background: rgba(255, 255, 255, 0.5);
}

.notif-tabs button {
  flex: 1;
  background: none;
  border: none;
  padding: 0.4rem 0.2rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #6B7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notif-tabs button.active {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%);
  color: #047857;
  box-shadow: inset 0 0 0 1px rgba(16, 185, 129, 0.2);
}

.notif-body {
  max-height: 380px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.notif-item {
  display: flex;
  gap: 0.85rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid rgba(243, 244, 246, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notif-item:hover {
  background: rgba(249, 250, 251, 0.9);
}

.notif-item--unread {
  background: linear-gradient(90deg, rgba(236, 253, 245, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%);
}

.type-icon-badge {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.type--risk { background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); color: #EF4444; }
.type--sprint { background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); color: #059669; }
.type--capacity { background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); color: #D97706; }
.type--kpi { background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%); color: #4F46E5; }
.type--system { background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); color: #4B5563; }

.notif-content-col {
  flex: 1;
  min-width: 0;
}

.notif-item-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 0.5rem;
}

.notif-item-title {
  font-size: 0.84rem;
  font-weight: 800;
  color: #111827;
  line-height: 1.3;
}

.notif-item-time {
  font-size: 0.68rem;
  font-weight: 600;
  color: #9CA3AF;
  white-space: nowrap;
}

.notif-item-desc {
  font-size: 0.78rem;
  color: #4B5563;
  margin: 3px 0 6px 0;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notif-meta-tags {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.priority-tag {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 4px;
  letter-spacing: 0.03em;
}

.prio--high { background: #FEE2E2; color: #DC2626; }
.prio--medium { background: #FEF3C7; color: #D97706; }
.prio--low { background: #E0E7FF; color: #4338CA; }

.type-tag {
  font-size: 0.62rem;
  font-weight: 600;
  color: #6B7280;
  text-transform: capitalize;
}

.notif-action-col {
  display: flex;
  align-items: center;
}

.dot-read-btn {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10B981 0%, #059669 100%);
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.4);
  cursor: pointer;
}

.notif-empty {
  padding: 3rem 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.empty-glow-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #ECFDF5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.25rem;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.15);
}

.empty-title {
  font-size: 0.95rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.empty-desc {
  font-size: 0.78rem;
  color: #6B7280;
  margin: 0;
}

/* Floating Real-Time Toast Banner */
.floating-toast-banner {
  position: fixed;
  top: 76px;
  right: 20px;
  width: 340px;
  max-width: calc(100vw - 40px);
  background: rgba(17, 24, 39, 0.94);
  backdrop-filter: blur(16px);
  color: #ffffff;
  border-radius: 14px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.25);
  z-index: 999;
  cursor: pointer;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.toast-glow-bar {
  height: 3px;
  background: linear-gradient(90deg, #EF4444 0%, #10B981 50%, #6366F1 100%);
}

.toast-body {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
}

.toast-badge-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.2);
  color: #EF4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.toast-text-group {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 0.85rem;
  font-weight: 800;
  margin: 0 0 2px 0;
  color: #ffffff;
}

.toast-message {
  font-size: 0.76rem;
  color: #D1D5DB;
  margin: 0;
  line-height: 1.3;
}

.toast-dismiss-btn {
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0 2px;
}

.toast-dismiss-btn:hover {
  color: #ffffff;
}

/* Animations & Transitions */
.glass-pop-enter-active, .glass-pop-leave-active {
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease;
}

.glass-pop-enter-from, .glass-pop-leave-to {
  transform: translateY(-8px) scale(0.96);
  opacity: 0;
}

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease;
}

.toast-slide-enter-from, .toast-slide-leave-to {
  transform: translateX(40px);
  opacity: 0;
}

.topbar__divider {
  width: 1px;
  height: 24px;
  background-color: #E5E7EB;
  margin: 0 0.25rem;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.user-trigger:hover {
  background-color: #F9FAFB;
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
}

.user-role {
  font-size: 0.72rem;
  color: #6B7280;
}

.chevron-icon {
  color: #9CA3AF;
  transition: transform 0.2s ease;
}

.chevron-icon--open {
  transform: rotate(180deg);
}

.topbar__user-menu {
  position: relative;
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 220px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04);
  border: 1px solid #E5E7EB;
  padding: 0.5rem 0;
  z-index: 100;
}

.dropdown-header {
  padding: 0.5rem 1rem 0.75rem 1rem;
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
