<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
  >
    <path
      d="M6 9L5 10V17C5 18.6569 6.34315 20 8 20H9C9.55228 20 10 19.5523 10 19V15C10 14.4477 10.4477 14 11 14H13C13.5523 14 14 14.4477 14 15V19C14 19.5523 14.4477 20 15 20H16C17.6569 20 19 18.6569 19 17V10L18 9M20 11L12 3L4 11"
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
  name: 'HomeIcon',
  props: {
    color: {
      type: String,
      required: false
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
