<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.4 19L7.5 18.9804C4.97708 18.7593 3 16.6979 3 14.1875C3 11.9675 4.5461 10.0986 6.64854 9.54307C7.00365 6.97789 9.26425 5 12 5C14.7358 5 16.9963 6.97789 17.3515 9.54307C19.4539 10.0986 21 11.9675 21 14.1875C21 16.6979 19.0229 18.7593 16.5 18.9804L15.6 19H8.4Z"
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
