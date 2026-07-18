<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

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

<style>
:root {
  --sidebar-width: 248px;
  --sidebar-collapsed-width: 68px;
  --primary: #059669;
  --primary-dark: #065F46;
  --primary-light: #ECFDF5;
  --primary-mid: #D1FAE5;
  --text-main: #111827;
  --text-muted: #6B7280;
  --border: #E5E7EB;
  --bg: #ffffff;
  --hover-bg: #F9FAFB;
  --radius: 10px;
  --transition: 0.26s cubic-bezier(0.4, 0, 0.2, 1);
}

html, body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: #F9FAFB;
  font-family: 'Open Sans', sans-serif;
  height: 100%;
  width: 100%;
}
</style>
