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
      d="M12 9V14M12.5 17H11.5M4.24269 21H19.7573C21.4812 21 22.5586 19.125 21.6966 17.625L13.9393 4.125C13.0774 2.625 10.9226 2.625 10.0607 4.125L2.30336 17.625C1.44143 19.125 2.51884 21 4.24269 21Z"
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
  name: 'AlertIcon',
  props: {
    color: {
      type: String,
      required: false,
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
