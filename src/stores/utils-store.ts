import { defineStore } from 'pinia';
import { useAiplanStore } from './aiplan-store';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { ReleaseNotes } from '@aisa-it/aiplan-api-ts/src/ReleaseNotes';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import { Integrations } from '@aisa-it/aiplan-api-ts/src/Integrations';
import {
  AiplanPostFeedbackRequest,
  DtoReleaseNoteLight,
  DtoUserFeedback,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { isCurrentDateInMonthRange } from 'src/utils/time';

const aiplan = useAiplanStore();
const api = aiplan.api;

const releaseNotesApi = new (withInterceptors(ReleaseNotes))();
const usersApi = new (withInterceptors(Users))();
const integrationsApi = new (withInterceptors(Integrations))();

export const useUtilsStore = defineStore('utils-store', {
  state: () => {
    return {
      botURL: '',
      isDemo: false,
      isSingUp: false,
      version: '',
      ny: false,
      wd: false,
      localVersion: localStorage.getItem('appVersion'),
      openReleaseNote: false,
      isEnabledJitsi: false,
      isEnabledCaptcha: false,
    };
  },

  actions: {
    //TODO: Метод отсутствует
    async getVersion() {
      return await api
        .get('/api/version/')
        .then((res) => {
          this.isDemo = res.data.demo;
          this.isSingUp = res.data.sign_up;
          this.version = res.data.version;
          this.ny = res.data.ny;
          this.wd = isCurrentDateInMonthRange(3, 5, 9);
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

    // TODO: Проверить тип возвращаемого ответа
    async getNotificationBotUrl() {
      await integrationsApi
        .getTgBotLink()
        .then((res) => (
          this.botURL =
          res.data.url
        ))
        .catch((err) => {
          throw new Error(err);
        });
    },

    // ------------- Help -------------
    //TODO: Метод отсутствует
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

    // ------------- Release Notes -------------

    async getReleaseNotes(): Promise<DtoReleaseNoteLight[]> {
      return releaseNotesApi.getProductUpdateList().then((res) => res.data);
    },

    async getReleaseNote(noteId: string): Promise<DtoReleaseNoteLight> {
      return releaseNotesApi.getReleaseNote(noteId).then((res) => res.data);
    },
  },
});
