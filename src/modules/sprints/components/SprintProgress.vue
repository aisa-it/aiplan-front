<template>
  <div class="sprint-progress relative isolate flex min-w-0 items-center justify-center overflow-hidden px-2">
    <div class="absolute inset-0 -z-10 flex" aria-hidden="true">
      <span
        v-for="segment in segments"
        :key="segment.key"
        class="sprint-progress__segment"
        :style="{ width: `${segment.percent}%`, backgroundColor: `var(--sprint-progress-${segment.key})` }"
      />
    </div>
    <span class="truncate"><slot /></span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TypesSprintStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{ stats?: TypesSprintStats }>();
const statusKeys = ['cancelled', 'completed', 'in_progress'] as const;
const segments = computed(() => {
  const total = props.stats?.all_issues ?? 0;
  if (!total) return [];
  return statusKeys.map((key) => ({
    key,
    percent: (100 * (props.stats?.[key] ?? 0)) / total,
  }));
});
</script>

<style scoped>
.sprint-progress {
  --sprint-progress-cancelled: #fce4ec;
  --sprint-progress-completed: #e8f5e9;
  --sprint-progress-in_progress: #e1f5fe;
  height: 32px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 8px;
  background-color: rgb(var(--v-theme-border));
  color: rgb(var(--v-theme-text));
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
}

.v-theme--dark .sprint-progress {
  --sprint-progress-cancelled: #47000b;
  --sprint-progress-completed: #17351a;
  --sprint-progress-in_progress: #052c48;
}

.sprint-progress__segment {
  transition: width 0.5s;
}
</style>
