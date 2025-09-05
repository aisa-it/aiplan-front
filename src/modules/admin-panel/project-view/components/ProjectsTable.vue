<template>
  <q-table
    v-model:pagination="pagination"
    flat
    row-key="slug"
    loading-label="Загружается..."
    no-data-label="Нет данных"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="table-bottom-reverse"
    @request="refresh"
  >
    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination }, searchQuery)"
      />
    </template>

    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <span v-html="props.row.name_highlighted"></span
      ></q-td>
    </template>

    <template v-slot:body-cell-settings="props">
      <q-td :props="props">
        <SettingsButton
          replace
          :to="`/${props.row.workspace_detail?.slug}/projects/${props.row.id}/settings`"
        />
      </q-td>
    </template>

    <template v-slot:no-data>
      <EmptyStateTable :loading="loading" title="Нет проектов">
        <DocumentIcon :width="56" :height="56" />
      </EmptyStateTable>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { toRefs, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import { api } from '../services/api';

import { columns } from '../columnConfig';

import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import EmptyStateTable from '../../ui/EmptyStateTable.vue';
import SettingsButton from '../../ui/SettingsButton.vue';

import { useTableWithPagination } from '../../composables/useTableWithPagination';
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { apiWrapperWithIds } from '../../services/wrappers';

const props = defineProps<{ searchQuery: string | undefined }>();

const { searchQuery } = toRefs(props);

const route = useRoute();
const workspaceId = computed(() => route.params.workspace as string);

const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoProject>(
    apiWrapperWithIds<DtoProject, [string]>(api.getWsProjects),
    [workspaceId.value],
  );

watch(
  [workspaceId, searchQuery],
  () => {
    refresh({ pagination: pagination.value }, searchQuery.value);
  },
  { immediate: true },
);
</script>
