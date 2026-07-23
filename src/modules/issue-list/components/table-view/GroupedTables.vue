<template>
  <GroupedTablesWrapper
    :groups="issues"
    :group-by="groupBy"
    :show-empty-groups="contextProps?.showEmptyGroups"
    :is-group-open="(group) => !isGroupHide(group.entity?.id ?? group.entity)"
    :lazzy-off="isGanttDiagramm"
    @toggle-group="
      (group, opened) => setGroupHide(group.entity?.id ?? group.entity, opened)
    "
    @subscribe-table-updates="
      (group, index) => subscribeTableUpdates(group.entity.id, currentPagination, index, group.entity)
    "
  >
    <template #default="{ group, index }">
      <IssueTable
        :rows="group?.issues"
        :rowsCount="group?.count"
        :entity="group.entity"
        :context-type="contextType"
        @updateGroupedIssues="updateGroupedIssues"
        @refresh="
          (pagination, isFullUpdate) => {
            currentPagination = pagination;
            emits(
              'refreshTable',
              index,
              pagination,
              isFullUpdate,
              group?.entity,
            )
          }
        "
        @open-preview="
          (issue, pagination) =>
            emits('openPreview', issue, index, pagination, group?.entity)
        "
        @open-issue="(id, issue) => emits('openIssue', id, issue)"
        @table-hide="
          (id, pagination) =>
            subscribeTableUpdates(id, pagination, index, group.entity)
        "
        @table-show="(id) => unSubscribeTableUpdates(id)"
      />
    </template>
  </GroupedTablesWrapper>
</template>

<script setup lang="ts">
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

import IssueTable from '../IssueTable.vue';
import { IGroupedResponse } from '../../types';
import { useIssueContext } from '../../composables/useIssueContext';

import { useGroupedIssues } from '../../composables/useGroupedIssues';

import GroupedTablesWrapper from './GroupedTablesWrapper.vue';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { inject, ref } from 'vue';
import { EventBus } from 'quasar';

const bus = inject('bus') as EventBus;

const props = defineProps<{
  issues: IGroupedResponse[];
  groupBy: string;
  contextType: 'project' | 'sprint';
}>();

const emits = defineEmits<{
  refreshTable: [number, any, boolean | undefined, any];
  openPreview: [DtoIssue, number, any, any];
  openIssue: [number, DtoIssue];
}>();

const { contextProps, isGroupHide, setGroupHide, isGanttDiagramm } =
  useIssueContext(props.contextType);

const { getGroupedIssues } = useGroupedIssues(props.contextType);

const currentPagination = ref<Record<string, any>>({});

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

    await emits('refreshTable', groupIndex, pagination, false, status);
  }
};

const handlers = ref<Record<string, (field: any, entityId: string) => void>>(
  {},
);

const subscribeTableUpdates = (
  id: string,
  pagination: Record<string, any>,
  index: number,
  entity: any,
) => {
  const handler = (field: string, entityId: string) => {
    if (entityId === id) {
      emits('refreshTable', index, pagination, false, entity);
    }
  };
  bus.on('updateIssueTable', handler);
  handlers.value[id] = handler;
};

const unSubscribeTableUpdates = (id: string) => {
  if (handlers.value[id]) {
    bus.off('updateIssueTable', handlers.value[id]);
  }
};
</script>
