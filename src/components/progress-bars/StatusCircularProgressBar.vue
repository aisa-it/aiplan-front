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

      <text x="18" y="20.35" class="percentage">
        {{ Math.round(donePercentage) }}%
      </text>
    </svg>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

const props = defineProps<{
  issuesCount: number;
  stateDistribution: Record<string, number>;
}>();

const radius = 15.9155;
const circumference = 2 * Math.PI * radius;

function calculateFraction(keys: string[]) {
  const sum = Object.entries(props.stateDistribution).reduce(
    (acc, [key, value]) => (keys.includes(key) ? acc + value : acc),
    0,
  );
  return props.issuesCount > 0 ? sum / props.issuesCount : 0;
}

const cancelledArc = computed(
  () => calculateFraction(['cancelled']) * circumference,
);
const completedArc = computed(
  () => calculateFraction(['completed']) * circumference,
);
const startedArc = computed(
  () => calculateFraction(['started']) * circumference,
);

const donePercentage = computed(
  () => ((cancelledArc.value + completedArc.value) / circumference) * 100,
);
</script>

<style scoped lang="scss">
.circular-chart {
  display: block;
  margin: 10px auto;
  max-width: 120px;
  max-height: 120px;
}

.circle {
  fill: none;
  stroke-width: 2.8;
  stroke-linecap: round;
  animation: progress 1s ease-out forwards;
  transform-origin: center;
}

.cancelled {
  stroke: $progress-bg-error;
}

.completed {
  stroke: $progress-bg-success;
}

.started {
  stroke: $progress-bg-primary;
}

.empty {
  stroke: var(--text-color);
}
.percentage {
  fill: var(--text-color);
  font-family: sans-serif;
  font-size: 0.7em;
  text-anchor: middle;
}
</style>
