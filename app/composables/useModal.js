/**
 * useModal — Global composable to show AppModal from any component/page.
 *
 * Usage:
 *   const modal = useModal()
 *
 *   // Simple alert
 *   modal.show({ type: 'success', title: 'Saved!', message: 'Your data was saved.' })
 *
 *   // Confirmation with callback
 *   modal.show({
 *     type: 'deleteConfirmation',
 *     title: 'Delete Item',
 *     message: 'This action cannot be undone.',
 *     onConfirm: () => deleteItem(id),
 *   })
 *
 *   // Convenience shortcuts
 *   modal.success('Done!', 'Record saved successfully.')
 *   modal.error('Failed', 'Something went wrong.')
 *   modal.warning('Heads up', 'Check your input.')
 *   modal.info('Note', 'Session expires soon.')
 *   modal.confirm({ title: 'Logout', message: 'Are you sure?', type: 'logoutConfirmation', onConfirm: logout })
 */

import { ref, readonly } from 'vue';

const _state = ref({
  show: false,
  type: 'info',
  title: '',
  message: '',
  confirmLabel: '',
  cancelLabel: '',
  onConfirm: null,
  autoClose: 4000,
});

export function useModal() {
  /**
   * Open the modal.
   * @param {Object} options
   * @param {'success'|'error'|'warning'|'warningConfirmation'|'info'|'deleteConfirmation'|'logoutConfirmation'|'activateConfirmation'|'deactivateConfirmation'} options.type
   * @param {string}   options.title
   * @param {string}   options.message
   * @param {string}   [options.confirmLabel]
   * @param {string}   [options.cancelLabel]
   * @param {Function} [options.onConfirm]  - callback fired when confirm button clicked
   * @param {number}   [options.autoClose]  - ms (0 = disabled). Ignored for confirmation types.
   */
  const show = (options) => {
    _state.value = {
      show: true,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      confirmLabel: options.confirmLabel || '',
      cancelLabel: options.cancelLabel || '',
      onConfirm: options.onConfirm || null,
      autoClose: options.autoClose !== undefined ? options.autoClose : 4000,
    };
  };

  const close = () => {
    _state.value = { ..._state.value, show: false };
  };

  const handleConfirm = () => {
    if (typeof _state.value.onConfirm === 'function') {
      _state.value.onConfirm();
    }
    close();
  };

  // ── Convenience shortcuts ──────────────────────────────────────────────────
  const success = (title, message, opts = {}) =>
    show({ type: 'success', title, message, ...opts });

  const error = (title, message, opts = {}) =>
    show({ type: 'error', title, message, autoClose: 0, ...opts });

  const warning = (title, message, opts = {}) =>
    show({ type: 'warning', title, message, ...opts });

  const info = (title, message, opts = {}) =>
    show({ type: 'info', title, message, ...opts });

  /**
   * Confirmation dialog shortcut.
   * @param {Object} options - same as show(), type defaults to 'warningConfirmation'
   */
  const confirm = (options) =>
    show({ type: 'warningConfirmation', autoClose: 0, ...options });

  return {
    state: readonly(_state),
    show,
    close,
    handleConfirm,
    // Shortcuts
    success,
    error,
    warning,
    info,
    confirm,
  };
}
