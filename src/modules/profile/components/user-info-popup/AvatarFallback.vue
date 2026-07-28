<template>
  <div
    class="flex h-full w-full items-center justify-center bg-gray-400 text-red-500"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
defineProps<{
  text?: string;
}>();
</script>
