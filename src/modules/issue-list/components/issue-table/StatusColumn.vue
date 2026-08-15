<template>
  <q-td :props="rowInfo">
    <div @click.stop>
      <SelectStatus
        :status="rowInfo.row.state_detail"
        :issue="rowInfo.row"
        :items="items"
        :loading="isLoading"
        :error="statesError"
        :isDisabled="
          !rolesStore.hasPermissionByIssue(rowInfo.row, 'change-issue-status')
        "
        @popup-show="loadItems(rowInfo.row.project, rowInfo.row.id)"
        @update:status="onUpdateStatus"
      />
    </div>
  </q-td>
</template>

<script setup lang="ts">
// stores
import { useRolesStore } from 'src/stores/roles-store';

// composables
import { useStatusSelect } from 'src/composables/useStatusSelect';

// components
import SelectStatus from 'src/components/SelectStatus.vue';
import {
  DtoIssue,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  rowInfo: { row: DtoIssue };
}>();

const emits = defineEmits<{ refresh: [any] }>();

const rolesStore = useRolesStore();
const { items, isLoading, error: statesError, loadItems, updateStatus } =
  useStatusSelect();

const onUpdateStatus = async (state: DtoStateLight) => {
  if (state.id === props.rowInfo.row.state_detail?.id) return;

  await updateStatus(props.rowInfo.row.project, props.rowInfo.row.id, state);
  emits('refresh', state);
};
</script>

<style scoped lang="scss">
// убираем нижнюю линию у селекта статуса в таблице
.q-td :deep(.q-field__control:before) {
  border-bottom: none;
}
</style>
