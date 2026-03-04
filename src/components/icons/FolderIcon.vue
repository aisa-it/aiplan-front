<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :width="width || 24"
    :height="height || 24"
    :fill="color || 'currentColor'"
  >
    <path
      d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"
    />
  </svg>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number | string;
    height?: number | string;
    color?: string;
  }>(),
  {
    width: 24,
    height: 24,
    color: 'currentColor',
  },
);
</script>
