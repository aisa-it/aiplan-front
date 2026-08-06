<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 15.9998L9.45455 11.9998M9.45455 11.9998L11.5301 6.29202C11.6897 5.85318 12.3103 5.85318 12.4699 6.29202L14.5455 11.9998M9.45455 11.9998H14.5455M14.5455 11.9998L16 15.9998M17 20H7"
      :stroke="color"
      stroke-width="1.5"
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
