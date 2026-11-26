<template>
  <div class="flex h-[calc(100dvh-var(--v-layout-top))] min-h-0 flex-col overflow-hidden">
    <template v-if="sprint">
      <header class="flex min-w-0 items-start justify-between gap-3 px-4 py-3">
        <div class="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2">
          <h1 class="min-w-0 wrap-break-word text-xl leading-8">
            {{ sprint.name }} {{ dates }}
          </h1>
          <SprintProgress :stats="sprint.stats" class="w-80 max-w-full" />
        </div>
        <IssueListFilters
          sprint
          :settings="viewSettings"
          :statuses="statusOptions"
          :options-loading="false"
          @change="saveSettings"
          @reset="saveSettings(DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS, true)"
        />
      </header>
      <div v-if="sprint.description" class="max-h-[25dvh] shrink-0 overflow-auto px-4 pb-3">
        <EditorTipTap
          editor-id="sprint-description"
          :model-value="sprint.description"
          read-only-editor
          plain
          :can-edit="false"
        />
      </div>
      <v-divider />
      <div class="min-h-0 flex-1">
        <IssueList
          :workspace-slug="workspaceSlug"
          :list-key="`sprint:${workspaceSlug}:${sprint.id ?? sprintId}`"
          :source="source"
          :actions="actions"
          :view-settings="viewSettings"
          :sprint="sprint"
          @sprint-membership-changed="refreshProgress"
        />
      </div>
    </template>
    <div v-else-if="loadFailed" class="flex flex-1 flex-col items-center justify-center gap-2 p-4">
      <span role="status">{{ t('sprints.loadError') }}</span>
      <v-btn color="primary" variant="text" @click="load">
        {{ t('issues.groups.retry') }}
      </v-btn>
    </div>
    <template v-else>
      <v-skeleton-loader type="heading" width="320" class="max-w-full" />
      <IssueTableSkeleton class="min-h-0 flex-1" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { EditorTipTap } from '@/modules/editor';
import IssueList from '@/modules/issues/components/IssueList.vue';
import IssueListFilters from '@/modules/issues/components/IssueListFilters.vue';
import IssueTableSkeleton from '@/modules/issues/components/IssueTableSkeleton.vue';
import { DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS } from '@/modules/issues/model/issue-list.defaults';
import type { SprintIssueListScope } from '@/modules/issues/model/issue-list.types';
import { createSprintIssueListSource } from '../api/sprint-issue-list.source';
import { useSprintDetails } from '../composables/useSprintDetails';
import SprintProgress from './SprintProgress.vue';

const props = defineProps<{ workspaceSlug: string; sprintId: string }>();
const { t } = useI18n();
const scope: SprintIssueListScope = {
  type: 'sprint',
  workspaceSlug: props.workspaceSlug,
  sprintId: props.sprintId,
};
const { sprint, viewSettings, loadFailed, statusOptions, stateById, load, refreshProgress, saveView, actions } =
  useSprintDetails(scope);
const source = createSprintIssueListSource(scope, () => stateById.value);

const dates = computed(() => {
  const { start_date, end_date } = sprint.value ?? {};
  if (!start_date || !end_date) return '';
  const short = (value: string) => `${value.slice(8, 10)}.${value.slice(5, 7)}`;
  return `(${short(start_date)} – ${short(end_date)})`;
});
function saveSettings(patch: TypesViewProps, replace = false) {
  void saveView(patch, { replace }).catch(() => {});
}
</script>
