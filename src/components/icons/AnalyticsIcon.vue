<template>
  <svg
    :class="color ? '' : 'default-icon-color'"
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 16L20 20M18 11C18 12.5263 17.5012 14.0107 16.5795 15.2272C15.6578 16.4437 14.3638 17.3257 12.8945 17.7388C11.4252 18.1518 9.86116 18.0734 8.44059 17.5153C7.02001 16.9573 5.82075 15.9502 5.02545 14.6476C4.23015 13.3449 3.8824 11.818 4.03516 10.2994C4.18791 8.78082 4.83281 7.35377 5.87162 6.2356C6.91043 5.11742 8.28623 4.36941 9.78949 4.10547C11.2927 3.84153 12.8411 4.07614 14.1987 4.77357M7.00001 12L10 9.00001L13 12L20 5.00001M20 5.00001H18M20 5.00001V7.00001"
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
  name: 'ArrowDown',
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
