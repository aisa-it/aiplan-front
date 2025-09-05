<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 16H6C8.20914 16 10 14.2091 10 12M10 12V9C10 7.89543 9.10457 7 8 7H7C5.89543 7 5 7.89543 5 9V10C5 11.1046 5.89543 12 7 12H10ZM13 16H14C16.2091 16 18 14.2091 18 12M18 12V9C18 7.89543 17.1046 7 16 7H15C13.8954 7 13 7.89543 13 9V10C13 11.1046 13.8954 12 15 12H18Z"
      stroke="currentColor"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'QuoteIcon',
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
