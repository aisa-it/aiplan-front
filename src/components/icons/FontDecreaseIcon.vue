<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 10.9999H16M3 17.9993L4.66651 13.9999M4.66651 13.9999L7.87174 6.30769C7.9494 6.12131 8.13154 5.99993 8.33345 6L8.6668 6.00012C8.86858 6.00019 9.05055 6.12154 9.12816 6.3078L12.3334 13.9999M4.66651 13.9999H12.3334M12.3334 13.9999L14 17.9993"
      :stroke="color"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FontDecreaseIcon',
  props: {
    color: {
      type: String,
      required: false,
      default: () => 'currentColor',
    },
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
