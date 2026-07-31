<template>
  <div class="flex items-center gap-1">
    <div class="wrap-break-word text-sm" :class="textStyle">
      {{ text }}
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  textStyle?: string;
}>();
</script>
