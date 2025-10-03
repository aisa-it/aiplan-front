import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { ReleaseNotes } from '@aisa-it/aiplan-api-ts/src/ReleaseNotes';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import {
  API_AUTH_PREFIX,
  API_USERS_ME_PREFIX,
  API_WORKSPACES_PREFIX,
} from 'src/constants/apiPrefix';
import {
  AiplanPostFeedbackRequest,
  DtoReleaseNoteLight,
  DtoUserFeedback,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const aiplan = useAiplanStore();
const api = aiplan.api;

const releaseNotesApi = new (withInterceptors(ReleaseNotes))();
const usersApi = new (withInterceptors(Users))();

export const useUtilsStore = defineStore('utils-store', {
  state: () => {
    return {
      botURL: '',
      isDemo: false,
      isSingUp: false,
      version: '',
      ny: false,
      localVersion: localStorage.getItem('appVersion'),
      openReleaseNote: false,
      isEnabledJitsi: false,
      isEnabledCaptcha: false,
    };
  },

  actions: {
    async getVersion() {
      return await api
        .get('/api/version/')
        .then((res) => {
          this.isDemo = res.data.demo;
          this.isSingUp = res.data.sign_up;
          this.version = res.data.version;
          this.ny = res.data.ny;
          this.isEnabledJitsi = res.data.jitsi;
          this.isEnabledCaptcha = res.data.captcha;

          if (
            this.ny === true &&
            !localStorage.getItem('snow')?.includes('disable')
          ) {
            localStorage.setItem('snow', 'enable');
          }
          return res.data;
        })
        .catch((err) => {
          throw new Error(err);
        });
    },

    async getNotificationBotUrl() {
      await api
        .get(`${API_AUTH_PREFIX}/notification-bot-link`)
        .then((res) => (this.botURL = res.data.url))
        .catch((err) => {
          throw new Error(err);
        });
    },

    // uploads
    async mediaUpload(url: string, data = {}, config = {}): Promise<any> {
      return api({
        method: 'post',
        url: url,
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config,
      });
    },

    async deleteFile(workspace_id: string, assetUrl: string): Promise<any> {
      const lastIndex = assetUrl.lastIndexOf('/');
      const assetId = assetUrl.substring(lastIndex + 1);

      return api
        .delete(
          `${API_WORKSPACES_PREFIX}/file-assets/${workspace_id}/${assetId}/`,
        )
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    async uploadFile(file: FormData, workspaceSlug: string): Promise<any> {
      return this.mediaUpload(
        `${API_WORKSPACES_PREFIX}/${workspaceSlug}/file-assets/`,
        file,
      )
        .then((response) => response?.data)
        .catch((error) => {
          throw error?.response?.data;
        });
    },

    // ------------- Help -------------
    async getHelpPages() {
      return await api.get('/api/docsIndex/');
    },

    async getSelectedPage(url: string) {
      return await api.get(url);
    },

    // ------------- Feedback -------------
    async getUserFeedback(): Promise<DtoUserFeedback> {
      return usersApi.getMyFeedback().then((res) => res.data);
    },

    async createUserFeedback(data: AiplanPostFeedbackRequest) {
      return usersApi.createMyFeedback(data).then((res) => res.data);
    },

    async deleteUserFeedback() {
      const { data } = await api.delete(`${API_USERS_ME_PREFIX}/feedback/`);
      return data;
    },

    // ------------- Release Notes -------------

    async getReleaseNotes(): Promise<DtoReleaseNoteLight[]> {
      return releaseNotesApi.getProductUpdateList().then((res) => res.data);
    },

    async getReleaseNote(noteId: string): Promise<DtoReleaseNoteLight> {
      return releaseNotesApi.getReleaseNote(noteId).then((res) => res.data);
    },
  },
});
