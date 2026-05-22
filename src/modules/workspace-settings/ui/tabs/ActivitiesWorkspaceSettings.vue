<template>
  <ActivitiesList
    :rows="rows"
    :rows-count="rowsCount"
    only-workspace
    @update="onRequest"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ActivitiesList from 'src/components/activity/ActivitiesList.vue';
import { getWorkspaceActivities } from 'src/modules/workspace-settings/services/api';
import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// props
const props = defineProps<{ currentWsSlug: string }>();

// vars
const rows = ref<DtoEntityActivityFull[]>([]);
const rowsCount = ref(0);

async function onRequest(p: any) {
  const { page, rowsPerPage, rowsNumber } = p.pagination;

  await getWorkspaceActivities(
    props.currentWsSlug as string,
    (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage),
    rowsPerPage == 0 ? rowsNumber || 10 : rowsPerPage,
  ).then((res) => {
    rowsCount.value = res.count ?? 1;
    rows.value = res.result;
  });
}
</script>
