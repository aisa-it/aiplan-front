<template>
  <q-spinner-oval :color="color" :size="computedSize"></q-spinner-oval>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: number;
    color?: string;
    unit?: 'px' | 'em' | 'rem' | '%' | 'vw' | 'vh';
  }>(),
  {
    size: 50,
    color: 'primary',
    unit: 'px',
  },
);

const computedSize = computed(() => {
  return `${props.size}${props.unit}`;
});
</script>
