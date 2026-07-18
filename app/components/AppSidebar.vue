<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': isCollapsed }">

    <!-- ── Logo ── -->
    <div class="sidebar__logo">
      <Transition name="logo-fade" mode="out-in">
        <img
          v-if="!isCollapsed"
          key="wide"
          src="/wide-logo.png"
          alt="Sprintlytics"
          class="sidebar__logo-wide"
        />
        <img
          v-else
          key="icon"
          src="/logo.png"
          alt="Sprintlytics"
          class="sidebar__logo-icon"
        />
      </Transition>
    </div>

    <!-- ── Scrollable Nav ── -->
    <nav class="sidebar__nav" role="navigation">

      <!-- Section: Main -->
      <ul class="sidebar__list">

        <!-- Dashboard -->
        <li>
          <SidebarItem
            label="Dashboard"
            route="/"
            :collapsed="isCollapsed"
            :active="currentRoute === '/'"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
            </template>
          </SidebarItem>
        </li>

        <!-- Sprint Analytics -->
        <li>
          <SidebarGroup
            label="Sprint Analytics"
            :collapsed="isCollapsed"
            :active="currentRoute.startsWith('/sprint')"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </template>
            <template #children>
              <SidebarSubItem label="Sprint Health"   route="/sprint/health"    :active="currentRoute === '/sprint/health'" />
              <SidebarSubItem label="Velocity Chart"  route="/sprint/velocity"  :active="currentRoute === '/sprint/velocity'" />
              <SidebarSubItem label="Burndown"        route="/sprint/burndown"  :active="currentRoute === '/sprint/burndown'" />
            </template>
          </SidebarGroup>
        </li>

        <!-- Team Performance -->
        <li>
          <SidebarGroup
            label="Team Performance"
            :collapsed="isCollapsed"
            :active="currentRoute.startsWith('/team')"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </template>
            <template #children>
              <SidebarSubItem label="Utilization"   route="/team/utilization"  :active="currentRoute === '/team/utilization'" />
              <SidebarSubItem label="KPIs"          route="/team/kpis"         :active="currentRoute === '/team/kpis'" />
              <SidebarSubItem label="Leaderboard"   route="/team/leaderboard"  :active="currentRoute === '/team/leaderboard'" />
            </template>
          </SidebarGroup>
        </li>

        <!-- Risk Monitor -->
        <li>
          <SidebarItem
            label="Risk Monitor"
            route="/risks"
            :collapsed="isCollapsed"
            :active="currentRoute === '/risks'"
            :badge="riskCount"
            badge-variant="danger"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </template>
          </SidebarItem>
        </li>

        <!-- Reports -->
        <li>
          <SidebarGroup
            label="Reports"
            :collapsed="isCollapsed"
            :active="currentRoute.startsWith('/reports')"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </template>
            <template #children>
              <SidebarSubItem label="Sprint Report"    route="/reports/sprint"   :active="currentRoute === '/reports/sprint'" />
              <SidebarSubItem label="Export Data"      route="/reports/export"   :active="currentRoute === '/reports/export'" />
            </template>
          </SidebarGroup>
        </li>

      </ul>

      <!-- Divider -->
      <div class="sidebar__divider" />

      <!-- Section: Workspace -->
      <p class="sidebar__section-label" v-show="!isCollapsed">Workspace</p>
      <ul class="sidebar__list">

        <li>
          <SidebarItem
            label="Projects"
            route="/projects"
            :collapsed="isCollapsed"
            :active="currentRoute === '/projects'"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
              </svg>
            </template>
          </SidebarItem>
        </li>

        <li>
          <SidebarItem
            label="Integrations"
            route="/integrations"
            :collapsed="isCollapsed"
            :active="currentRoute === '/integrations'"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
            </template>
          </SidebarItem>
        </li>

        <li>
          <SidebarItem
            label="Settings"
            route="/settings"
            :collapsed="isCollapsed"
            :active="currentRoute === '/settings'"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </template>
          </SidebarItem>
        </li>

      </ul>
    </nav>

    <!-- ── Logout Button Footer ── -->
    <div class="sidebar__footer">
      <button
        class="sidebar__logout-btn"
        :class="{ 'sidebar__logout-btn--collapsed': isCollapsed }"
        @click="emit('logout')"
        aria-label="Logout"
      >
        <span class="logout-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </span>
        <Transition name="label-fade">
          <span v-if="!isCollapsed" class="logout-label">Logout</span>
        </Transition>
      </button>
    </div>

  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';

const props = defineProps({
  user: { type: Object, default: null },
  riskCount: { type: Number, default: 0 },
});

const emit = defineEmits(['logout']);
const { isCollapsed } = useSidebar();
const route = useRoute();
const currentRoute = computed(() => route.path);

const userName = computed(() => props.user?.email?.split('@')[0] || 'User');
const userRole = computed(() => props.user?.roles?.[0] || 'Member');
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');

/* ── Sidebar Shell ── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width var(--transition);
  font-family: 'Open Sans', sans-serif;
  box-shadow: 4px 0 24px -8px rgba(0, 0, 0, 0.06);
  will-change: width;
}

.sidebar--collapsed {
  width: var(--sidebar-collapsed-width);
}

/* ── Logo ── */
.sidebar__logo {
  padding: 1rem;
  min-height: 20px;
  display: flex;
  align-items: center;
  overflow: hidden;
  flex-shrink: 0;
}

.sidebar__logo-wide {
  
  object-fit: contain;
  object-position: left;
 width: 127px;
}



.sidebar__logo-icon {
  width: 42px;
  height: 42px;
  object-fit: contain;
  border-radius: 8px;
}

/* Logo transitions */
.logo-fade-enter-active,
.logo-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.logo-fade-enter-from { opacity: 0; transform: scale(0.85); }
.logo-fade-leave-to  { opacity: 0; transform: scale(0.85); }

/* ── Nav ── */
.sidebar__nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.sidebar__nav::-webkit-scrollbar { width: 4px; }
.sidebar__nav::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.sidebar__list {
  list-style: none;
  margin: 0;
  padding: 0 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Section label ── */
.sidebar__section-label {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 0.5rem 1rem 0.25rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

/* ── Divider ── */
.sidebar__divider {
  height: 1px;
  background: var(--border);
  margin: 0.625rem 1rem;
}

/* ── Footer / Logout ── */
.sidebar__footer {
  border-top: 1px solid var(--border);
  padding: 0.875rem 0.75rem;
  flex-shrink: 0;
}

.sidebar__logout-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 14px;
  cursor: pointer;
  background: #fef2f2;
  border: none;
  color: #ef4444;
  font-weight: 600;
  font-size: 0.9rem;
  width: 100%;
  transition: all var(--transition);
  overflow: hidden;
  box-sizing: border-box;
}

.sidebar__logout-btn:hover {
  background: #fee2e2;
  color: #dc2626;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.08);
}

.sidebar__logout-btn--collapsed {
  justify-content: center;
  padding: 0;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  margin: 0 auto;
}

.sidebar__logout-btn--collapsed:hover {
  background: #fee2e2;
}

.logout-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logout-label {
  white-space: nowrap;
}

/* Label fade transition */
.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.label-fade-enter-from { opacity: 0; transform: translateX(-6px); }
.label-fade-leave-to  { opacity: 0; transform: translateX(-6px); }
</style>
