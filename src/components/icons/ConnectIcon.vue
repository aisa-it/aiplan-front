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
      d="M12 9V12M12 12H17C17.5523 12 18 12.4477 18 13V15M12 12H7C6.44772 12 6 12.4477 6 13V15M11 9H13C14.1046 9 15 8.10457 15 7V5C15 3.89543 14.1046 3 13 3H11C9.89543 3 9 3.89543 9 5V7C9 8.10457 9.89543 9 11 9ZM5 21H7C8.10457 21 9 20.1046 9 19V17C9 15.8954 8.10457 15 7 15H5C3.89543 15 3 15.8954 3 17V19C3 20.1046 3.89543 21 5 21ZM17 21H19C20.1046 21 21 20.1046 21 19V17C21 15.8954 20.1046 15 19 15H17C15.8954 15 15 15.8954 15 17V19C15 20.1046 15.8954 21 17 21Z"
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
  name: 'ConnectIcon',
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
