<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 12V15M12 15V18M12 15H15M12 15H9M9 6C9 4.34315 10.3431 3 12 3C13.6569 3 15 4.34315 15 6V9M8 21H16C17.6569 21 19 19.6569 19 18V12C19 10.3431 17.6569 9 16 9H8C6.34315 9 5 10.3431 5 12V18C5 19.6569 6.34315 21 8 21Z"
      stroke="#05BD8D"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UnblockIconColored',
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
