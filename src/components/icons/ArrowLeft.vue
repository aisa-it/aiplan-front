<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="color ? '' : 'default-icon-color'"
    :width="width"
    :height="height"
  >
    <path
      d="M14 17L10 12L14 7"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke="color"
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
