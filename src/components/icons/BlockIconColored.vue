<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 9V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V9M10 13L12 15M12 15L14 17M12 15L14 13M12 15L10 17M8 21H16C17.6569 21 19 19.6569 19 18V12C19 10.3431 17.6569 9 16 9H8C6.34315 9 5 10.3431 5 12V18C5 19.6569 6.34315 21 8 21Z"
      stroke="#DC3E3E"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BlockIconColored',
  props: {
    width: {
      type: Number,
      required: false,
      default: () => 24,
    },
    height: {
      type: Number,
      required: false,
      default: () => 24,
    },
  },
});
</script>
