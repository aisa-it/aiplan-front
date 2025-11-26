<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8.70313 10.6992L18.7031 0.699219M18.7031 0.699219H12.7031M18.7031 0.699219V6.69922M18.7031 12.6992V15.6992C18.7031 17.3561 17.36 18.6992 15.7031 18.6992H3.70312C2.04627 18.6992 0.703125 17.3561 0.703125 15.6992V3.69922C0.703125 2.04237 2.04627 0.699219 3.70313 0.699219H6.70313"
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
  name: 'OpenNewTabIcon',
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
