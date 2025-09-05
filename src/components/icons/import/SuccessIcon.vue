<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clip-path="url(#clip0_5111_62772)">
      <path
        d="M5.33325 8.66536L6.66659 9.9987L10.6666 5.9987M14.6666 7.9987C14.6666 11.6806 11.6818 14.6654 7.99992 14.6654C4.31802 14.6654 1.33325 11.6806 1.33325 7.9987C1.33325 4.3168 4.31802 1.33203 7.99992 1.33203C11.6818 1.33203 14.6666 4.3168 14.6666 7.9987Z"
        stroke="#05BD8D"
        stroke-width="1.4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_5111_62772">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SuccessIcon',
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
      default: () => 16,
    },
    height: {
      type: Number,
      required: false,
      default: () => 16,
    },
  },
});
</script>
