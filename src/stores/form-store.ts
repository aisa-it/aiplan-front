import { defineStore } from 'pinia';
import { IForms } from 'src/interfaces/forms';
import { API_FORMS_PREFIX } from 'src/constants/apiPrefix';
import { useAiplanStore } from './aiplan-store';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Forms } from '@aisa-it/aiplan-api-ts/src/Forms';

const aiplan = useAiplanStore();
const api = aiplan.api;

const formsApi = new (withInterceptors(Forms))();

export const useFormStore = defineStore('form-store', {
  state: () => {
    return {
      forms: [] as IForms[],
    };
  },
  getters: {
    getFormBySlug: (state) => (slug: string) => {
      return state.forms.find((f) => f.slug === slug);
    },
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

    // TODO: отсутствует метод в апи
    async deleteFormAttachment(formSlug: string, attachmentId: string) {
      const res = await api.delete(
        `${API_FORMS_PREFIX}/${formSlug}/form-attachments/${attachmentId}`,
      );
      return res.data;
    },
  },
});
