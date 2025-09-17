<template>
  <ActivitiesList
    :rows="rows"
    :rows-count="rowsCount"
    :only-project="true"
    :only-workspace="true"
    @update="onRequest"
  />
</template>
<script setup lang="ts">
// core
import { ref } from 'vue';

// store
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import ActivitiesList from 'src/components/activity/ActivitiesList.vue';
import { getProjectActivities } from '../services/api';

// interfaces
import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// stores
const workspaceStore = useWorkspaceStore();
const projectStore = useProjectStore();

// vars
const rows = ref<DtoEntityActivityFull[]>([]);
const rowsCount = ref(0);

async function onRequest(p: any) {
  const { page, rowsPerPage, rowsNumber } = p.pagination;

  await getProjectActivities(
    workspaceStore.currentWorkspaceSlug || '',
    projectStore.currentProjectID,
    {
      offset: (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage),
      limit: rowsPerPage == 0 ? rowsNumber || 10 : rowsPerPage,
    },
  ).then((res) => {
    rowsCount.value = res.count || 0;
    rows.value = res.result;
  });
}
</script>
