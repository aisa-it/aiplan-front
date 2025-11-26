<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.70313 12.6992H6.70313M6.70313 12.6992L6.70312 17.6992M6.70313 12.6992L0.703125 18.6992M16.7031 0.699219L10.7031 0.699219C9.59856 0.699219 8.70313 1.59465 8.70312 2.69922L8.70312 8.69922C8.70312 9.80379 9.59855 10.6992 10.7031 10.6992L16.7031 10.6992C17.8077 10.6992 18.7031 9.80379 18.7031 8.69922V2.69922C18.7031 1.59465 17.8077 0.699219 16.7031 0.699219Z"
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
  name: 'OpenNewWindowIcon',
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
