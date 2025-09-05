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
      d="M13.3 6C13.3 6.3866 13.6134 6.7 14 6.7C14.3866 6.7 14.7 6.3866 14.7 6H13.3ZM9.3 6C9.3 6.3866 9.6134 6.7 10 6.7C10.3866 6.7 10.7 6.3866 10.7 6H9.3ZM5 5.3C4.6134 5.3 4.3 5.6134 4.3 6C4.3 6.3866 4.6134 6.7 5 6.7V5.3ZM19 6.7C19.3866 6.7 19.7 6.3866 19.7 6C19.7 5.6134 19.3866 5.3 19 5.3V6.7ZM17.3 6V18H18.7V6H17.3ZM15 20.3H9V21.7H15V20.3ZM6.7 18V6H5.3V18H6.7ZM9 20.3C7.72975 20.3 6.7 19.2703 6.7 18H5.3C5.3 20.0435 6.95655 21.7 9 21.7V20.3ZM17.3 18C17.3 19.2703 16.2703 20.3 15 20.3V21.7C17.0435 21.7 18.7 20.0435 18.7 18H17.3ZM13.3 5V6H14.7V5H13.3ZM10.7 6V5H9.3V6H10.7ZM12 3.7C12.718 3.7 13.3 4.28203 13.3 5H14.7C14.7 3.50883 13.4912 2.3 12 2.3V3.7ZM12 2.3C10.5088 2.3 9.3 3.50883 9.3 5H10.7C10.7 4.28203 11.282 3.7 12 3.7V2.3ZM5 6.7H19V5.3H5V6.7Z"
      :fill="color"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BinIcon',
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
