<template>
  <IssueList
    :workspace-slug="scope.workspaceSlug"
    :project-id="scope.projectId"
    :list-key="`project:${scope.workspaceSlug}:${scope.projectId}`"
    :source="source"
    :actions="actions"
    :view-settings="viewSettings"
    :hide-parent="hideParent"
    :property-templates="propertyTemplates"
  />
</template>

<script setup lang="ts">
import type {
  DtoProjectPropertyTemplate,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { createIssueListSource } from '../api/issue-list.source';
import { useProjectIssueListActions } from '../composables/useProjectIssueListActions';
import type { ProjectIssueListScope } from '../model/issue-list.types';
import IssueList from './IssueList.vue';

const props = defineProps<{
  scope: ProjectIssueListScope;
  viewSettings?: TypesViewProps;
  hideParent?: boolean;
  propertyTemplates?: DtoProjectPropertyTemplate[];
}>();

const { workspaceSlug, projectId } = props.scope;
const source = createIssueListSource(
  `/api/auth/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectId)}/issues/search`,
);
const actions = useProjectIssueListActions(props.scope);
</script>
