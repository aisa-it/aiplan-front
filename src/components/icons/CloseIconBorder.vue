<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
  >
    <rect
      x="2.5"
      y="2.5"
      width="19"
      height="19"
      rx="4"
      :stroke="color"
      stroke-width="1.4"
      fill="none"
    />
    <path
      d="M8 8L16 16M16 8L8 16"
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
  name: 'CloseIconBorder',
  props: {
    color: {
      type: String,
      required: false,
      default: () => '#bac4d5',
    },
    width: {
      type: String,
      required: false,
      default: () => '24',
    },
    height: {
      type: String,
      required: false,
      default: () => '24',
    },
  },
});
</script>
