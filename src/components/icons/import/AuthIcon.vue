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
      d="M16.8068 19.011C15.3926 19.9834 13.7161 20.5028 11.9998 20.5C10.2835 20.5028 8.607 19.9834 7.1928 19.011C6.5888 18.596 6.3308 17.806 6.6828 17.163C7.4098 15.83 8.9098 15 11.9998 15C15.0898 15 16.5898 15.83 17.3178 17.163C17.6678 17.806 17.4108 18.596 16.8068 19.011ZM11.9998 12C12.7954 12 13.5585 11.6839 14.1211 11.1213C14.6837 10.5587 14.9998 9.79565 14.9998 9C14.9998 8.20435 14.6837 7.44129 14.1211 6.87868C13.5585 6.31607 12.7954 6 11.9998 6C11.2042 6 10.4411 6.31607 9.87848 6.87868C9.31587 7.44129 8.9998 8.20435 8.9998 9C8.9998 9.79565 9.31587 10.5587 9.87848 11.1213C10.4411 11.6839 11.2042 12 11.9998 12Z"
      :fill="secondColor"
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
