<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect :width="width" :height="height" rx="32" class="import-icons-bg" />
    <path
      d="M19.6864 11.5593L12.6792 4.78194L12 4.125L6.72526 9.22671L4.31358 11.5593C4.06214 11.8028 4.06214 12.1972 4.31358 12.4407L9.13265 17.1017L12 19.875L17.2747 14.7733L17.3564 14.6943L19.6864 12.4407C19.9379 12.1972 19.9379 11.8028 19.6864 11.5593ZM12 14.3284L9.59261 12L12 9.67159L14.4074 12L12 14.3284Z"
      :fill="secondColor"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AddIcon',
  props: {
    firstColor: {
      type: String,
      required: false,
    },
    secondColor: {
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
// fill="#DDE2EA"
// fill="#BAC4D5"
</script>
