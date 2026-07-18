<template>
  <li class="sidebar-subitem-wrapper">
    <NuxtLink
      :to="route"
      class="sidebar-subitem"
      :class="{ 'sidebar-subitem--active': active }"
    >
      <span class="sidebar-subitem__label">{{ label }}</span>
    </NuxtLink>
  </li>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  route: { type: String, required: true },
  active: { type: Boolean, default: false }
});
</script>

<style scoped>
.sidebar-subitem-wrapper {
  position: relative;
}

/* Branch line connector logic to mimic the image */
.sidebar-subitem-wrapper::before {
  content: "";
  position: absolute;
  left: -1.125rem;
  top: 50%;
  width: 0.75rem;
  height: 1px;
  background-color: #E5E7EB;
}

.sidebar-subitem {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  color: #6B7280;
  text-decoration: none;
  font-size: 0.825rem;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sidebar-subitem:hover {
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
}

.sidebar-subitem--active {
  background: linear-gradient(135deg, #059669 0%, #065F46 100%) !important;
  color: #ffffff !important;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.15);
}
</style>
