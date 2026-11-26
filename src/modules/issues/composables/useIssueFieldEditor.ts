import { computed, ref } from 'vue';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useIssueEditorActions } from '../model/issue-list.context';
import type {
  EditableIssueField,
  IssueFieldPatch,
} from '../model/issue-list.types';

export const useIssueFieldEditor = (
  getIssue: () => DtoIssueWithCount,
  field: EditableIssueField,
) => {
  const actions = useIssueEditorActions();
  const isSaving = ref(false);
  const canEdit = computed(() => actions.canEditField(getIssue(), field));

  const save = async (value: IssueFieldPatch[typeof field]) => {
    if (!canEdit.value || isSaving.value) return false;
    isSaving.value = true;
    try {
      await actions.updateIssue(getIssue(), { [field]: value });
      return true;
    } catch {
      return false;
    } finally {
      isSaving.value = false;
    }
  };

  return { canEdit, isSaving, save };
};
