<template>
  <q-table
    v-model:pagination="pagination"
    flat
    row-key="id"
    loading-label="Загружается..."
    no-data-label="Нет данных"
    :loading="loading"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="table-bottom-reverse"
    @row-click="(_, row) => $emit('rowCLick', row)"
    @request="refresh"
  >
    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination })"
      />
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { columns } from '../columnConfig';
import { DtoUserFeedback } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import { useTableWithPagination } from '../../composables/useTableWithPagination';

import { api } from '../services/api';

defineEmits<{ rowCLick: [row: DtoUserFeedback] }>();

const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoUserFeedback>(api.getFeedbacks);
</script>
