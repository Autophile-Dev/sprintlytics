<template>
  <div class="app-loader-backdrop">
    <div class="app-loader">
      <div class="loader-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-loader-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
}

.app-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

/* Ring spinner */
.loader-ring {
  position: relative;
  width: 52px;
  height: 52px;
}

.loader-ring div {
  box-sizing: border-box;
  display: block;
  position: absolute;
  width: 44px;
  height: 44px;
  margin: 4px;
  border: 3.5px solid transparent;
  border-radius: 50%;
  animation: loader-spin 1.1s cubic-bezier(0.5, 0.1, 0.5, 0.9) infinite;
}

.loader-ring div:nth-child(1) {
  border-top-color: #059669;
  animation-delay: -0.45s;
}
.loader-ring div:nth-child(2) {
  border-top-color: #059669;
  opacity: 0.65;
  animation-delay: -0.3s;
}
.loader-ring div:nth-child(3) {
  border-top-color: #059669;
  opacity: 0.35;
  animation-delay: -0.15s;
}
.loader-ring div:nth-child(4) {
  border-top-color: #059669;
  opacity: 0.15;
}

@keyframes loader-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
