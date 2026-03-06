<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M4 20H20M18 16H20M15 12L18 12M12 8L15 8M4 4H11"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
    />
  </svg>
</template>
<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
    width?: number;
    height?: number;
  }>(),
  {
    color: 'currentColor',
    width: 24,
    height: 24,
  },
);
</script>
