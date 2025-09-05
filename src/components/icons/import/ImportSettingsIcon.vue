<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" rx="12" class="import-icons-bg" />
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M12 2C10.886 2 9.871 2.6 7.843 3.802L7.157 4.208C5.127 5.41 4.114 6.011 3.557 7C3 7.99 3 9.19 3 11.594V12.406C3 14.809 3 16.011 3.557 17C4.114 17.989 5.127 18.59 7.157 19.791L7.843 20.198C9.871 21.399 10.886 22 12 22C13.114 22 14.128 21.4 16.157 20.198L16.843 19.791C18.871 18.591 19.886 17.989 20.443 17C21 16.01 21 14.81 21 12.406V11.594C21 9.191 21 7.989 20.443 7C19.886 6.011 18.871 5.41 16.843 4.208L16.157 3.802C14.127 2.601 13.114 2 12 2Z"
      :fill="secondColor"
    />
    <path
      d="M12 8C10.9391 8 9.92172 8.42143 9.17157 9.17157C8.42143 9.92172 8 10.9391 8 12C8 13.0609 8.42143 14.0783 9.17157 14.8284C9.92172 15.5786 10.9391 16 12 16C13.0609 16 14.0783 15.5786 14.8284 14.8284C15.5786 14.0783 16 13.0609 16 12C16 10.9391 15.5786 9.92172 14.8284 9.17157C14.0783 8.42143 13.0609 8 12 8Z"
      class="import-icons"
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
