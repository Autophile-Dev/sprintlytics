<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />

    <!-- Global Modal — mounted once at root, driven by useModal() composable -->
    <AppModal
      :show="modal.state.value.show"
      :type="modal.state.value.type"
      :title="modal.state.value.title"
      :message="modal.state.value.message"
      :confirm-label="modal.state.value.confirmLabel"
      :cancel-label="modal.state.value.cancelLabel"
      :auto-close="modal.state.value.autoClose"
      @close="modal.close()"
      @confirm="modal.handleConfirm()"
    />
  </div>
</template>

<script setup>
const modal = useModal();
</script>
