<template>
  <GroupedTablesWrapper
    :groups="issues"
    :group-by="groupBy"
    :show-empty-groups="contextProps?.showEmptyGroups"
    :is-group-open="(group) => !isGroupHide(group.entity?.id ?? group.entity)"
    @toggle-group="
      (group, opened) => setGroupHide(group.entity?.id ?? group.entity, opened)
    "
  >
    <template #default="{ group, index }">
      <IssueTable
        :rows="group?.issues"
        :rowsCount="group?.count"
        :entity="group.entity"
        @updateGroupedIssues="updateGroupedIssues"
        @refresh="
          (pagination, isFullUpdate) =>
            refreshTable(index, pagination, isFullUpdate, group?.entity)
        "
        @open-preview="
          (issue, pagination) =>
            emits('openPreview', issue, index, pagination, group?.entity)
        "
        :context-type="contextType"
        @open-issue="(id, issue) => emits('openIssue', id, issue)"
      />
    </template>
  </GroupedTablesWrapper>
</template>

<script lang="ts" setup>
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

import IssueTable from '../IssueTable.vue';
import { IGroupedResponse } from '../../types';
import { useIssueContext } from '../../composables/useIssueContext';

import { useGroupedIssues } from '../../composables/useGroupedIssues';

import GroupedTablesWrapper from './GroupedTablesWrapper.vue';

const props = defineProps<{
  issues: IGroupedResponse[];
  groupBy: string;
  contextType: 'project' | 'sprint';
}>();

const emits = defineEmits([
  'refreshTable',
  'updateIssueField',
  'openPreview',
  'openIssue',
]);

const { contextProps, isGroupHide, setGroupHide } = useIssueContext(
  props.contextType,
);

const { getGroupedIssues } = useGroupedIssues(props.contextType);

const refreshTable = (index, pagination, isFullUpdate, entity) => {
  emits('refreshTable', index, pagination, isFullUpdate, entity);
};

const updateGroupedIssues = async (status: any) => {
  if (!status) {
    getGroupedIssues();
    return;
  }

  const group = (props?.issues as any[]).find(
    (item: any) => item?.entity?.id === status.id,
  );

  if ((group && !group?.issues) || !group || group?.issues.length === 0) {
    const groupIndex = (props.issues as any[]).indexOf(group);
    const pagination = {
      only_count: false,
      hide_sub_issues: contextProps.value?.hideSubIssues ?? false,
      only_active: contextProps.value?.showOnlyActive ?? true,
      order_by: contextProps.value?.filters?.order_by ?? 'sequence_id',
      desc: contextProps.value?.filters?.orderDesc ?? false,
      offset: 0,
      limit: contextProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
    };

    await refreshTable(groupIndex, pagination, false, status);
  }
};
</script>
