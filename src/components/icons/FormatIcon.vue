<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 16.9993L8.66651 12.9999M8.66651 12.9999L11.8717 5.30769C11.9494 5.12131 12.1315 4.99993 12.3335 5L12.6668 5.00012C12.8686 5.00019 13.0505 5.12154 13.1282 5.3078L17.5 16.9993M8.66651 12.9999L16 13"
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
