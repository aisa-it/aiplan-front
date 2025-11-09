import { DtoFormLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { defineStore } from 'pinia';

export const useFormDialogStore = defineStore('form-dialog-store', {
  state: () => {
    return {
      isOpen: false,
      form: {} as DtoFormLight,
    };
  },
  actions: {
    openForCreat() {
      this.isOpen = true;
      this.form = {} as DtoFormLight;
    },
    openForEdit(form: DtoFormLight) {
      this.isOpen = true;
      this.form = form;
    },
    close() {
      this.isOpen = false;
      this.form = {} as DtoFormLight;
    },
  },
});
