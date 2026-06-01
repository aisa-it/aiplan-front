<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 20V15L16 16M7 7L10.5 12.5M10.5 12.5L14 18M10.5 12.5L14 7M10.5 12.5L7 18"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
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
