<template>
  <div class="flex min-w-0 items-center gap-1 overflow-hidden">
    <span
      v-for="label in labels"
      :key="label.id"
      class="ml-1 max-w-50 shrink-0 truncate rounded px-1.5 py-0.5 text-xs leading-3 text-white"
      :style="{ backgroundColor: label.color }"
      :title="label.name"
    >
      {{ label.name }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{ labels?: DtoLabelLight[] | null }>();
</script>
