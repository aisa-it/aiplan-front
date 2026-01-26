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
    @row-click="(_, row) => $router.push(`${row.id}/user-settings`)"
  >
    <template #pagination>
      <PaginationDefault
        v-model:selected-page="pagination.page"
        :rows-number="pagination.rowsNumber"
        :rows-per-page="pagination.rowsPerPage"
        @update:selectedPage="refresh({ pagination }, searchQuery)"
      />
    </template>

    <template v-slot:body-cell-is_superuser="props">
      <q-td @click.stop :props="props">
        <SelectSuperUser
          :value="props.row.is_superuser"
          @change="handleUpdateUser(props.row.id, { is_superuser: $event })"
        />
      </q-td>
    </template>

    <template v-slot:body-cell="props">
      <q-td :props="props">
        <router-link
          class="user-row-link"
          :to="`${props.row.id}/user-settings`"
          @click.stop
        >
          {{ props.value }}
        </router-link>
      </q-td>
    </template>
    
    <template v-slot:body-cell-block="props">
      <q-td :props="props">
        <BlockButton
          :active="isActive(props.row) || false"
          @click.stop="$emit('openBlockDialog', props.row)"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-delete="props">
      <q-td :props="props">
        <DeleteButton @click.stop="$emit('openDeleteDialog', props.row)"/>
      </q-td>
    </template>

    <template v-slot:no-data>
      <EmptyStateTable :loading="loading" title="Нет пользователей">
        <UserIcon :width="56" :height="56" />
      </EmptyStateTable>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import { toRefs, watch } from 'vue';

import UserIcon from 'src/components/icons/UserIcon.vue';
import BlockButton from '../ui/BlockButton.vue';
import EmptyStateTable from '../../ui/EmptyStateTable.vue';
import SelectSuperUser from '../ui/SelectSuperUser.vue';
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';

import { columns } from '../columnConfig';
import { api } from '../../services/api';
import { isActive } from '../../utils/active';
import { useTableWithPagination } from '../../composables/useTableWithPagination';

import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import DeleteButton from 'src/modules/admin-panel/user-view/ui/DeleteButton.vue';

const emits = defineEmits<{
  openBlockDialog: [user: DtoUserLight];
  openDeleteDialog: [user: DtoUserLight];
  successUpdateUser: [];
}>();

const props = defineProps<{ searchQuery: string | undefined }>();

const { searchQuery } = toRefs(props);

const { loading, rows, pagination, refresh } =
  useTableWithPagination<DtoUserLight>(api.getAllUsers);

defineExpose<{ refresh: () => void }>({
  refresh: () => refresh({ pagination: pagination.value }, searchQuery.value),
});

const handleUpdateUser = (id: string, user: DtoUserLight) => {
  api.updateUser(id, user).then(() => {
    emits('successUpdateUser');
    refresh({ pagination: pagination.value }, searchQuery.value);
  });
};

watch(searchQuery, (newVal) => {
  refresh({ pagination: pagination.value }, newVal);
});
</script>

<style scoped>
.user-row-link {
  display: block;
  width: 100%;
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
</style>
