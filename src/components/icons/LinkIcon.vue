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
      d="M12.0003 16.0003L10.0003 18.0003C8.89573 19.1049 7.10487 19.1049 6.0003 18.0003C4.89573 16.8957 4.89573 15.1049 6.0003 14.0003L8.0003 12.0003M16.0003 12.0003L18.0003 10.0003C19.1048 8.89573 19.1048 7.10489 18.0003 6.00032C16.8957 4.89572 15.1048 4.89573 14.0002 6.00035L12.0003 8.00031M15.0003 9.00027L9.00014 15.0003"
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
  name: 'LinkIcon',
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
