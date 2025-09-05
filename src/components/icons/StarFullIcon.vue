<template>
  <svg
    :width="width"
    :height="height"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.14395 1.42382C9.53261 0.777998 10.4689 0.777999 10.8576 1.42382L13.4031 5.65356C13.5427 5.88557 13.7704 6.05104 14.0342 6.11214L18.8436 7.22599C19.5779 7.39606 19.8672 8.28653 19.3731 8.85574L16.137 12.5837C15.9595 12.7882 15.8725 13.0559 15.8959 13.3257L16.3227 18.2439C16.3879 18.9948 15.6304 19.5451 14.9364 19.2511L10.3909 17.3254C10.1415 17.2197 9.86 17.2197 9.61067 17.3254L5.06514 19.2511C4.3711 19.5451 3.61362 18.9948 3.67879 18.2439L4.10562 13.3257C4.12903 13.0559 4.04204 12.7882 3.86453 12.5837L0.628409 8.85574C0.134301 8.28653 0.423633 7.39606 1.15795 7.22599L5.96727 6.11214C6.23108 6.05104 6.45883 5.88557 6.59845 5.65356L9.14395 1.42382Z"
      fill="#F2994A"
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
  name: 'StarFullIcon',
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
