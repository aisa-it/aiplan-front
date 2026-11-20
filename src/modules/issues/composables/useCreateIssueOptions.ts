import { ref, shallowRef, watch, type Ref } from 'vue';
import type {
  DtoIssueTemplate,
  DtoProjectMemberLight,
  DtoSprintLight,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import {
  loadCreateIssueMembers,
  loadCreateIssueSprints,
  loadCreateIssueStatuses,
  loadCreateIssueTemplates,
  searchCreateIssueMentionMembers,
} from '../api/create-issue-project-options.source';
import type { ProjectIssueListScope } from '../model/issue-list.types';

export const useCreateIssueOptions = (
  scope: Ref<ProjectIssueListScope | undefined>,
  canChangeSprint: boolean,
) => {
  const statuses = shallowRef<DtoStateLight[]>([]);
  const members = shallowRef<DtoProjectMemberLight[]>([]);
  const sprints = shallowRef<DtoSprintLight[]>([]);
  const templates = shallowRef<DtoIssueTemplate[]>([]);
  const isLoading = ref(false);
  let optionsSignal: AbortSignal | undefined;

  watch(
    scope,
    async (project, _previous, onCleanup) => {
      statuses.value = [];
      members.value = [];
      sprints.value = [];
      templates.value = [];
      isLoading.value = !!project;
      if (!project) return;

      const controller = new AbortController();
      const { signal } = controller;
      optionsSignal = signal;
      onCleanup(() => controller.abort());

      const [states, people, projectTemplates, workspaceSprints] =
        await Promise.allSettled([
          loadCreateIssueStatuses(project, signal),
          loadCreateIssueMembers(project, signal),
          loadCreateIssueTemplates(project, signal),
          canChangeSprint
            ? loadCreateIssueSprints(project.workspaceSlug, signal)
            : [],
        ]);
      if (signal.aborted) return;

      if (states.status === 'fulfilled') statuses.value = states.value;
      if (people.status === 'fulfilled') members.value = people.value;
      if (projectTemplates.status === 'fulfilled')
        templates.value = projectTemplates.value;
      if (workspaceSprints.status === 'fulfilled')
        sprints.value = workspaceSprints.value;
      isLoading.value = false;
    },
    { immediate: true, flush: 'sync' },
  );

  const searchMentionMembers = async (search: string) => {
    const project = scope.value;
    const signal = optionsSignal;
    if (!project || !signal) return [];

    try {
      const result = await searchCreateIssueMentionMembers(
        project,
        search,
        signal,
      );
      return signal.aborted ? [] : result;
    } catch {
      return [];
    }
  };

  return {
    statuses,
    members,
    sprints,
    templates,
    isLoading,
    searchMentionMembers,
  };
};
