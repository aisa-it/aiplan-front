<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.37763 7.53433C7.00313 8.13555 6.74923 8.8157 6.64854 9.54307C4.5461 10.0986 3 11.9675 3 14.1875C3 16.6979 4.97708 18.7593 7.5 18.9804L8.4 19H15.6L16.5 18.9804C17.1759 18.9212 17.8126 18.7299 18.3826 18.4332M4 4L20 20M9.18196 5.7707C10.0023 5.28183 10.9673 5 12 5C14.7358 5 16.9963 6.97789 17.3515 9.54307C19.4539 10.0986 21 11.9675 21 14.1875C21 15.1479 20.7106 16.0426 20.212 16.7937"
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
  name: 'CloudsDisable',
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
