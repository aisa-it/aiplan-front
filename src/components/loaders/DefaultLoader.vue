<template>
  <v-progress-circular indeterminate :color="color" :size="size" :width="width" />
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string
    width?: number
    color?: string
  }>(),
  {
    size: 50,
    width: 6,
    color: 'primary',
  },
)
</script>
