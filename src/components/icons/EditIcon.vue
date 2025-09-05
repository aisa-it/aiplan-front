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
      d="M18 10L15.1213 7.12133M6.58757 15.4124C5.47157 16.5284 5.36293 18.5483 5 20C6.45172 19.6371 8.47157 19.5284 9.58757 18.4124L19 9.00001C19.5979 8.40212 20 8 20 7.00001C20 6.00823 18.9918 5 18 5C17 5 16.5979 5.40213 16 6.00001L6.58757 15.4124Z"
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
  name: 'EditIcon',
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
