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
      d="M14.0005 12L16.0005 10L10.0005 16C9.44817 16.5523 8.55274 16.5523 8.00045 16C7.44817 15.4477 7.44817 14.5523 8.00045 14L15.0005 7C16.105 5.89543 17.8959 5.89543 19.0005 7C20.105 8.10457 20.105 9.89543 19.0005 11L12.0005 18C10.3436 19.6569 7.65731 19.6569 6.00045 18C4.3436 16.3431 4.3436 13.6569 6.00045 12L12.0005 6L10.0005 8"
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
  name: 'ClipIcon',
  props: {
    color: {
      type: String,
      required: false,
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
