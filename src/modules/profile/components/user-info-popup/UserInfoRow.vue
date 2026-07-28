<template>
  <div class="flex items-center">
    <span
      class="wrap-break-word text-sm"
      :class="{
        'text-center': center,
      }"
    >
      {{ text }}
    </span>

    <div class="relative h-6 w-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text: string;
  center: boolean;
}>();
</script>
