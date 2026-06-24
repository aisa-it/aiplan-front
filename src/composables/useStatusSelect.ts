import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import type { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useIssuesStatesFlowStore } from 'src/stores/issues-states-flow-store';
import { useProjectStatesFlowStore } from 'src/stores/project-states-flow-store';

export function useStatusSelect() {
  const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());
  const singleIssueStore = useSingleIssueStore();
  const { setNotificationView } = useNotificationStore();
  const issuesStatesFlowStore = useIssuesStatesFlowStore();
  const projectStatesFlowStore = useProjectStatesFlowStore();

  const items = ref<DtoStateLight[]>([]);
  const isLoading = ref(false);
  const error = ref('');

  const resetItems = () => (items.value = []);

  const loadItems = async (projectId: string, issueId?: string) => {
    if (items.value.length) return;

    const workspaceSlug = currentWorkspaceSlug.value ?? '';

    error.value = '';

    const loaderTimeout = setTimeout(() => (isLoading.value = true), 300);
    try {
      if (issueId) {
        items.value = await issuesStatesFlowStore.getAvailableStates(
          workspaceSlug,
          projectId,
          issueId,
        );
      } else {
        items.value = await projectStatesFlowStore.getAvailableStatesNewIssue(
          workspaceSlug,
          projectId,
        );
      }
    } catch (e) {
      error.value = 'Не удалось получить актуальные статусы';
    } finally {
      clearTimeout(loaderTimeout);
      isLoading.value = false;
    }
  };

  const updateStatus = async (
    projectId: string,
    issueId: string,
    state: DtoStateLight,
  ) => {
    if (!currentWorkspaceSlug.value) return;

    await singleIssueStore.updateIssueData(
      currentWorkspaceSlug.value,
      projectId,
      issueId,
      { state: state.id },
    );

    resetItems();
    setNotificationView({ open: true, type: 'success' });
  };

  return { items, isLoading, error, loadItems, resetItems, updateStatus };
}
