import { storeToRefs } from 'pinia';
import { IQuery, useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { computed } from 'vue';

export const useDefaultIssues = () => {
  const { projectProps, project } = storeToRefs(useProjectStore());
  const issuesStore = useIssuesStore();
  const { currentWorkspaceSlug, workspaceInfo } =
    storeToRefs(useWorkspaceStore());

  const defineIssuesPagination = computed(() => {
    return {
      only_count: false,
      show_sub_issues: projectProps.value?.showSubIssues ?? true,
      draft: projectProps.value?.draft ?? true,
      order_by: projectProps.value?.filters?.order_by ?? 'sequence_id',
      desc: projectProps.value?.filters?.orderDesc,
      offset: 0,
      limit: projectProps.value?.page_size,
      only_active: projectProps.value?.showOnlyActive ?? true,
    };
  });

  async function onRequest(pagination?: IQuery) {
    if (pagination) {
      pagination.order_by = pagination.order_by ?? 'sequence_id';
    }
    const filters = {
      states: [] as string[],
      assigned_to_me: projectProps?.value?.filters?.assignedToMe,
      authored_by_me: projectProps?.value?.filters?.authoredToMe,
      watched_by_me: projectProps?.value?.filters?.watchedToMe,
    };
    if (projectProps.value?.filters?.states?.length) {
      filters.states = projectProps?.value?.filters?.states;
    }

    const response = await issuesStore.getIssuesTable(
      currentWorkspaceSlug.value,
      project.value.id,
      filters,
      pagination || defineIssuesPagination.value,
    );
    issuesStore.ungroupedIssueList = response?.data;
    return response;
  }

  return { onRequest };
};
