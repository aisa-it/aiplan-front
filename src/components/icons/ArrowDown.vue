<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="color ? '' : 'default-icon-color'"
    :width="width"
    :height="height"
  >
    <path
      d="M17 11L12 15L7 11"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke="color"
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
