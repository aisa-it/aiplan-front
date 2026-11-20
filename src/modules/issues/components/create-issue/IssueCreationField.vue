<template>
  <div
    class="grid min-w-0 items-start"
    :class="
      compact ? 'grid-cols-[max-content_minmax(0,1fr)] gap-6' : 'grid-cols-2'
    "
  >
    <div class="flex min-h-10 min-w-0 items-center gap-2 text-sm">
      <component :is="icon" class="shrink-0 text-icon" aria-hidden="true" />
      <span>{{ label }}</span>
    </div>
    <div class="min-w-0">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{ icon: Component; label: string; compact?: boolean }>();
</script>
