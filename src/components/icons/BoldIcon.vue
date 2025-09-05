<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 12C13.5253 12 14.0454 11.8965 14.5307 11.6955C15.016 11.4945 15.457 11.1999 15.8284 10.8284C16.1999 10.457 16.4945 10.016 16.6955 9.53074C16.8965 9.04543 17 8.52529 17 8C17 7.47471 16.8965 6.95457 16.6955 6.46927C16.4945 5.98396 16.1999 5.54301 15.8284 5.17157C15.457 4.80014 15.016 4.5055 14.5307 4.30448C14.0454 4.10346 13.5253 4 13 4H8V20H14C14.5253 20 15.0454 19.8965 15.5307 19.6955C16.016 19.4945 16.457 19.1999 16.8284 18.8284C17.1999 18.457 17.4945 18.016 17.6955 17.5307C17.8965 17.0454 18 16.5253 18 16C18 15.4747 17.8965 14.9546 17.6955 14.4693C17.4945 13.984 17.1999 13.543 16.8284 13.1716C16.457 12.8001 16.016 12.5055 15.5307 12.3045C15.0454 12.1035 14.5253 12 14 12H8"
      :stroke="color"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BoldIcon',
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
