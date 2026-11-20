<template>
  <div class="h-full min-h-0">
    <IssueTable :scope="scope" :hide-parent="hideParent" :property-templates="propertyTemplates" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch } from 'vue';
import { useEventBus } from '@vueuse/core';

import type { DtoProjectPropertyTemplate, TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { createProjectIssueListSource } from '../api/project-issue-list.source';
import { provideIssueListController } from '../model/issue-list.context';
import { issueCreatedEvent } from '../model/issue-list.events';
import { createIssueListInitialState } from '../model/issue-list.defaults';
import type { ProjectIssueListScope } from '../model/issue-list.types';
import { useIssueListController } from '../composables/useIssueListController.ts';
import IssueTable from './IssueTable.vue';
import { useProjectIssueListActions } from '../composables/useProjectIssueListActions';

const props = defineProps<{
  scope: ProjectIssueListScope;
  viewSettings?: TypesViewProps;
  hideParent?: boolean;
  propertyTemplates?: DtoProjectPropertyTemplate[];
}>();

const controller = useIssueListController(
  createProjectIssueListSource(props.scope),
  createIssueListInitialState(props.viewSettings),
  useProjectIssueListActions(props.scope),
);

watch(() => props.viewSettings, controller.applyViewSettings);

useEventBus(issueCreatedEvent).on(({ workspaceSlug, projectId }) => {
  if (workspaceSlug === props.scope.workspaceSlug && projectId === props.scope.projectId) {
    void controller.load();
  }
});

provideIssueListController(controller);

onMounted(() => void controller.load());
onBeforeUnmount(controller.dispose);
</script>
