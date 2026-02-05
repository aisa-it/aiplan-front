import { defineStore } from 'pinia';
import { IForms } from 'src/interfaces/forms';

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

    copyFormLink(slug: string) {
      navigator.clipboard.writeText(
        `${location.protocol}//${location.host}/f/${slug}`,
      );
    },
  },
});
