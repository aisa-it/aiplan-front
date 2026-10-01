import { Integrations } from '@aisa-it/aiplan-api-ts/src/Integrations';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import type {
  AiplanEmailRequest,
  AiplanPasswordRequest,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';

const usersApi = new (withInterceptors(Users))();
const integrationsApi = new (withInterceptors(Integrations))();

type ActivitiesTableRequest = Parameters<
  typeof usersApi.getMyActivitiesTable
>[0];

export const ProfileService = {
  async changeEmail(data: AiplanEmailRequest) {
    await usersApi.changeMyEmail(data);
  },

  async changePassword(data: AiplanPasswordRequest) {
    return (await usersApi.updateMyPassword(data)).data;
  },

  async uploadAvatar(file: File) {
    return (await usersApi.updateCurrentUserAvatar({ file })).data;
  },

  async deleteAvatar() {
    return (await usersApi.deleteCurrentUserAvatar()).data;
  },

  async getAuthToken() {
    return (await usersApi.getMyAuthToken()).data;
  },

  async getActivitiesTable(params: ActivitiesTableRequest) {
    return (await usersApi.getMyActivitiesTable(params)).data;
  },

  async resetAuthToken() {
    await usersApi.resetMyAuthToken();
    return (await usersApi.getMyAuthToken()).data;
  },

  async getTelegramBotUrl() {
    const data = (await integrationsApi.getTgBotLink()).data as Record<
      string,
      unknown
    >;

    return typeof data.url === 'string' ? data.url : '';
  },
};
