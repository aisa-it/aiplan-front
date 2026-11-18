<template>
  <svg viewBox="0 0 36 36" class="sidebar-sprint-progress" aria-hidden="true">
    <path
      v-if="!cancelledArc && !completedArc && !startedArc"
      class="progress-circle progress-empty"
      :stroke-dasharray="360"
      :stroke-dashoffset="0"
      :d="circlePath"
    />
    <path
      v-if="completedArc"
      class="progress-circle progress-completed"
      :stroke-dasharray="`${completedArc} ${circumference - completedArc}`"
      :stroke-dashoffset="`-${cancelledArc}`"
      :d="circlePath"
    />
    <path
      v-if="startedArc"
      class="progress-circle progress-started"
      :stroke-dasharray="`${startedArc} ${circumference - startedArc}`"
      :stroke-dashoffset="`-${cancelledArc + completedArc}`"
      :d="circlePath"
    />
    <path
      v-if="cancelledArc"
      class="progress-circle progress-cancelled"
      :stroke-dasharray="`${cancelledArc} ${circumference - cancelledArc}`"
      stroke-dashoffset="0"
      :d="circlePath"
    />
    <text x="50%" y="50%" dy="0.3em" class="progress-percentage">
      {{ Math.round(donePercentage) }}
    </text>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TypesSprintStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{ stats: TypesSprintStats }>();
const circumference = 2 * Math.PI * 15.9155;
const circlePath =
  'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';
const issuesCount = computed(() => props.stats.all_issues ?? 0);

function fraction(keys: (keyof TypesSprintStats)[]) {
  if (issuesCount.value <= 0) return 0;
  return (
    keys.reduce((sum, key) => sum + (props.stats[key] ?? 0), 0) /
    issuesCount.value
  );
}

const cancelledArc = computed(() => fraction(['cancelled']) * circumference);
const completedArc = computed(() => fraction(['completed']) * circumference);
const startedArc = computed(() => fraction(['in_progress']) * circumference);
const donePercentage = computed(
  () => ((cancelledArc.value + completedArc.value) / circumference) * 100,
);
</script>

<style scoped>
.sidebar-sprint-progress {
  width: 24px;
  height: 24px;
  flex: none;
}
.progress-circle {
  fill: none;
  stroke-width: 3.5;
  stroke-linecap: round;
  transform-origin: center;
}
.progress-cancelled {
  stroke: #dc3e3e;
}
.progress-completed {
  stroke: #05bd8d;
}
.progress-started {
  stroke: #3f76ff;
}
.progress-empty {
  stroke: currentColor;
}
.progress-percentage {
  fill: currentColor;
  font-size: 14px;
  text-anchor: middle;
}
</style>
