<template>
  <Transition name="modal-fade">
    <div v-if="show" class="modal-backdrop" @click.self="handleBackdropClick" role="dialog" aria-modal="true" :aria-labelledby="'modal-title-' + _uid">
      <!-- Modal Card -->
      <div class="modal-card">

        <!-- Close Button (top-right) -->
        <button class="modal-close-btn" @click="handleClose" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <!-- Icon -->
        <div class="modal-icon-wrapper" :class="selected.iconClass">
          <!-- Success -->
          <svg v-if="type === 'success'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <!-- Error -->
          <svg v-else-if="type === 'error'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <!-- Warning / warningConfirmation -->
          <svg v-else-if="type === 'warning' || type === 'warningConfirmation'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          <!-- deleteConfirmation -->
          <svg v-else-if="type === 'deleteConfirmation'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/>
            <path d="M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <!-- logoutConfirmation -->
          <svg v-else-if="type === 'logoutConfirmation'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <!-- activateConfirmation -->
          <svg v-else-if="type === 'activateConfirmation'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
          <!-- deactivateConfirmation -->
          <svg v-else-if="type === 'deactivateConfirmation'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            <line x1="4" y1="4" x2="20" y2="20"/>
          </svg>
          <!-- Info (default) -->
          <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </div>

        <!-- Text -->
        <div class="modal-body">
          <h3 class="modal-title" :id="'modal-title-' + _uid">{{ title || selected.defaultTitle }}</h3>
          <p class="modal-message">{{ message }}</p>
        </div>

        <!-- Buttons -->
        <div class="modal-actions" :class="{ 'has-cancel': selected.showCancel }">
          <button
            v-if="selected.showCancel"
            class="modal-btn modal-btn-cancel"
            @click="handleClose"
          >
            {{ cancelLabel || selected.cancelText }}
          </button>
          <button
            class="modal-btn modal-btn-confirm"
            :class="selected.confirmBtnClass"
            @click="handleConfirm"
          >
            {{ confirmLabel || selected.confirmText }}
          </button>
        </div>

        <!-- Auto-close progress bar -->
        <div v-if="autoClose > 0 && !selected.showCancel" class="progress-bar-container">
          <div class="progress-bar" :class="selected.progressClass" :style="{ width: progressWidth + '%' }"></div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';

// Unique ID for aria
const _uid = Math.random().toString(36).slice(2, 7);

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  type: {
    type: String,
    default: 'info',
    // 'success' | 'error' | 'warning' | 'warningConfirmation' | 'info'
    // 'deleteConfirmation' | 'logoutConfirmation' | 'activateConfirmation' | 'deactivateConfirmation'
  },
  title: { type: String, default: '' },
  message: { type: String, required: true },
  confirmLabel: { type: String, default: '' },
  cancelLabel: { type: String, default: '' },
  autoClose: { type: Number, default: 4000 }, // ms — 0 to disable
});

const emit = defineEmits(['close', 'confirm']);

// --- Config map (mirrors the React version) ---
const CONFIG = {
  success: {
    defaultTitle: 'Success',
    iconClass: 'icon-success',
    confirmText: 'Got it',
    confirmBtnClass: 'btn-success',
    progressClass: 'bar-success',
    showCancel: false,
  },
  error: {
    defaultTitle: 'Error Occurred',
    iconClass: 'icon-error',
    confirmText: 'Close',
    confirmBtnClass: 'btn-error',
    progressClass: 'bar-error',
    showCancel: false,
  },
  warning: {
    defaultTitle: 'Warning',
    iconClass: 'icon-warning',
    confirmText: 'OK',
    confirmBtnClass: 'btn-warning',
    progressClass: 'bar-warning',
    showCancel: false,
  },
  warningConfirmation: {
    defaultTitle: 'Are you sure?',
    iconClass: 'icon-warning-confirm',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmBtnClass: 'btn-warning',
    showCancel: true,
  },
  info: {
    defaultTitle: 'Info',
    iconClass: 'icon-info',
    confirmText: 'Got it',
    confirmBtnClass: 'btn-info',
    progressClass: 'bar-info',
    showCancel: false,
  },
  deleteConfirmation: {
    defaultTitle: 'Delete Confirmation',
    iconClass: 'icon-delete',
    confirmText: 'Delete',
    cancelText: 'Cancel',
    confirmBtnClass: 'btn-error',
    showCancel: true,
  },
  logoutConfirmation: {
    defaultTitle: 'Logout',
    iconClass: 'icon-logout',
    confirmText: 'Logout',
    cancelText: 'Cancel',
    confirmBtnClass: 'btn-logout',
    showCancel: true,
  },
  activateConfirmation: {
    defaultTitle: 'Activate',
    iconClass: 'icon-activate',
    confirmText: 'Activate',
    cancelText: 'Cancel',
    confirmBtnClass: 'btn-success',
    showCancel: true,
  },
  deactivateConfirmation: {
    defaultTitle: 'Deactivate',
    iconClass: 'icon-deactivate',
    confirmText: 'Deactivate',
    cancelText: 'Cancel',
    confirmBtnClass: 'btn-error',
    showCancel: true,
  },
};

