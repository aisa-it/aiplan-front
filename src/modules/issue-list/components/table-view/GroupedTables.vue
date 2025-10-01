<template>
  <div v-for="(table, index) in issues" :key="index">
    <q-item v-if="!table.issues?.length && projectProps?.showEmptyGroups">
      <GroupedHeader
        :entity="table?.entity"
        :group-by="groupBy"
        :badge-name="defineEntityName(table.entity, groupBy)"
        :badge-color="table.entity?.color ?? undefined"
        :issues-count="table?.count"
    /></q-item>

    <q-expansion-item
      v-if="table.issues?.length"
      :default-opened="
        !projectStore.isGroupHide(table?.entity?.id || table.entity)
      "
      @update:model-value="
        (value) =>
          projectStore.setGroupHide(entity?.entity?.id || table.entity, value)
      "
    >
      <template #header>
        <GroupedHeader
          :entity="table?.entity"
          :group-by="groupBy"
          :badge-name="defineEntityName(table.entity, groupBy)"
          :badge-color="table.entity?.color ?? undefined"
          :issues-count="table?.count"
        />
      </template>
      <IssueTable
        :rows="table?.issues"
        :rowsCount="table?.count"
        @refresh="(pagination) => refreshTable(index, table.entity, pagination)"
      />
    </q-expansion-item>
  </div>
</template>

<script lang="ts" setup>
import { useProjectStore } from 'src/stores/project-store';
import { defineEntityName } from '../../utils/defineEntityName';
import GroupedHeader from '../ui/GroupedHeader.vue';
import IssueTable from '../IssueTable.vue';
import { storeToRefs } from 'pinia';

defineProps<{
  issues: [];
  groupBy: string;
}>();

const emits = defineEmits(['refreshTable']);

const projectStore = useProjectStore();
const {projectProps } = storeToRefs(projectStore)
const refreshTable = (index, entity, pagination) => {
  emits('refreshTable', index, entity, pagination);
};
</script>
