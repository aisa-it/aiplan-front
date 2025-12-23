<template>
  <q-spinner-oval :color="color" :size="computedSize"></q-spinner-oval>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'LoaderDefault',
  props: {
    size: {
      type: Number,
      default: 50,
    },
    color: {
      type: String,
      default: 'primary',
    },
    unit: {
      type: String,
      default: 'px',
      validator: (value: string) =>
        ['px', 'em', 'rem', '%', 'vw', 'vh'].includes(value),
    },
  },
  setup(props) {
    const computedSize = computed(() => {
      return `${props.size}${props.unit}`;
    });
    return {
      computedSize,
    };
  },
});
</script>
