<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M10 22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2H19C20.6569 2 22 3.34315 22 5V10M19.5 15.5L16.25 18.75C15.8358 19.1642 15.1642 19.1642 14.75 18.75C14.3358 18.3358 14.3358 17.6642 14.75 17.25L18.5 13.5C19.3284 12.6716 20.6716 12.6716 21.5 13.5C22.3284 14.3284 22.3284 15.6716 21.5 16.5L17.6213 20.3787C16.4497 21.5503 14.5503 21.5503 13.3787 20.3787L13.1213 20.1213C11.9497 18.9497 11.9497 17.0503 13.1213 15.8787L16 13M2 8H22M8 2V22"
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
