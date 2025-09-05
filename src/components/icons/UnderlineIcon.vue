<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 4V13C8 13.5253 8.10346 14.0454 8.30448 14.5307C8.5055 15.016 8.80014 15.457 9.17157 15.8284C9.543 16.1999 9.98396 16.4945 10.4693 16.6955C10.9546 16.8965 11.4747 17 12 17C12.5253 17 13.0454 16.8965 13.5307 16.6955C14.016 16.4945 14.457 16.1999 14.8284 15.8284C15.1999 15.457 15.4945 15.016 15.6955 14.5307C15.8965 14.0454 16 13.5253 16 13V4M5 21H19"
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
  name: 'UnderlineIcon',
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
