<template>
  <svg
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
  >
    <g clip-path="url(#clip0_3648_48568)">
      <path
        d="M8.00041 10.6673V7.33398M7.66707 5.33398H8.33374M14.6671 8.00065C14.6671 11.6825 11.6823 14.6673 8.00041 14.6673C4.31851 14.6673 1.33374 11.6825 1.33374 8.00065C1.33374 4.31875 4.31851 1.33398 8.00041 1.33398C11.6823 1.33398 14.6671 4.31875 14.6671 8.00065Z"
        :stroke="color"
        stroke-width="1.28333"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_3648_48568">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InfoIcon',
  props: {
    color: {
      type: String,
      required: false,
      default: 'currentColor',
    },
    width: {
      type: String,
      required: false,
      default: () => '16',
    },
    height: {
      type: String,
      required: false,
      default: () => '16',
    },
  },
});
</script>
