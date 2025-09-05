<template>
  <AdminHeader :title="`Количество активных импортов: ${rows.length}`" />

  <div class="q-px-md q-mt-md q-mb-xs">Пользователи, совершающие импорт:</div>
  <q-table
    flat
    row-key="actor_id"
    loading-label="Загружается..."
    no-data-label="Нет данных"
    :rows="rows"
    :columns="columns"
    :loading="loading"
    hide-pagination
    class="table-bottom-reverse"
    @row-click="(_, row) => $router.push(`${row.actor_id}/user-settings`)"
  />
</template>

<script setup lang="ts">
import AdminHeader from 'src/modules/admin-panel/ui/AdminHeader.vue';
import { api } from './services/api';
import { IssuesImportImportStatus } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { columns } from './columnConfig';
import { useAsyncDataWithLoadOnMounted } from 'src/modules/admin-panel/composables/useAsyncDataWithLoadOnMounted';

const { data: rows, loading } = useAsyncDataWithLoadOnMounted<
  IssuesImportImportStatus[]
>(api.getActiveImports, []);
</script>
