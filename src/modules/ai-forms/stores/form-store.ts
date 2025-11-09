import { defineStore } from 'pinia';
import { api } from '../services/api';
import {
  AiplanReqForm,
  DtoFormLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const useFormStore = defineStore('form-store', {
  state: () => {
    return {
      forms: [] as DtoFormLight[],
    };
  },
  actions: {
    async createForm(wsSlug: string, request: AiplanReqForm) {
      return api.createForm(wsSlug, request).then((res) => {
        this.getFormList(wsSlug);
        return res;
      });
    },
    async updateForm(wsSlug: string, formSlug: string, request: AiplanReqForm) {
      return api.updateForm(wsSlug, formSlug, request).then((res) => {
        this.getFormList(wsSlug);
        return res;
      });
    },
    async deleteForm(wsSlug: string, formSlug: string) {
      return api
        .deleteForm(wsSlug, formSlug)
        .then((_) => this.getFormList(wsSlug));
    },

    async getFormList(wsSlug: string) {
      return api.getFormList(wsSlug).then((res) => (this.forms = res));
    },

    async resetForms() {
      return (this.forms = []);
    },

    // async getFormAnswers(
    //   workspaceSlug: string,
    //   formSlug: string,
    //   pagination: any,
    // ) {
    //   return api2.get(
    //     `/api/auth/workspaces/${workspaceSlug}/forms/${formSlug}/answers/`,
    //     {
    //       params: {
    //         offset: pagination.offset,
    //         limit: pagination.limit,
    //         order_by: pagination.order_by,
    //         desc: pagination.desc,
    //       },
    //     },
    //   );
    // },
  },
});
