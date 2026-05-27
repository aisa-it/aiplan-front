<template>
  <SprintsTablesWrapper
    :sprint-folders="sprintsList"
    >
    <template #default="{ folder, index }">
      <SprintFolderTable
        :rows="folder?.sprints"
        :rowsCount="folder?.sprints?.length"
        :columns="columns"
        />
    </template>
  </SprintsTablesWrapper>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { QTableColumn } from 'quasar';

import { DtoSprintFolder, DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { getSprints } from '../../services/api';
import { ROOT_FOLDER_ID } from 'src/constants/constants';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';
import SprintsTablesWrapper from 'src/modules/sprints/sprints-table/components/SprintsTablesWrapper.vue';
import SprintFolderTable from 'src/modules/sprints/sprints-table/components/SprintFolderTable.vue'
import { formatDate } from 'src/utils/time';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

const route = useRoute();
const sprintStore = useSprintStore();

// const sprints = ref<DtoSprintFolder[]>([]);
const { sprintsList } = storeToRefs(sprintStore);

const columns: QTableColumn<DtoSprintLight>[] = [
  {
    name: 'name',
    align: 'left',
    label: 'Имя',
    sortable: true,
    field: (row) => row.name,
  },
  {
    name: 'start_date',
    label: 'Дата начала',
    align: 'left',
    sortable: true,
    field: (row) => row.start_date ? formatDate(row.start_date) : '',
  },
  {
    name: 'end_date',
    label: 'Дата завершения',
    align: 'left',
    sortable: true,
    field: (row) => row.end_date ? formatDate(row.end_date) : '',
  },
  {
    name: 'stats',
    label: 'Процент выполнения',
    align: 'center',
    field: (row) => row.stats,
  },
  {
    name: 'all_issues_count',
    label: 'Всего задач',
    sortable: true,
    field: (row) => row.stats?.all_issues,
  }
];


// const sprintFolders = computed(() =>
//   sprints.value?.filter((item) => item.id !== ROOT_FOLDER_ID),
// );


onMounted(async () => {
  sprintStore.getSprintsList(route.params.workspace as string);

  // sprints.value = await getSprints(route.params.workspace as string);
});
</script>
