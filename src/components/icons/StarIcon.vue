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
      d="M11.144 3.42382C11.5326 2.778 12.4689 2.778 12.8576 3.42382L15.4031 7.65356C15.5427 7.88557 15.7704 8.05104 16.0342 8.11214L20.8436 9.22599C21.5779 9.39606 21.8672 10.2865 21.3731 10.8557L18.137 14.5837C17.9595 14.7882 17.8725 15.0559 17.8959 15.3257L18.3227 20.2439C18.3879 20.9948 17.6304 21.5451 16.9364 21.2511L12.3909 19.3254C12.1415 19.2197 11.86 19.2197 11.6107 19.3254L7.06514 21.2511C6.3711 21.5451 5.61362 20.9948 5.67879 20.2439L6.10562 15.3257C6.12903 15.0559 6.04204 14.7882 5.86453 14.5837L2.62841 10.8557C2.1343 10.2865 2.42363 9.39606 3.15795 9.22599L7.96727 8.11214C8.23108 8.05104 8.45883 7.88557 8.59845 7.65356L11.144 3.42382Z"
      :fill="color"
      stroke-width="1.4"
      stroke-linecap="round"
      stroke-linejoin="round"
      :stroke="color"
    />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'StarIcon',
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
