<template>
  <div class="q-table__title abbriviated-text title">
    <div>
      {{ sprint?.name }}
      <br class="mobile-space" />{{
        getSprintDates(sprint?.start_date ?? '', sprint?.end_date ?? '')
      }}
    </div>
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

<style scoped lang="scss">
.mobile-space {
  display: none;
}
.title {
  max-width: calc(100% - 60px);
  display: flex;
  gap: 16px;
}
@media (max-width: 540px) {
  .mobile-space {
    display: block;
  }
  .title {
    flex-direction: column;
    gap: 8x;
    align-items: center;
    text-align: center;
  }
}
</style>
