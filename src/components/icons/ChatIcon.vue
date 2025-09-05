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
      d="M6 15C6 16.6569 7.34315 18 9 18H18L21 21V9C21 7.34315 19.6569 6 18 6M6 15H15C16.6569 15 18 13.6569 18 12V6M6 15L3 18V6C3 4.34315 4.34315 3 6 3H15C16.6569 3 18 4.34315 18 6"
      :stroke="color"
      stroke-width="1.4"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ChatIcon',
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
