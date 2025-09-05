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
      d="M8 18V15.5714C8 14.7143 8.36364 13 12 13C15.6364 13 16 14.7143 16 15.5714V18M8 18C8 19.1046 8.89543 20 10 20H14C15.1046 20 16 19.1046 16 18M8 18H5C3.89543 18 3 17.1046 3 16V14.5714C3 13.7143 3.36364 12 7 12C8.85841 12 9.86203 12.4477 10.3992 13M16 18H19C20.1046 18 21 17.1046 21 16V14.5714C21 13.7143 20.6364 12 17 12C15.1416 12 14.138 12.4477 13.6008 13M14 8C14 9.10457 13.1046 10 12 10C10.8954 10 10 9.10457 10 8C10 6.89543 10.8954 6 12 6C13.1046 6 14 6.89543 14 8ZM19 7C19 8.10457 18.1046 9 17 9C15.8954 9 15 8.10457 15 7C15 5.89543 15.8954 5 17 5C18.1046 5 19 5.89543 19 7ZM9 7C9 8.10457 8.10457 9 7 9C5.89543 9 5 8.10457 5 7C5 5.89543 5.89543 5 7 5C8.10457 5 9 5.89543 9 7Z"
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
  name: 'UsersIcon',
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
