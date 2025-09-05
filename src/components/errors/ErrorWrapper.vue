<template>
  <div>
    <slot />
    <span v-show="!hideBottomSpace" :class="errorClass ?? classes">
      {{ errorMessage }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  isError?: boolean;
  errorMessage?: string;
  errorClass?: string;
  hideBottomSpace?: boolean;
}>();

const classes = computed(() => {
  const classes = ['error-wrapper__text'];
  if (props.isError) classes.push('error-wrapper__text-active');
  return classes;
});
</script>

<style scoped lang="scss">
.error-wrapper__text {
  display: flex;
  word-break: break-word;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-size: 12px;
  color: #dc3e3e;
  padding: 8px 0 0;
  width: 100%;
  line-height: 1;
  min-height: 20px;
  opacity: 0;
  transform: translateY(-5px);
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
  &-active {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
