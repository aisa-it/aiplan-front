<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6 4C4.34315 4 3 5.34315 3 7V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16V10C21 8.34315 19.6569 7 18 7H13C12.4477 7 12.0163 6.54 11.8356 6.01811C11.4289 4.84347 10.313 4 9 4H6Z"
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
