<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 10H16V9.66667C16 8.74619 16.7462 8 17.6667 8C18.403 8 19 7.40305 19 6.66667V6.5C19 5.67157 18.3284 5 17.5 5H17C16.4477 5 16 5.44772 16 6M7 7L10.5 12.5M10.5 12.5L14 18M10.5 12.5L14 7M10.5 12.5L7 18"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SuperscriptIcon',
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
