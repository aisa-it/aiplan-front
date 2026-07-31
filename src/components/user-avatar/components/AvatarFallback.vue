<template>
  <div
    class="flex h-full w-full items-center justify-center bg-primary-light text-primary"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>
