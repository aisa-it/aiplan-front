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
      d="M10.3675 20.4558L12.3675 21.1225C13.6626 21.5542 15 20.5903 15 19.2251V14.0704C15 13.4017 15.3342 12.7772 15.8906 12.4063L20.1094 9.59373C20.6658 9.2228 21 8.59834 21 7.92963V6C21 4.89543 20.1046 4 19 4H5C3.89543 4 3 4.89543 3 6V7.92963C3 8.59834 3.3342 9.2228 3.8906 9.59373L8.1094 12.4063C8.6658 12.7772 9 13.4017 9 14.0704V18.5585C9 19.4193 9.55086 20.1836 10.3675 20.4558Z"
      :stroke="color"
      stroke-width="1.4"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FilterIcon',
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
