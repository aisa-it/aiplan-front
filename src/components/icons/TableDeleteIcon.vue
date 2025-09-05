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
      d="M22 12C22 7.286 22 4.929 20.536 3.464C19.07 2 16.714 2 12 2C7.286 2 4.929 2 3.465 3.464C2 4.93 2 7.286 2 12C2 16.714 2 19.071 3.465 20.535C4.928 22 7.286 22 12 22C16.714 22 19.071 22 20.536 20.535C22 19.072 22 16.714 22 12Z"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M16 8L8 16M8 8L16 16"
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
  name: 'TableDeleteIcon',
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
