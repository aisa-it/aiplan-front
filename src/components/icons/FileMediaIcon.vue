<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 56 56"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5 21C5 13.4575 5 9.68629 7.34315 7.34315C9.68629 5 13.4575 5 21 5H35C42.5425 5 46.3137 5 48.6569 7.34315C51 9.68629 51 13.4575 51 21V35C51 42.5425 51 46.3137 48.6569 48.6569C46.3137 51 42.5425 51 35 51H21C13.4575 51 9.68629 51 7.34315 48.6569C5 46.3137 5 42.5425 5 35V21Z"
      fill="#BAC4D5"
    />
    <path
      d="M34.7869 25.8808C36.3491 26.805 36.3491 29.1933 34.7869 30.1175L25.3455 35.6923C23.8253 36.5884 21.957 35.4202 21.957 33.572V22.4263C21.957 20.5781 23.8253 19.4119 25.3455 20.308L34.7869 25.8808Z"
      stroke="#474A52"
      stroke-width="3"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FileMediaIcon',
  props: {
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
