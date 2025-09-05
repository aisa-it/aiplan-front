<template>
  <q-table
    v-model:pagination="pagination"
    flat
    row-key="id"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="q-px-md activities-table table-bottom-reverse"
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

    <template v-slot:body-cell-activity="props">
      <ActivityBlock :activity="props.row" />
    </template>

    <template v-slot:no-data>
      <EmptyStateTable :loading="loading" title="Нет пользователей">
        <DocumentIcon :width="56" :height="56" />
      </EmptyStateTable>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import EmptyStateTable from '../../ui/EmptyStateTable.vue';
import ActivityBlock from './ActivityBlock.vue';

import { api } from '../services/api';
import { columns } from '../columnConfig';

import { useTableWithPagination } from '../../composables/useTableWithPagination';
import { IActivity } from '../interfaces/type';

//TODO обновить тип, когда появится контракт
const { loading, rows, pagination, refresh } =
  useTableWithPagination<IActivity>(api.getUserActivities);
</script>

<style scoped lang="scss">
:deep(thead) {
  display: none;
}
</style>
