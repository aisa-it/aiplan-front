<template>
  <svg
    viewBox="0 0 56 56"
    fill="none"
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7 37.3333L28 49L49 37.3333M7 28L28 39.6667L49 28M7 18.6667L28 7L49 18.6667L28 30.3333L7 18.6667Z"
      :stroke="color"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BufferIcon',
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
