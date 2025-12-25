<template>
  <q-icon name="visibility" :size="size" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    width?: number;
    height?: number;
    size?: string;
  }>(),
  {
    size: '16px',
  },
);
</script>

