import { computed, ref } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useIssueListControllerContext } from '../model/issue-list.context';
import type {
  EditableIssueField,
  IssueFieldPatch,
} from '../model/issue-list.types';

export const useIssueFieldEditor = (
  getIssue: () => DtoIssueWithCount,
  field: EditableIssueField,
) => {
  const controller = useIssueListControllerContext();
  const isSaving = ref(false);
  const canEdit = computed(() => controller.canEditField(getIssue(), field));

  const save = async (value: IssueFieldPatch[typeof field]) => {
    if (!canEdit.value || isSaving.value) return false;
    isSaving.value = true;
    try {
      await controller.updateIssue(getIssue(), { [field]: value });
      return true;
    } catch {
      // TODO: показать уведомление об ошибке сохранения.
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  return { canEdit, isSaving, save };
};
