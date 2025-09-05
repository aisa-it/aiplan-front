<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="12" class="import-icons-bg" />
    <path
      d="M4 12C4 14.1217 4.84285 16.1566 6.34315 17.6569C7.84344 19.1571 9.87827 20 12 20C14.1217 20 16.1566 19.1571 17.6569 17.6569C19.1571 16.1566 20 14.1217 20 12H4Z"
      class="import-icons"
    />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M15.5301 10.47C15.3895 10.3295 15.1988 10.2507 15.0001 10.2507C14.8013 10.2507 14.6107 10.3295 14.4701 10.47L12.7501 12.19V4C12.7501 3.80109 12.6711 3.61032 12.5304 3.46967C12.3898 3.32902 12.199 3.25 12.0001 3.25C11.8012 3.25 11.6104 3.32902 11.4698 3.46967C11.3291 3.61032 11.2501 3.80109 11.2501 4V12.19L9.53009 10.47C9.38792 10.3375 9.19987 10.2654 9.00557 10.2688C8.81127 10.2723 8.62588 10.351 8.48847 10.4884C8.35106 10.6258 8.27234 10.8112 8.26892 11.0055C8.26549 11.1998 8.33761 11.3878 8.47009 11.53L11.4701 14.53C11.6107 14.6705 11.8013 14.7493 12.0001 14.7493C12.1988 14.7493 12.3895 14.6705 12.5301 14.53L15.5301 11.53C15.6705 11.3894 15.7494 11.1988 15.7494 11C15.7494 10.8012 15.6705 10.6106 15.5301 10.47Z"
      :fill="secondColor"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AddIcon',
  props: {
    firstColor: {
      type: String,
      required: false,
    },
    secondColor: {
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
// fill="#DDE2EA"
// fill="#BAC4D5"
</script>
