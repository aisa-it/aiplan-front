<template>
  <q-table
    flat
    bordered
    :rows="projects"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50]"
  />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { QTableColumn } from 'quasar';

import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { getSprints } from '../../services/api';

const route = useRoute();
const projects = ref<DtoProjectLight[]>([]);
const columns: QTableColumn<DtoProjectLight>[] = [
  {
    name: 'name',
    align: 'left',
    label: 'Имя',
    sortable: true,
    field: (row) => row.name,
  },
];

onMounted(async () => {
  projects.value = await getSprints(route.params.workspace as string);
});
</script>
