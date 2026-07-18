<template>
  <NuxtLink
    :to="route"
    class="sidebar-item"
    :class="{
      'sidebar-item--active': active,
      'sidebar-item--collapsed': collapsed
    }"
  >
    <!-- Icon Slot -->
    <span class="sidebar-item__icon">
      <slot name="icon" />
    </span>

    <!-- Label -->
    <Transition name="fade">
      <span v-if="!collapsed" class="sidebar-item__label">
        {{ label }}
      </span>
    </Transition>

    <!-- Badge -->
    <Transition name="fade">
      <span
        v-if="!collapsed && badge !== undefined && badge !== null && badge > 0"
        class="sidebar-item__badge"
        :class="'sidebar-item__badge--' + badgeVariant"
      >
        {{ badge }}
      </span>
    </Transition>

    <!-- Tooltip (only when collapsed) -->
    <span v-if="collapsed" class="sidebar-item__tooltip">
      {{ label }}
    </span>
  </NuxtLink>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  route: { type: String, required: true },
  collapsed: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  badge: { type: [Number, String], default: null },
  badgeVariant: { type: String, default: 'primary' } // 'primary' | 'danger'
});
</script>

<style scoped>
.sidebar-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 10px;
  color: #4B5563;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-item:hover {
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
}

.sidebar-item--active {
  background: linear-gradient(135deg, #059669 0%, #065F46 100%) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}

.sidebar-item--active::before {
  display: none;
}

.sidebar-item__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.sidebar-item--active .sidebar-item__icon {
  color: #ffffff !important;
}

.sidebar-item__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* Badge styling */
.sidebar-item__badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 6px;
  line-height: 1;
}

.sidebar-item__badge--primary {
  background-color: #D1FAE5;
  color: #059669;
}

.sidebar-item__badge--danger {
  background-color: #FEE2E2;
  color: #EF4444;
}

/* Tooltip on Collapsed */
.sidebar-item__tooltip {
  position: absolute;
  left: 100%;
  margin-left: 0.75rem;
  padding: 0.375rem 0.625rem;
  background-color: #1F2937;
  color: #ffffff;
  font-size: 0.75rem;
  border-radius: 6px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease, transform 0.15s ease;
  transform: translateX(-4px);
  z-index: 1000;
}

.sidebar-item--collapsed {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar-item--collapsed:hover .sidebar-item__tooltip {
  opacity: 1;
  transform: translateX(0);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
