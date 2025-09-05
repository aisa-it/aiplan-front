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
      d="M10 15H14M10 9H14M10 12H14M14 14V8C14 6.89543 14.8954 6 16 6C16.7403 6 17.3866 6.4022 17.7324 7C18.617 8.52915 19.753 10.2922 20.5 12C20.7981 12.6816 21 14 21 14M10 14V8C10 6.89543 9.10457 6 8 6C7.25972 6 6.61337 6.4022 6.26756 7C5.383 8.52915 4.24697 10.2922 3.5 12C3.20186 12.6816 3 14 3 14M10 14.5C10 16.433 8.433 18 6.5 18C4.567 18 3 16.433 3 14.5C3 12.567 4.567 11 6.5 11C8.433 11 10 12.567 10 14.5ZM21 14.5C21 16.433 19.433 18 17.5 18C15.567 18 14 16.433 14 14.5C14 12.567 15.567 11 17.5 11C19.433 11 21 12.567 21 14.5Z"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ObserveIcon',
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
