<template>
  <component :is="isGantt ? GanttView : 'div'" v-bind="ganttProps" class="h-full min-h-0 min-w-0">
    <ProjectGroupedIssueList
      v-if="groupBy"
      :key="groupBy"
      :scope="scope"
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
      @sprints-changed="grouped.refreshAfterUpdate"
    />
    <IssueTable
      v-else
      :column-resize="columnResize"
      :hide-parent="hideParent"
      :property-templates="propertyTemplates"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type {
  DtoProjectPropertyTemplate,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { toast } from '@/modules/toast/toast';
import {
  createProjectIssueListSource,
  IssueGroupRequestError,
} from '../api/project-issue-list.source';
import { provideIssueListController } from '../model/issue-list.context';
import { createIssueListInitialState } from '../model/issue-list.defaults';
import { normalizeIssueGroupBy } from '../model/issue-groups';
import type { ProjectIssueListScope } from '../model/issue-list.types';
import { useIssueListController } from '../composables/useIssueListController.ts';
import { useGroupedIssues } from '../composables/useGroupedIssues';
import { useIssueColumnResize } from '../composables/useIssueColumnResize';
import IssueTable from './IssueTable.vue';
import ProjectGroupedIssueList from './grouped/ProjectGroupedIssueList.vue';
import { useProjectIssueListActions } from '../composables/useProjectIssueListActions';

const props = defineProps<{
  scope: ProjectIssueListScope;
  viewSettings?: TypesViewProps;
  hideParent?: boolean;
  propertyTemplates?: DtoProjectPropertyTemplate[];
}>();

const { t } = useI18n();
const GanttView = defineAsyncComponent(() => import('./gantt/components/GanttView.vue'));
const source = createProjectIssueListSource(props.scope);
const actions = useProjectIssueListActions(props.scope);
const pendingPropertyResets = new Set<string>();
const isBoard = computed(() => props.viewSettings?.issueView === 'kanban');
const isGantt = computed(() => props.viewSettings?.issueView === 'gantt_chart');
const groupBy = computed(() => {
  const value = normalizeIssueGroupBy(props.viewSettings?.filters?.group_by);
  const projectGroup = value === 'project' ? null : value;
  return projectGroup ?? (isBoard.value ? 'state' : null);
});
const columnResize = useIssueColumnResize(
  () => `project:${props.scope.workspaceSlug}:${props.scope.projectId}`,
);
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
  ? { issues: groupBy.value ? groups.value.flatMap((group) => group.items) : controller.items.value }
  : {});

provideIssueListController(controller);

onMounted(() => void controller.load());
onBeforeUnmount(controller.dispose);
</script>
