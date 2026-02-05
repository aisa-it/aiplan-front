import { defineStore } from 'pinia';
import { IForms } from 'src/interfaces/forms';
import { API_FORMS_PREFIX } from 'src/constants/apiPrefix';
import { useAiplanStore } from './aiplan-store';

const aiplan = useAiplanStore();

const api = aiplan.api;

export const useFormStore = defineStore('form-store', {
  state: () => {
    return {
      forms: [] as IForms[],
    };
  },
  actions: {
    async resetForms() {
      return (this.forms = []);
    },

    copyFormLink(workspaceSlug: string, slug: string) {
      navigator.clipboard.writeText(
        `${location.protocol}//${location.host}/f/${workspaceSlug}/${slug}`,
      );
    },

    async deleteFormAttachment(formSlug: string, attachmentId: string) {
      const res = await api.delete(
        `${API_FORMS_PREFIX}/${formSlug}/form-attachments/${attachmentId}`,
      );
      return res.data;
    },
  },
});
