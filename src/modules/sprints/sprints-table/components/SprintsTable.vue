<template>
  <SprintsTablesWrapper
    :sprint-folders="sprintsList"
    >
    <template #default="{ folder }">
      <SprintFolderTable
        :rows="folder?.sprints"
        :rowsCount="folder?.sprints?.length"
        :columns="columns"
        @refresh="emit('refresh')"
        />
    </template>
  </SprintsTablesWrapper>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { QTableColumn } from 'quasar';

import { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { storeToRefs } from 'pinia';
import SprintsTablesWrapper from 'src/modules/sprints/sprints-table/components/SprintsTablesWrapper.vue';
import SprintFolderTable from 'src/modules/sprints/sprints-table/components/SprintFolderTable.vue'
import { formatDate } from 'src/utils/time';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

const route = useRoute();
const sprintStore = useSprintStore();

const { sprintsList } = storeToRefs(sprintStore);

const emit = defineEmits(['refresh']);

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
    sortable: true,
    field: (row) => (row.stats?.all_issues && row.stats?.completed) ? row.stats?.completed / row.stats.all_issues : 0,
  },
  {
    name: 'all_issues_count',
    label: 'Всего задач',
    sortable: true,
    align: 'center',
    field: (row) => row.stats?.all_issues,
  }
];

onMounted(async () => {
  sprintStore.getSprintsList(route.params.workspace as string);
});
</script>