const selected = computed(() => CONFIG[props.type] || CONFIG.info);

// --- Actions ---
const handleClose = () => emit('close');

const handleConfirm = () => {
  emit('confirm');
  emit('close');
};

const handleBackdropClick = () => {
  // Confirmation modals should not close on backdrop click
  if (!selected.value.showCancel) handleClose();
};

// --- Escape key ---
const onKeydown = (e) => {
  if (e.key === 'Escape' && props.show) handleClose();
};

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));

// --- Body scroll lock ---
watch(() => props.show, (val) => {
  document.body.style.overflow = val ? 'hidden' : '';
});

// --- Auto-close progress bar ---
const progressWidth = ref(100);
let timer = null;
let progressTimer = null;

const clearTimers = () => {
  if (timer) clearTimeout(timer);
  if (progressTimer) clearInterval(progressTimer);
};

const startTimers = () => {
  clearTimers();
  if (props.autoClose > 0 && props.show && !selected.value.showCancel) {
    const total = props.autoClose;
    const interval = 50;
    let elapsed = 0;
    progressWidth.value = 100;

    progressTimer = setInterval(() => {
      elapsed += interval;
      progressWidth.value = Math.max(0, 100 - (elapsed / total) * 100);
      if (elapsed >= total) clearInterval(progressTimer);
    }, interval);

    timer = setTimeout(() => handleClose(), total);
  }
};

watch(() => props.show, (val) => {
  if (val) startTimers();
  else clearTimers();
}, { immediate: true });

onBeforeUnmount(clearTimers);
</script>

<style scoped>
/* Font Imports — matches login.vue */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
/* ── Backdrop ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

/* ── Card ── */
.modal-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 24px;
  padding: 2.25rem 2rem 1.75rem;
  box-shadow:
    0 32px 64px -12px rgba(0, 0, 0, 0.14),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  overflow: hidden;
  animation: modal-slide-up 0.28s cubic-bezier(0.16, 1, 0.3, 1) both;
  max-height: 90vh;
  overflow-y: auto;
  font-family: 'Open Sans', sans-serif;
}

@keyframes modal-slide-up {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ── Close button ── */
.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 32px;
  height: 32px;
  border: none;
  background: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9CA3AF;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
}
.modal-close-btn:hover {
  background: #F3F4F6;
  color: #374151;
}

/* ── Icon wrapper ── */
.modal-icon-wrapper {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  margin-bottom: 1.25rem;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}
.modal-card:hover .modal-icon-wrapper {
  transform: scale(1.06);
}

/* Icon colours */
.icon-success         { background: #ECFDF5; color: #059669; }
.icon-error           { background: #FEF2F2; color: #EF4444; }
.icon-warning         { background: #FFFBEB; color: #F59E0B; }
.icon-warning-confirm { background: #FFF7ED; color: #F97316; }
.icon-info            { background: #EFF6FF; color: #3B82F6; }
.icon-delete          { background: #FEF2F2; color: #EF4444; }
.icon-logout          { background: #FFF7ED; color: #EA580C; }
.icon-activate        { background: #ECFDF5; color: #059669; }
.icon-deactivate      { background: #FEF2F2; color: #EF4444; }

/* ── Body ── */
.modal-body {
  margin-bottom: 1.5rem;
  width: 100%;
}
.modal-title {
  font-family: 'Tan Mon Cherie', 'Playfair Display', serif;
  font-size: 1.25rem;
  font-weight: 400;
  color: #111827;
  margin: 0 0 0.5rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
}
.modal-message {
  font-family: 'Open Sans', sans-serif;
  font-size: 0.9rem;
  color: #6B7280;
  line-height: 1.6;
  margin: 0;
  word-break: break-word;
}

/* ── Actions ── */
.modal-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}
.modal-actions.has-cancel {
  flex-direction: row;
  justify-content: center;
}

/* ── Buttons ── */
.modal-btn {
  border: none;
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  flex: 1;
  min-width: 0;
}

.modal-btn-cancel {
  background: #F3F4F6;
  color: #374151;
}
.modal-btn-cancel:hover {
  background: #E5E7EB;
}

/* Confirm variants */
.btn-success { background: #059669; color: #fff; }
.btn-success:hover { background: #047857; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35); }

.btn-error { background: #EF4444; color: #fff; }
.btn-error:hover { background: #DC2626; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35); }

.btn-warning { background: #F59E0B; color: #fff; }
.btn-warning:hover { background: #D97706; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35); }

.btn-info { background: #3B82F6; color: #fff; }
.btn-info:hover { background: #2563EB; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59, 130, 246, 0.35); }

.btn-logout { background: #EA580C; color: #fff; }
.btn-logout:hover { background: #C2410C; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(234, 88, 12, 0.35); }

/* ── Progress bar ── */
.progress-bar-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: #F3F4F6;
}
.progress-bar {
  height: 100%;
  transition: width 0.05s linear;
}
.bar-success  { background: #059669; }
.bar-error    { background: #EF4444; }
.bar-warning  { background: #F59E0B; }
.bar-info     { background: #3B82F6; }

/* ── Transition ── */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
