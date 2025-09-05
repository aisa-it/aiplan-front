<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :width="width"
    :height="height"
    :class="color ? '' : 'default-icon-fill-color'"
  >
    <path
      d="M4.7 18.5C4.7 17.8689 4.84742 16.976 5.72896 16.2184C6.63757 15.4376 8.43976 14.7 12 14.7V13.3C8.28751 13.3 6.08971 14.0624 4.81649 15.1566C3.51622 16.274 3.3 17.6311 3.3 18.5H4.7ZM3.3 18.5C3.3 19.715 4.28497 20.7 5.5 20.7V19.3C5.05817 19.3 4.7 18.9418 4.7 18.5H3.3ZM20.7 18.5C20.7 17.6311 20.4838 16.274 19.1835 15.1566C17.9103 14.0624 15.7125 13.3 12 13.3V14.7C15.5602 14.7 17.3624 15.4376 18.271 16.2184C19.1526 16.976 19.3 17.8689 19.3 18.5H20.7ZM19.3 18.5C19.3 18.9418 18.9418 19.3 18.5 19.3V20.7C19.715 20.7 20.7 19.715 20.7 18.5H19.3ZM5.5 20.7H18.5V19.3H5.5V20.7ZM14.3 7C14.3 8.27026 13.2703 9.3 12 9.3V10.7C14.0435 10.7 15.7 9.04345 15.7 7H14.3ZM12 9.3C10.7297 9.3 9.7 8.27026 9.7 7H8.3C8.3 9.04345 9.95655 10.7 12 10.7V9.3ZM9.7 7C9.7 5.72975 10.7297 4.7 12 4.7V3.3C9.95655 3.3 8.3 4.95655 8.3 7H9.7ZM12 4.7C13.2703 4.7 14.3 5.72975 14.3 7H15.7C15.7 4.95655 14.0435 3.3 12 3.3V4.7Z"
      :fill="color"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UserIcon',
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
