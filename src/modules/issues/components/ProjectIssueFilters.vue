<template>
  <IssueFiltersMenu
    :settings="settings"
    :defaults="DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS"
    :statuses="statuses"
    :options-loading="optionsLoading"
    :column-options="columnOptions"
    :view-options="viewOptions"
    :group-options="groupOptions"
    :display-toggles="displayToggles"
    :personal-toggles="personalToggles"
    @change="save"
    @reset="reset"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  DtoProjectPropertyTemplate,
  DtoStateLight,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useProjectStore } from '@/stores/project-store';
import {
  DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS,
  DEFAULT_VISIBLE_ISSUE_COLUMNS,
} from '../model/issue-list.defaults';
import type {
  IssueFilterColumnOption,
  IssueFilterOption,
  IssueViewOption,
} from '../model/issue-filters.types';
import type { ProjectIssueListScope } from '../model/issue-list.types';
import IssueFiltersMenu from './IssueFiltersMenu.vue';
import { ISSUE_GROUP_FIELDS, normalizeIssueGroupBy } from '../model/issue-groups';

const props = defineProps<{
  scope: ProjectIssueListScope;
  settings?: TypesViewProps;
  statuses: DtoStateLight[];
  propertyTemplates: DtoProjectPropertyTemplate[];
  optionsLoading: boolean;
}>();
const { t } = useI18n();
const projectStore = useProjectStore();

const columnOptions = computed<IssueFilterColumnOption[]>(() => [
  ...DEFAULT_VISIBLE_ISSUE_COLUMNS.map((key) => ({
    key,
    title: t(`issues.columns.${key}`),
  })),
  ...props.propertyTemplates
    .filter((template) => template.id && template.name)
    .map((template) => ({
      key: `property:${template.id}` as const,
      title: template.name ?? '',
    })),
]);
const viewOptions = computed<IssueViewOption[]>(() => [
  { value: 'list', title: t('issues.filters.list') },
  { value: 'kanban', title: t('issues.filters.board') },
]);
const groupOptions = computed<IssueFilterOption[]>(() => [
  ...(props.settings?.issueView === 'kanban'
    ? []
    : [{ value: 'none', title: t('issues.filters.noGrouping') }]),
  ...ISSUE_GROUP_FIELDS.map((value) => ({
    value,
    title: value === 'watchers' ? t('issues.groups.watcher') : t(`issues.columns.${value}`),
  })),
  ...props.propertyTemplates.flatMap((template) => template.id && template.name
    ? [{ value: `property:${template.id}`, title: t('issues.groups.propertyOption', { name: template.name }) }]
    : []),
]);
const displayToggles = computed(() => [
  { key: 'hideSubIssues' as const, label: t('issues.filters.hideSubIssues') },
  { key: 'draft' as const, label: t('issues.filters.showDrafts') },
  ...(props.settings?.issueView === 'kanban' || normalizeIssueGroupBy(props.settings?.filters?.group_by)
    ? [{ key: 'showEmptyGroups' as const, label: t('issues.filters.showEmptyGroups') }]
    : []),
  { key: 'showOnlyActive' as const, label: t('issues.filters.onlyActive') },
]);
const personalToggles = computed(() => [
  { key: 'assignedToMe' as const, label: t('issues.filters.assignedToMe') },
  { key: 'watchedToMe' as const, label: t('issues.filters.watchedToMe') },
  { key: 'authoredToMe' as const, label: t('issues.filters.authoredToMe') },
]);

const save = async (patch: TypesViewProps, replace = false) => {
  try {
    await projectStore.updateViewSettings(
      props.scope.workspaceSlug,
      props.scope.projectId,
      patch,
      { replace },
    );
  } catch {}
};
const reset = () => {
  void save(DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS, true);
};
</script>
