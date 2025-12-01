import { useIssuesStore } from 'src/stores/issues-store';
import { IQuery } from 'src/stores/issues-store';
import { computed } from 'vue';
import { useIssueContext } from './useIssueContext';

export const useDefaultIssues = (contextType: 'project' | 'sprint') => {
  const { contextProps, getIssue } = useIssueContext(contextType);
  const issuesStore = useIssuesStore();

  const defineIssuesPagination = computed(() => {
    return {
      only_count: false,
      show_sub_issues: contextProps.value?.showSubIssues ?? true,
      draft: contextProps.value?.draft ?? true,
      order_by: contextProps.value?.filters?.order_by ?? 'sequence_id',
      desc: contextProps.value?.filters?.orderDesc,
      offset: 0,
      limit: contextProps.value?.page_size,
      only_active: contextProps.value?.showOnlyActive ?? true,
    };
  });

  async function onRequest(pagination?: IQuery) {
    if (pagination) {
      pagination.order_by = pagination.order_by ?? 'sequence_id';
    }
    const filters = {
      states: [] as string[],
      assigned_to_me: contextProps?.value?.filters?.assignedToMe,
      authored_by_me: contextProps?.value?.filters?.authoredToMe,
      watched_by_me: contextProps?.value?.filters?.watchedToMe,
    };
    if (contextProps.value?.filters?.states?.length) {
      filters.states = contextProps?.value?.filters?.states;
    }

    const response = await getIssue(
      filters,
      pagination || defineIssuesPagination.value,
    );
    issuesStore.ungroupedIssueList = response?.data;
    return response;
  }

  return { onRequest };
};
