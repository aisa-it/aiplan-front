<template>
  <Teleport to="body">
    <TransitionGroup
      name="toast-stack"
      tag="div"
      class="app-toast-stack"
      :class="themeClass"
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

<style lang="scss">
.app-toast-stack {
  position: fixed;
  z-index: 10000;
  top: 54px;
  right: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  pointer-events: none;
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
