<template>
  <svg
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
  >
    <path
      d="M30.3334 7V18.6667C30.3334 19.2855 30.5792 19.879 31.0168 20.3166C31.4544 20.7542 32.0479 21 32.6667 21H44.3334M29.7673 7H18.6667C14.8008 7 11.6667 10.134 11.6667 14V42C11.6667 45.866 14.8008 49 18.6667 49H37.3334C41.1994 49 44.3334 45.866 44.3334 42V21.5662C44.3334 19.7096 43.5959 17.9292 42.2832 16.6164L34.717 9.05025C33.4042 7.7375 31.6238 7 29.7673 7Z"
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
  name: 'DocumentIcon',
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
