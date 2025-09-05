<template>
  <q-table
    v-model:pagination="pagination"
    flat
    row-key="id"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="table-bottom-reverse"
    @request="refresh"
  >
    <template #pagination>
      <PaginationDefault
        style="margin-top: auto"
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination: pagination }, searchQuery)"
      />
    </template>

    <template v-slot:header v-if="$q.screen.lt.md"></template>

    <template v-slot:body-cell-role="props">
      <q-td :props="props">
        <q-select
          :disable="!ws?.current_user_membership?.role"
          :model-value="props.row?.current_user_membership?.role ?? null"
          class="selector-option base-selector-sm"
          style="min-width: 160px"
          :options="ROLES"
          map-options
          @update:model-value="
            (newRole) => updateUserRoleProject(props.row.id, newRole.value)
          "
        />
      </q-td>
    </template>

    <template v-slot:body-cell-isMember="props">
      <q-td>
        <q-btn
          v-if="!!props.row.current_user_membership?.role"
          dense
          flat
          @click.stop="deleteFromProject(props.row.id)"
        >
          <RemoveIcon />
          <HintTooltip>Удалить из проекта</HintTooltip>
        </q-btn>
      </q-td>
    </template>

    <template v-slot:no-data>
      <EmptyStateTable
        :title="ws?.id ? 'Нет проектов' : 'Не выбрано рабочее пространство'"
        :loading="loading"
      >
        <DocumentIcon :width="56" :height="56" />
      </EmptyStateTable>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { toRefs, watch } from 'vue';
import { useQuasar } from 'quasar';

import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import EmptyStateTable from '../../ui/EmptyStateTable.vue';
import RemoveIcon from 'src/components/icons/RemoveIcon.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';

import { columns } from '../columnProjectConfig';
import { ROLES } from 'src/constants/constants';

import { api } from '../services/api';
import { apiWrapperWithIds } from '../../services/wrappers';
import { useTableWithPagination } from '../../composables/useTableWithPagination';
import {
  DtoProjectLight,
  DtoWorkspace,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useDeleteRoleDialogStore } from '../store/store';

const props = defineProps<{
  userId: string;
  ws?: DtoWorkspace;
  searchQuery?: string | undefined;
}>();

const { searchQuery } = toRefs(props);

const $q = useQuasar();
const store = useDeleteRoleDialogStore();

const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoProjectLight>(
    apiWrapperWithIds<DtoProjectLight, [string, string]>(api.getProjects),
    [props.userId, props.ws?.id ?? ''],
  );

const updateUserRoleProject = async (projectId: string, newRole: number) => {
  await api.updateUserRoleInProject(
    props.ws?.id ?? '',
    props.userId,
    projectId,
    {
      role: newRole,
    },
  );
  refresh({ pagination: pagination.value }, searchQuery.value);
};

const deleteFromProject = async (projectId: string) => {
  const result = await store.showDialog(
    props.userId,
    props.ws?.id ?? '',
    projectId,
  );

  if (result) refresh({ pagination: pagination.value }, searchQuery.value);
};

watch(searchQuery, (newVal) => {
  refresh({ pagination: pagination.value }, newVal);
});

watch(
  () => props.ws?.id,
  () => {
    refresh(
      { pagination: pagination.value },
      searchQuery.value,
      props.userId,
      props.ws?.id ?? '',
    );
  },
);
</script>
