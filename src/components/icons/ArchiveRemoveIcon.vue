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
      d="M3 7L3 14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V7"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5 7H3.5C2.56538 7 2.09808 7 1.75 6.79904C1.52197 6.66739 1.33261 6.47803 1.20096 6.25C1 5.90192 1 5.43462 1 4.5C1 3.56538 1 3.09808 1.20096 2.75C1.33261 2.52197 1.52197 2.33261 1.75 2.20096C2.09808 2 2.56538 2 3.5 2H20.5C21.4346 2 21.9019 2 22.25 2.20096C22.478 2.33261 22.6674 2.52197 22.799 2.75C23 3.09808 23 3.56538 23 4.5C23 5.43462 23 5.90192 22.799 6.25C22.6674 6.47803 22.478 6.66739 22.25 6.79904C21.9019 7 21.4346 7 20.5 7H19"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 17V6M8 10L12 6L16 10"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(
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
