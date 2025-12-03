<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.70312 16.6992H3.70312C2.04627 16.6992 0.703125 15.3561 0.703125 13.6992V3.69922C0.703125 2.04236 2.04627 0.699219 3.70312 0.699219H8.46048C9.25613 0.699219 10.0192 1.01529 10.5818 1.5779L11.7031 2.69922M9.70312 11.6992L9.20312 11.1992C8.3747 10.3708 8.3747 9.02765 9.20312 8.19922C10.0316 7.37079 11.3747 7.37079 12.2031 8.19922L12.7031 8.69922M11.7031 13.6992L12.2031 14.1992C13.0316 15.0276 14.3747 15.0276 15.2031 14.1992C16.0316 13.3708 16.0316 12.0276 15.2031 11.1992L14.7031 10.6992M10.7031 9.69922L13.7031 12.6992M8.70312 2.69922H12.4605C13.2561 2.69922 14.0192 3.01529 14.5818 3.5779L17.8244 6.82054C18.3871 7.38315 18.7031 8.14621 18.7031 8.94186V15.6992C18.7031 17.3561 17.36 18.6992 15.7031 18.6992H8.70312C7.04627 18.6992 5.70312 17.3561 5.70312 15.6992V5.69922C5.70312 4.04236 7.04627 2.69922 8.70312 2.69922Z"
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
  name: 'CopyLinkIcon',
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
