<template>
  <div class="grid gap-3 py-5 md:grid-cols-2 md:justify-between">
    <div>
      <h4 class="font-semibold">{{ title }}</h4>
      <p v-if="description" class="mt-1 text-sm text-secondary">
        {{ description }}
      </p>
      <slot name="description" />
    </div>

    <div class="min-w-0 self-center">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
}>();
</script>
