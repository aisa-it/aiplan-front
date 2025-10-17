<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 6V12L15 15M19.6927 18.3892C18.617 19.6843 17.2318 20.6869 15.6654 21.304C14.099 21.9211 12.4022 22.1328 10.7322 21.9193C9.06221 21.7059 7.47315 21.0742 6.11232 20.083C4.75148 19.0918 3.66294 17.773 2.94759 16.249C2.23225 14.725 1.91326 13.045 2.0202 11.3648C2.12713 9.68464 2.65654 8.05867 3.55933 6.63763C4.46212 5.21658 5.70908 4.04647 7.1846 3.23576C8.66012 2.42506 10.3164 2 12 2C12.335 2 12.6687 2.01683 13 2.05012M16.5862 3.11366C16.9187 3.28528 17.2425 3.476 17.5557 3.6853C17.8671 3.89339 18.1655 4.11808 18.4498 4.35802M20.8203 7.28803C20.9737 7.5752 21.1134 7.87054 21.2388 8.17317C21.3514 8.445 21.4516 8.72089 21.5394 9M21.9327 13.1584C21.9018 13.4234 21.8602 13.6878 21.8079 13.9509C21.7576 14.2033 21.6978 14.4531 21.6287 14.6996M19.0711 19.0711C19.2953 18.8468 19.5081 18.6127 19.7089 18.3697"
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
  name: 'WatchDashedIcon',
  props: {
    color: {
      type: String,
      required: false,
      default: () => 'currentColor',
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
