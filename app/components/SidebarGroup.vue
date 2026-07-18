<template>
  <div
    class="sidebar-group"
    :class="{
      'sidebar-group--open': isOpen && !collapsed,
      'sidebar-group--active': active,
      'sidebar-group--collapsed': collapsed
    }"
  >
    <!-- Toggle Header -->
    <div
      class="sidebar-group__header"
      @click="toggle"
      role="button"
      tabindex="0"
      @keydown.enter="toggle"
    >
      <span class="sidebar-group__icon">
        <slot name="icon" />
      </span>

      <Transition name="fade">
        <span v-if="!collapsed" class="sidebar-group__label">
          {{ label }}
        </span>
      </Transition>

      <Transition name="fade">
        <span
          v-if="!collapsed"
          class="sidebar-group__arrow"
          :class="{ 'sidebar-group__arrow--open': isOpen }"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </span>
      </Transition>

      <!-- Tooltip when collapsed -->
      <span v-if="collapsed" class="sidebar-group__tooltip">
        {{ label }}
      </span>
    </div>

    <!-- Children (Submenu) -->
    <div
      v-if="!collapsed"
      class="sidebar-group__submenu-wrapper"
      :class="{ 'sidebar-group__submenu-wrapper--open': isOpen }"
    >
      <div class="sidebar-group__submenu-inner">
        <ul class="sidebar-group__submenu">
          <!-- Vertical connector line decoration to match design in the image -->
          <div class="sidebar-group__tree-line"></div>
          <slot name="children" />
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  collapsed: { type: Boolean, default: false },
  active: { type: Boolean, default: false }
});

const isOpen = ref(props.active);

// Sync open state with active route if changed externally
watch(() => props.active, (newVal) => {
  if (newVal) isOpen.value = true;
});

// Close submenu if sidebar collapses
watch(() => props.collapsed, (newVal) => {
  if (newVal) isOpen.value = false;
});

const toggle = () => {
  if (props.collapsed) return;
  isOpen.value = !isOpen.value;
};
</script>

<style scoped>
.sidebar-group {
  display: flex;
  flex-direction: column;
  position: relative;
}

.sidebar-group__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.875rem;
  border-radius: 10px;
  color: #4B5563;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  cursor: pointer;
  outline: none;
  position: relative;
}

.sidebar-group__header:hover {
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
}

.sidebar-group__header:hover .sidebar-group__arrow {
  color: #059669;
}

.sidebar-group--active .sidebar-group__header {
  color: #059669;
}

.sidebar-group__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-group__label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.sidebar-group__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  color: #9CA3AF;
}

.sidebar-group__arrow--open {
  transform: rotate(180deg);
  color: #059669;
}

/* Submenu Wrapper with modern CSS Grid auto-height transition */
.sidebar-group__submenu-wrapper {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, margin-top 0.3s ease;
  overflow: hidden;
  opacity: 0;
  margin-top: 0;
}

.sidebar-group__submenu-wrapper--open {
  grid-template-rows: 1fr;
  opacity: 1;
  margin-top: 4px;
}

.sidebar-group__submenu-inner {
  min-height: 0;
}

.sidebar-group__submenu {
  list-style: none;
  margin: 0;
  padding: 0 0 0 1.625rem; /* Indent sub items */
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Tree-line styling to mimic the connected line design in the image */
.sidebar-group__tree-line {
  position: absolute;
  left: 0.5rem;
  top: 0;
  bottom: 0.875rem; /* leaves space for bottom item branch offset */
  width: 1px;
  background-color: #E5E7EB;
}

/* Tooltip on Collapsed */
.sidebar-group__tooltip {
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

.sidebar-group--collapsed .sidebar-group__header {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar-group--collapsed .sidebar-group__header:hover .sidebar-group__tooltip {
  opacity: 1;
  transform: translateX(0);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
