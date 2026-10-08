import { onBeforeUnmount, ref } from 'vue';
import type {
  DtoIssueWithCount,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useIssueListControllerContext } from '../model/issue-list.context';
import { useIssueFieldEditor } from './useIssueFieldEditor';

export const useIssueStatusEditor = (getIssue: () => DtoIssueWithCount) => {
  const controller = useIssueListControllerContext();
  const editor = useIssueFieldEditor(getIssue, 'state');
  const items = ref<DtoStateLight[]>([]);
  const isLoading = ref(false);
  const error = ref('');
  let requestNumber = 0;

  const load = async () => {
    if (!editor.canEdit.value || items.value.length) return;
    const currentRequest = ++requestNumber;
    items.value = [];
    isLoading.value = true;
    error.value = '';

    try {
      const states = await controller.getAvailableStates(getIssue());
      if (currentRequest === requestNumber) items.value = states;
    } catch {
      if (currentRequest === requestNumber) {
        error.value = 'Не удалось получить актуальные статусы';
      }
    } finally {
      if (currentRequest === requestNumber) isLoading.value = false;
    }
  };

  onBeforeUnmount(() => {
    requestNumber++;
  });

  return { ...editor, items, isLoading, error, load };
};
