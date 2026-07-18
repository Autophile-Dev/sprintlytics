<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-card" role="dialog" aria-modal="true">
        <!-- Close button top-right -->
        <button class="modal-close-btn" @click="closeModal" aria-label="Close Alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Icon Container -->
        <div class="modal-icon-wrapper" :class="type">
          <!-- Success Icon -->
          <svg v-if="type === 'success'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-linecap="round" stroke-linejoin="round"></circle>
            <polyline points="22 4 12 14.01 9 11.01" stroke-linecap="round" stroke-linejoin="round"></polyline>
          </svg>
          
          <!-- Error Icon -->
          <svg v-else-if="type === 'error'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>

          <!-- Warning Icon -->
          <svg v-else-if="type === 'warning'" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>

          <!-- Info Icon -->
          <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <!-- Text Content -->
        <div class="modal-body">
          <h3 class="modal-title">{{ title || defaultTitle }}</h3>
          <p class="modal-message">{{ message }}</p>
        </div>

        <!-- Button -->
        <div class="modal-actions">
          <button class="modal-action-btn" :class="type" @click="closeModal">
            Got it
          </button>
        </div>

        <!-- Auto-close progress bar indicator -->
        <div v-if="autoClose > 0" class="progress-bar-container">
          <div class="progress-bar" :class="type" :style="{ width: progressWidth + '%' }"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  type: {
    type: String,
    default: 'info' // 'success' | 'error' | 'warning' | 'info'
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  autoClose: {
    type: Number,
    default: 5000 // ms, set to 0 to disable auto close
  }
});

const emit = defineEmits(['close']);

const defaultTitle = computed(() => {
  if (props.type === 'success') return 'Success';
  if (props.type === 'error') return 'Error Occurred';
  if (props.type === 'warning') return 'Warning';
  return 'Notification';
});

const progressWidth = ref(100);
let timer = null;
let progressTimer = null;

const closeModal = () => {
  emit('close');
};

const startTimers = () => {
  clearTimers();
  if (props.autoClose > 0 && props.show) {
    const totalTime = props.autoClose;
    const interval = 50;
    let elapsed = 0;

    progressWidth.value = 100;
    
    progressTimer = setInterval(() => {
      elapsed += interval;
      progressWidth.value = Math.max(0, 100 - (elapsed / totalTime) * 100);
      if (elapsed >= totalTime) {
        clearInterval(progressTimer);
      }
    }, interval);

    timer = setTimeout(() => {
      closeModal();
    }, totalTime);
  }
};

const clearTimers = () => {
  if (timer) clearTimeout(timer);
  if (progressTimer) clearInterval(progressTimer);
};

watch(() => props.show, (newVal) => {
  if (newVal) {
    startTimers();
  } else {
    clearTimers();
  }
}, { immediate: true });

onBeforeUnmount(() => {
  clearTimers();
});
</script>

<style scoped>
/* Backdrop overlay */
.modal-backdrop {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

/* Card Container */
.modal-card {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #E5E7EB;
  width: 100%;
  max-width: 400px;
  padding: 2.25rem 2rem 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
  animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Close Button */
.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background-color: #F3F4F6;
  color: #4B5563;
}

/* Illustrative Icon wrapper */
.modal-icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 1.25rem;
  transition: transform 0.3s ease;
}

.modal-card:hover .modal-icon-wrapper {
  transform: scale(1.08);
}

/* Icon Variant Styling */
.modal-icon-wrapper.success {
  background-color: #ECFDF5;
  color: #059669; /* Emerald */
}

.modal-icon-wrapper.error {
  background-color: #FEF2F2;
  color: #EF4444; /* Red */
}

.modal-icon-wrapper.warning {
  background-color: #FFFBEB;
  color: #F59E0B; /* Amber */
}

.modal-icon-wrapper.info {
  background-color: #EFF6FF;
  color: #3B82F6; /* Blue */
}

/* Content */
.modal-body {
  margin-bottom: 1.5rem;
}

.modal-title {
  font-family: 'Open Sans', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.modal-message {
  font-size: 0.95rem;
  color: #4B5563;
  line-height: 1.5;
}

/* Button action */
.modal-actions {
  width: 100%;
}

.modal-action-btn {
  width: 100%;
  border: none;
  border-radius: 12px;
  padding: 0.75rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Button variants */
.modal-action-btn.success {
  background-color: #059669;
  color: #ffffff;
}
.modal-action-btn.success:hover {
  background-color: #047857;
}

.modal-action-btn.error {
  background-color: #EF4444;
  color: #ffffff;
}
.modal-action-btn.error:hover {
  background-color: #DC2626;
}

.modal-action-btn.warning {
  background-color: #F59E0B;
  color: #ffffff;
}
.modal-action-btn.warning:hover {
  background-color: #D97706;
}

.modal-action-btn.info {
  background-color: #3B82F6;
  color: #ffffff;
}
.modal-action-btn.info:hover {
  background-color: #2563EB;
}

/* Progress bar timer */
.progress-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background-color: #F3F4F6;
}

.progress-bar {
  height: 100%;
  width: 100%;
  transition: width 0.05s linear;
}

.progress-bar.success {
  background-color: #059669;
}

.progress-bar.error {
  background-color: #EF4444;
}

.progress-bar.warning {
  background-color: #F59E0B;
}

.progress-bar.info {
  background-color: #3B82F6;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
