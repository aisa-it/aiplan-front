import { formsApi } from '@/services/clients';

export const FormService = {
  async getForms(workspaceSlug: string, signal: AbortSignal) {
    return (await formsApi.getFormList(workspaceSlug, { signal })).data ?? [];
  },
  async deleteForm(workspaceSlug: string, formSlug: string) {
    await formsApi.deleteForm(workspaceSlug, formSlug);
  },
};
