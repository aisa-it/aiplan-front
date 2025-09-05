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
      d="M10 13.0002H15M5 19V6C5 4.34315 6.34315 3 8 3H18C18.5523 3 19 3.44772 19 4V16C19 16.5523 18.5523 17 18 17L7 17.0002C5.89543 17.0002 5 17.8954 5 19ZM5 19C5 20.1046 5.89543 21.0002 7 21.0002H18M10 7.00016H15V10.0002H10V7.00016Z"
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
  name: 'BookIcon',
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
