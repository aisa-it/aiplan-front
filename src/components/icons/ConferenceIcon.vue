<template>
  <svg
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.3631 2.27346 14.6621 2.76762 15.8461C3.0043 16.4131 3.10254 17.0358 2.96933 17.6357L2.33301 20.501C2.17626 21.2063 2.79639 21.8406 3.50488 21.6992L6.58167 21.0837C7.14984 20.97 7.73537 21.0626 8.27283 21.2791C9.42466 21.7432 10.6821 22 12 22C17.5228 22 22 17.5228 22 12Z"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 16V8M8 16V12M16 16V12"
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
  name: 'ConferenceIcon',
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
