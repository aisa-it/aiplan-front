<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 12H14.5M17 12H14.5M14.5 12V17"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M8 19H6C4.34315 19 3 17.6569 3 16V6C3 4.34315 4.34315 3 6 3H10.7574C11.553 3 12.3161 3.31607 12.8787 3.87868L14 5M11 5H14.7574C15.553 5 16.3161 5.31607 16.8787 5.87868L20.1213 9.12132C20.6839 9.68393 21 10.447 21 11.2426V18C21 19.6569 19.6569 21 18 21H11C9.34315 21 8 19.6569 8 18V8C8 6.34315 9.34315 5 11 5Z"
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
  name: 'CopyNameIcon',
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
