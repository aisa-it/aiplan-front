<template>
  <div class="progress-pie-wrapper">
    <svg viewBox="0 0 36 36" class="circular-chart">
      <path
        v-if="!cancelledArc && !completedArc && !startedArc"
        class="circle empty"
        :stroke-dasharray="360"
        :stroke-dashoffset="0"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        v-if="completedArc"
        class="circle completed"
        :stroke-dasharray="`${completedArc} ${circumference - completedArc}`"
        :stroke-dashoffset="`-${cancelledArc}`"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        v-if="startedArc"
        class="circle started"
        :stroke-dasharray="`${startedArc} ${circumference - startedArc}`"
        :stroke-dashoffset="`-${cancelledArc + completedArc}`"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />
      <path
        v-if="cancelledArc"
        class="circle cancelled"
        :stroke-dasharray="`${cancelledArc} ${circumference - cancelledArc}`"
        :stroke-dashoffset="0"
        d="M18 2.0845
           a 15.9155 15.9155 0 0 1 0 31.831
           a 15.9155 15.9155 0 0 1 0 -31.831"
      />

      <text x="50%" y="50%" dy="0.3em" class="percentage">
        {{ Math.round(donePercentage) }}
      </text>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { TypesSprintStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { computed } from 'vue';

const props = defineProps<{
  stats: TypesSprintStats;
}>();

const radius = 15.9155;
const circumference = 2 * Math.PI * radius;
const issuesCount = props.stats.all_issues ?? 0;

function calculateFraction(keys: string[]) {
  const sum = Object.entries(props.stats).reduce(
    (acc, [key, value]) => (keys.includes(key) ? acc + value : acc),
    0,
  );
  return issuesCount > 0 ? sum / issuesCount : 0;
}

const cancelledArc = computed(
  () => calculateFraction(['cancelled']) * circumference,
);
const completedArc = computed(
  () => calculateFraction(['completed']) * circumference,
);
const startedArc = computed(
  () => calculateFraction(['in_progress']) * circumference,
);

const donePercentage = computed(
  () => ((cancelledArc.value + completedArc.value) / circumference) * 100,
);
</script>

<style scoped lang="scss">
.progress-pie-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.circular-chart {
  display: block;
  margin: 10px auto;
}

.circle {
  fill: none;
  stroke-width: 3.5;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
  transform-origin: center;
}

.cancelled {
  stroke: $negative;
}

.completed {
  stroke: $progress-positive;
}

.started {
  stroke: $progress-in-work;
}

.empty {
  stroke: var(--text-color);
}
.percentage {
  fill: var(--text-color);
  font-size: 14px;
  text-anchor: middle;
  text-align: center;
}
</style>
