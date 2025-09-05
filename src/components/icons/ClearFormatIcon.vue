<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 16.9993L5.66651 12.9999M5.66651 12.9999L8.87174 5.30769C8.9494 5.12131 9.13154 4.99993 9.33345 5L9.6668 5.00012C9.86858 5.00019 10.0505 5.12154 10.1282 5.3078L12 9.5M5.66651 12.9999L8.5 13.0099M18 16.9999L14 12.9999M14.0101 19.0099L11.9899 16.9898C11.4432 16.4431 11.4432 15.5567 11.9899 15.0099L17.0101 9.98983C17.5568 9.4431 18.4432 9.4431 18.9899 9.98983L21.0101 12.0099C21.5568 12.5567 21.5568 13.4431 21.0101 13.9898L15.99 19.0099C15.4432 19.5567 14.5568 19.5567 14.0101 19.0099Z"
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
  name: 'ClearFormatIcon',
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
