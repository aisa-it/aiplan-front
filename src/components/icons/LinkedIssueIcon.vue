<template>
  <svg
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-color'"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.9216 11.1765L13.3726 10.6274C11.8565 9.1113 9.39836 9.1113 7.88225 10.6274L5.13708 13.3726C3.62097 14.8887 3.62097 17.3468 5.13708 18.8629C6.6532 20.379 9.1113 20.379 10.6274 18.8629L12 17.4903M10.0784 12.8235L10.6274 13.3726C12.1435 14.8887 14.6016 14.8887 16.1177 13.3726L18.8629 10.6274C20.379 9.1113 20.379 6.6532 18.8629 5.13708C17.3468 3.62097 14.8887 3.62097 13.3726 5.13708L12 6.50967"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LinkedIssueIcon',
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
