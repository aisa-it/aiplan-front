import { defineStore } from 'pinia';
import { useAiplanStore } from 'stores/aiplan-store';
import { IForms } from 'src/interfaces/forms';

const aiplan = useAiplanStore();
const api = aiplan.api;

export const useFormStore = defineStore('form-store', {
  state: () => {
    return {
      forms: [] as IForms[],
    };
  },
  actions: {
    async createForm(workspaceSlug: string, request: any) {
      return api
        .post(`/api/auth/workspaces/${workspaceSlug}/forms/`, request)
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err);
        });
    },
    async updateForm(workspaceSlug: string, formSlug: string, request: any) {
      return api
        .patch(
          `/api/auth/workspaces/${workspaceSlug}/forms/${formSlug}`,
          request,
        )
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err);
        });
    },
    async deleteForm(workspaceSlug: string, formSlug: string) {
      return api
        .delete(`/api/auth/workspaces/${workspaceSlug}/forms/${formSlug}`)
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err);
        });
    },
    async getFormList(workspaceSlug: string) {
      return api
        .get(`/api/auth/workspaces/${workspaceSlug}/forms/`)
        .then((res) => (this.forms = res?.data))
        .catch((err) => {
          throw new Error(err);
        });
    },

    async getSettingsForm(formSlug: string, useAuth: boolean) {
      return api
        .get(`/api${useAuth ? '/auth' : ''}/forms/${formSlug}`)
        .then((res) => res)
        .catch((err) => {
          throw new Error(err);
        });
    },

    async sendForm(formSlug: string, body: any, useAuth: boolean) {
      return api
        .post(`/api${useAuth ? '/auth' : ''}/forms/${formSlug}/answer`, body)
        .then((res) => res.data)
        .catch((err) => {
          throw new Error(err);
        });
    },
    async getFormAnswers(
      workspaceSlug: string,
      formSlug: string,
      pagination: any,
    ) {
      return api.get(
        `/api/auth/workspaces/${workspaceSlug}/forms/${formSlug}/answers/`,
        {
          params: {
            offset: pagination.offset,
            limit: pagination.limit,
            order_by: pagination.order_by,
            desc: pagination.desc,
          },
        },
      );
    },

    async getFormAnswer(
      workspaceSlug: string,
      formSlug: string,
      answerId: string,
    ) {
      return api.get(
        `/api/auth/workspaces/${workspaceSlug}/forms/${formSlug}/answers/${answerId}/`,
      );
    },
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
