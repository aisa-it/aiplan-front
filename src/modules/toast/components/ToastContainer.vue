<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast-stack"
      tag="div"
      class="app-toast-stack"
      :class="[
        themeClass,
        { 'app-toast-stack--active': toasts.length > 0 },
      ]"
      :tabindex="toasts.length ? 0 : -1"
      role="region"
      aria-label="Уведомления"
    >
      <ToastItem
        v-for="item in toasts"
        :key="item.id"
        :toast="item"
        @close="removeToast(item.id)"
      />
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import ToastItem from './ToastItem.vue';
import { useToastStack } from '../toast';

const theme = useTheme();
const themeClass = computed(() => `v-theme--${theme.global.name.value}`);
const { toasts, removeToast } = useToastStack();
</script>

<style scoped lang="scss">
.app-toast-stack {
  position: fixed;
  z-index: 10000;
  top: 46px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  max-height: calc(100dvh - 54px);
  padding: 8px 8px 8px 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: none;
}

.app-toast-stack--active {
  pointer-events: auto;
}

.toast-stack-move,
.toast-stack-enter-active,
.toast-stack-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.toast-stack-enter-from,
.toast-stack-leave-to {
  opacity: 0;
  transform: translateX(24px);
}
</style>
