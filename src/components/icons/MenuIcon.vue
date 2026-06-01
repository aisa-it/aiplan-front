<template>
  <svg
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 12H20M4 5H20M4 19H20"
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
    width: 24,
    height: 24,
  },
);
</script>
