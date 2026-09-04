<template>
  <div class="h-full min-h-0">
    <IssueTable :hide-parent="hideParent" />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';

import type { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { createProjectIssueListSource } from '../api/project-issue-list.source';
import { provideIssueListController } from '../model/issue-list.context';
import { createIssueListInitialState } from '../model/issue-list.defaults';
import type { ProjectIssueListScope } from '../model/issue-list.types';
import { useIssueListController } from '../model/useIssueListController';
import IssueTable from './IssueTable.vue';
import { useProjectIssueListActions } from '../composables/useProjectIssueListActions';

const props = defineProps<{
  scope: ProjectIssueListScope;
  viewSettings?: TypesViewProps;
  hideParent?: boolean;
}>();

const controller = useIssueListController(
  createProjectIssueListSource(props.scope),
  createIssueListInitialState(props.viewSettings),
  useProjectIssueListActions(props.scope),
);

provideIssueListController(controller);

onMounted(() => void controller.load());
onBeforeUnmount(controller.dispose);
</script>
