<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.45 17.5C16.45 18.0115 16.2446 18.502 15.8789 18.8637C15.5132 19.2254 15.0172 19.4286 14.5 19.4286C13.9828 19.4286 13.4868 19.2254 13.1211 18.8637C12.7554 18.502 12.55 18.0115 12.55 17.5C12.55 16.9885 12.7554 16.498 13.1211 16.1363C13.4868 15.7746 13.9828 15.5714 14.5 15.5714C15.0172 15.5714 15.5132 15.7746 15.8789 16.1363C16.2446 16.498 16.45 16.9885 16.45 17.5Z"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M8 17.5C9.04 14.8662 11.4684 13 14.5 13C17.5316 13 19.96 14.8662 21 17.5C19.96 20.1338 17.5316 22 14.5 22C11.4684 22 9.04 20.1338 8 17.5Z"
      :stroke="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M19 14.5V7C19 4.79086 17.2091 3 15 3H7C4.79086 3 3 4.79086 3 7V15C3 17.2091 4.79086 19 7 19H8.5"
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
  name: 'SpoilerIcon',
  props: {
    color: {
      type: String,
      required: false,
      default: 'currentColor',
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
