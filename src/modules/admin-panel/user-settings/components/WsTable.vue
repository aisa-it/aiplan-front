<template>
  <q-table
    v-model:pagination="pagination"
    v-model:expanded="expanded"
    flat
    row-key="id"
    :rows="rows"
    :columns="columns"
    :rows-per-page-options="[10, 25, 50, 100]"
    class="table-bottom-reverse"
    @request="refresh"
  >
    <template v-slot:body="props">
      <q-tr
        @click="handleRowClick(props.row)"
        class="cursor-pointer"
        :class="{ active: currentWs === props.row.id }"
      >
        <q-td key="name">
          {{ props.row.name }}
        </q-td>

        <q-td key="role" class="full-width">
          <q-select
            :model-value="props.row.current_user_membership?.role ?? null"
            class="selector-option base-selector-sm"
            style="min-width: 160px"
            :options="ROLES"
            map-options
            @update:model-value="
              (newRole) => updateUserRole(props.row.id, newRole.value)
            "
          />
        </q-td>

        <q-td key="isMember">
          <q-btn
            v-if="props.row.current_user_membership?.role"
            dense
            flat
            @click="deleteFromWsHandler(props.row.id)"
          >
            <RemoveIcon />
            <HintTooltip>Удалить из рабочего пространства</HintTooltip>
          </q-btn>
        </q-td>

        <q-td v-if="$q.screen.lt.md" auto-width>
          <q-btn size="sm" round flat dense @click="toggleExpand(props.row.id)">
            <ArrowDown
              class="chevron-rotate"
              :class="{ 'rotate-180': props.expand }"
            />
          </q-btn>
        </q-td>
      </q-tr>
      <q-tr v-if="$q.screen.lt.md && props.expand" :props="props">
        <td colspan="4">
          <ProjectTable :user-id="userId" :ws="props.row" />
        </td>
      </q-tr>
    </template>

    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination: pagination }, searchQuery)"
      />
    </template>

    <template v-slot:no-data>
      <EmptyStateTable :loading="loading" title="Нет доступных пространств">
        <DocumentIcon :width="56" :height="56" />
      </EmptyStateTable>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { ref, toRefs, watch } from 'vue';
import { useQuasar } from 'quasar';

import EmptyStateTable from '../../ui/EmptyStateTable.vue';
import ProjectTable from './ProjectTable.vue';
import RemoveIcon from 'src/components/icons/RemoveIcon.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import ArrowDown from 'src/components/icons/ArrowDown.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';

import { columns } from '../columnWsConfig';
import { ROLES } from 'src/constants/constants';

import { DtoWorkspace } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { api } from '../services/api';
import { apiWrapperWithIds } from '../../services/wrappers';
import { useTableWithPagination } from '../../composables/useTableWithPagination';

import { useDeleteRoleDialogStore } from '../store/store';

const props = defineProps<{
  userId: string;
  searchQuery: string | undefined;
}>();

const { searchQuery } = toRefs(props);

const emits = defineEmits<{ selectRow: [ws: DtoWorkspace] }>();

const store = useDeleteRoleDialogStore();
const $q = useQuasar();

const currentWs = ref('');
const expanded = ref<string[]>([]);

const updateUserRole = async (wsId: string, role: number) => {
  await api.changeUserRoleInWorkspace(wsId, props.userId, { role: role });
  refresh({ pagination: pagination.value }, searchQuery.value);
};

const deleteFromWsHandler = async (wsId: string) => {
  const result = await store.showDialog(props.userId, wsId);

  if (result) refresh({ pagination: pagination.value }, searchQuery.value);
};

const toggleExpand = (id: string) => {
  const isCurrentlyExpanded = expanded.value.includes(id);
  expanded.value = [];

  if (isCurrentlyExpanded) return (currentWs.value = '');

  expanded.value = [id];
  currentWs.value = id;
};

const handleRowClick = (row: DtoWorkspace) => {
  if ($q.screen.lt.md) return;
  currentWs.value = row.id || '';
  emits('selectRow', row);
};

const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoWorkspace>(
    apiWrapperWithIds<DtoWorkspace, [string]>(api.getWorkspaces),
    [props.userId],
  );

watch(searchQuery, (newVal) => {
  refresh({ pagination: pagination.value }, newVal);
});
</script>

<style scoped lang="scss">
tr.active td {
  background-color: inherit !important;
}
</style>
