<template>
  <div class="custom-select" ref="containerRef">
    <!-- Select Button -->
    <button
      type="button"
      class="custom-select-trigger"
      :class="{ open: isOpen }"
      @click="toggleOpen"
    >
      <span class="selected-text">{{ selectedLabel }}</span>
      <svg class="chevron-icon" :class="{ rotated: isOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <!-- Options Dropdown Menu -->
    <Transition name="fade-slide">
      <div v-if="isOpen" class="custom-select-options">
        <div
          v-for="opt in options"
          :key="opt.value"
          class="custom-select-option"
          :class="{ selected: opt.value === modelValue }"
          @click="selectOption(opt)"
        >
          <span class="option-label">{{ opt.label }}</span>
          <svg v-if="opt.value === modelValue" class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: () => [] } // array of { label, value }
});

const emit = defineEmits(['update:modelValue', 'change']);

const isOpen = ref(false);
const containerRef = ref(null);

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue);
  return found ? found.label : 'Select Option';
});

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};

const selectOption = (opt) => {
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  isOpen.value = false;
};

const handleClickOutside = (e) => {
  if (containerRef.value && !containerRef.value.contains(e.target)) {
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
.custom-select {
  position: relative;
  display: inline-block;
  min-width: 210px;
}

.custom-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  width: 100%;
  padding: 0.5rem 0.9rem;
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1F2937;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.custom-select-trigger:hover {
  border-color: #A7F3D0;
  background-color: #F9FAFB;
}

.custom-select-trigger.open {
  border-color: #059669;
  box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.15);
}

.selected-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chevron-icon {
  color: #6B7280;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
  color: #059669;
}

.custom-select-options {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: #ffffff;
  border: 1px solid #E5E7EB;
  border-radius: 14px;
  box-shadow: 0 12px 28px -4px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.06);
  z-index: 1000;
  max-height: 260px;
  overflow-y: auto;
  padding: 0.4rem;
}

.custom-select-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  font-size: 0.825rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.15s ease;
}

.custom-select-option:hover {
  background-color: rgba(5, 150, 105, 0.08);
  color: #059669;
}

.custom-select-option.selected {
  background-color: #ECFDF5;
  color: #059669;
  font-weight: 600;
}

.check-icon {
  color: #059669;
  flex-shrink: 0;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
