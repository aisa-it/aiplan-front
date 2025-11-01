<template>
  <div v-for="(table, index) in groupedIssueList" :key="index">
    <q-item v-if="!table.issues?.length && projectProps?.showEmptyGroups">
      <GroupedHeader
        :entity="table?.entity"
        :group-by="groupByIssues"
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
        :entity="table.entity"
        @refresh="
          (pagination, isFullUpdate) =>
            refreshTable(index, pagination, isFullUpdate, table?.entity)
        "
        @open-preview="
          (id, pagination) =>
            emits('openPreview', id, index, pagination, table?.entity)
        "
      />
    </q-expansion-item>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';

import { defineEntityName } from '../../utils/defineEntityName';

import IssueTable from '../IssueTable.vue';
import GroupedHeader from '../ui/GroupedHeader.vue';

import { IGroupedResponse } from '../../types';
import { useIssuesStore } from 'src/stores/issues-store';

defineProps<{
  issues: IGroupedResponse[];
  groupBy: string;
}>();

const emits = defineEmits(['refreshTable', 'updateIssueField', 'openPreview']);

const projectStore = useProjectStore();

const { groupedIssueList, groupByIssues } = storeToRefs(useIssuesStore());
const { projectProps } = storeToRefs(projectStore);

const refreshTable = (index, pagination, isFullUpdate, entity) => {
  emits('refreshTable', index, pagination, isFullUpdate, entity);
};
</script>
