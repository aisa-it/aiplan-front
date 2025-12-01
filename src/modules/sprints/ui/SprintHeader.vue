<template>
  <div
    class="q-table__title abbriviated-text"
    style="max-width: calc(100% - 60px); display: flex; gap: 16px"
  >
    <span>
      {{ sprint?.name }}
      {{ getSprintDates(sprint?.start_date ?? '', sprint?.end_date ?? '') }}
    </span>
    <StatusLinearProgressBar
      style="max-width: 320px"
      :stats="sprint.stats ?? {}"
    />
  </div>
</template>

<script setup lang="ts">
import StatusLinearProgressBar from 'src/components/progress-bars/StatusLinearProgressBar.vue';
import { DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getSprintDates } from '../helpres';

defineProps<{
  sprint: DtoSprint;
}>();
</script>
