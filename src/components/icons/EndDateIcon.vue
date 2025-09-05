<template>
  <svg
    viewBox="0 0 18 19"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
  >
    <path
      d="M6 1V3M12 1V3M4 10H11M11 10L8 13M11 10L8 7M14 6V14M4 18H14C15.6569 18 17 16.6569 17 15V5C17 3.34315 15.6569 2 14 2H4C2.34315 2 1 3.34315 1 5V15C1 16.6569 2.34315 18 4 18Z"
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
  name: 'EndDateIcon',
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
