<template>
  <component :is="isGantt ? GanttView : 'div'" v-bind="ganttProps" class="h-full min-h-0 min-w-0">
    <GroupedIssueList
      v-if="groupBy"
      :key="groupBy"
      :workspace-slug="workspaceSlug"
      :project-id="projectId"
      :group-by="groupBy"
      :board="isBoard"
      :groups="groups"
      :is-streaming="isStreaming"
      :load-failed="loadFailed"
      :board-page-size="controller.query.rowsPerPage"
      :view-settings="viewSettings"
      :hide-parent="hideParent"
      :property-templates="propertyTemplates"
      :column-resize="columnResize"
      @page="grouped.setPage"
      @retry="grouped.retry"
      @change="saveSettings"
      @manage-sprints="sprintIssue = $event"
    />
    <IssueTable
      v-else
      :column-resize="columnResize"
      :hide-parent="hideParent"
      :property-templates="propertyTemplates"
      @manage-sprints="sprintIssue = $event"
    />
  </component>
  <IssueBoardSprintDialog
    v-if="sprintIssue"
    v-model="sprintIssue"
    :workspace-slug="workspaceSlug"
    :required-sprint="sprint"
    @change="onSprintsChanged"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  DtoProjectPropertyTemplate,
  DtoIssueWithCount,
  DtoSprint,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { toast } from '@/modules/toast/toast';
import { IssueGroupRequestError } from '../api/issue-list.source';
import { provideIssueListController } from '../model/issue-list.context';
import { createIssueListInitialState } from '../model/issue-list.defaults';
import { normalizeIssueGroupBy, type GroupedIssueSource } from '../model/issue-groups';
import type { IssueListActions, IssueListSource } from '../model/issue-list.types';
import { useIssueListController } from '../composables/useIssueListController.ts';
import { useGroupedIssues } from '../composables/useGroupedIssues';
import { useIssueColumnResize } from '../composables/useIssueColumnResize';
import IssueTable from './IssueTable.vue';
import GroupedIssueList from './grouped/GroupedIssueList.vue';

const props = defineProps<{
  workspaceSlug: string;
  projectId?: string;
  listKey: string;
  source: IssueListSource & GroupedIssueSource;
  actions: IssueListActions;
  viewSettings?: TypesViewProps;
  hideParent?: boolean;
  propertyTemplates?: DtoProjectPropertyTemplate[];
  sprint?: DtoSprint;
}>();
const emit = defineEmits<{ sprintMembershipChanged: [] }>();

const { t } = useI18n();
const GanttView = defineAsyncComponent(() => import('./gantt/components/GanttView.vue'));
const IssueBoardSprintDialog = defineAsyncComponent(
  () => import('./board/IssueBoardSprintDialog.vue'),
);
const { source, actions } = props;
const sprintIssue = shallowRef<DtoIssueWithCount | null>(null);
const pendingPropertyResets = new Set<string>();
const isBoard = computed(() => props.viewSettings?.issueView === 'kanban');
const isGantt = computed(() => props.viewSettings?.issueView === 'gantt_chart');
const groupBy = computed(() => {
  const value = normalizeIssueGroupBy(props.viewSettings?.filters?.group_by);
  const unsupported = props.sprint ? value?.startsWith('property:') : value === 'project';
  return (!unsupported && value) || (isBoard.value ? 'state' : null);
});
const columnResize = useIssueColumnResize(() => props.listKey);
const saveSettings = (patch: TypesViewProps) =>
  void actions.updateViewSettings(patch).catch(() => {});

const controller = useIssueListController(
  source,
  createIssueListInitialState(props.viewSettings),
  actions,
  {
    isActive: () => !!groupBy.value,
    refreshAfterUpdate: (before, after) =>
      grouped.refreshAfterUpdate(before, after),
  },
);
watch(
  [() => props.viewSettings, groupBy],
  ([settings, value], [, previous]) => {
    const modeChanged = Boolean(value) !== Boolean(previous);
    controller.applyViewSettings(settings, !modeChanged);
    if (modeChanged) void controller.load();
  },
);

const grouped = useGroupedIssues(
  source,
  () => ({
    groupBy: groupBy.value,
    query: isBoard.value
      ? { ...controller.query, sortBy: 'sequence_id', descending: true }
      : controller.query,
    filters: controller.filters,
  }),
  (error, groupBy) => {
    if (
      error instanceof IssueGroupRequestError &&
      groupBy.startsWith('property:') &&
      (error.body?.code === 4023 || error.body?.code === 4501)
    ) {
      if (pendingPropertyResets.has(groupBy)) return;
      toast.error(error.body.ru_error || t('issues.groups.propertyError'));
      pendingPropertyResets.add(groupBy);
      void actions
        .updateViewSettings(
          { filters: { group_by: isBoard.value ? 'state' : 'none' } },
          { optimistic: false },
        )
        .catch(() => {})
        .finally(() => pendingPropertyResets.delete(groupBy));
      return;
    }
    toast.error(
      error instanceof IssueGroupRequestError
        ? error.body?.ru_error
        : undefined,
    );
  },
);
const { groups, isStreaming, loadFailed } = grouped;
const ganttProps = computed(() => isGantt.value
  ? {
      issues: groupBy.value ? groups.value.flatMap((group) => group.items) : controller.items.value,
      sprint: props.sprint,
    }
  : {});

function onSprintsChanged(before: DtoIssueWithCount, after: DtoIssueWithCount) {
  const currentSprintId = props.sprint?.id;
  if (currentSprintId && !after.sprints?.some((sprint) => sprint.id === currentSprintId)) {
    emit('sprintMembershipChanged');
    if (groupBy.value) void grouped.retry();
    else void controller.load();
  } else if (groupBy.value) {
    void grouped.refreshAfterUpdate(before, after);
  } else {
    void controller.load();
  }
}

provideIssueListController(controller);

onMounted(() => void controller.load());
onBeforeUnmount(controller.dispose);
</script>
