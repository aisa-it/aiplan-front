<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 19L12 12M12 12L16 8M12 12L15 15L11.5 18.5M16 8H11L9 11M16 8L19 11H22M11 4H8M6 8H3M7 13H4M20 5.5C20 6.32843 19.3284 7 18.5 7C17.6716 7 17 6.32843 17 5.5C17 4.67157 17.6716 4 18.5 4C19.3284 4 20 4.67157 20 5.5Z"
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
  name: 'SprintIcon',
  props: {
    color: {
      type: String,
      required: false,
      default: 'currentColor',
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
