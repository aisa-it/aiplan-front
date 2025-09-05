<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 6H21M11 12H21M11 18H21M4.3125 10H5.8125C6.36478 10 6.8125 10.4477 6.8125 11C6.8125 11.5523 6.36478 12 5.8125 12H5.5625C4.87214 12 4.3125 12.5596 4.3125 13.25V13.8182C4.3125 13.9186 4.3939 14 4.49432 14H6.8125M5.25 8V4.25C5.25 4.11193 5.13807 4 5 4H4.625M5.25 8H6.25M5.25 8H4.25M4.3125 20H5.6875C6.30882 20 6.8125 19.4963 6.8125 18.875C6.8125 18.2537 6.30882 17.75 5.6875 17.75H5.5625L6.53014 16.3953C6.64833 16.2298 6.53005 16 6.3267 16H4.3125"
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
  name: 'ListNumIcon',
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
