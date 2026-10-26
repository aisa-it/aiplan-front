import type {
  AiplanUserUpdateRequest,
  DtoUser,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { usersApi } from './clients';

export type UpdateCurrentUserRequest = AiplanUserUpdateRequest & {
  tutorial?: DtoUser['tutorial'];
};

export const UserService = {
  async getCurrentUser() {
    return (await usersApi.getCurrentUser()).data;
  },

  async updateCurrentUser(data: UpdateCurrentUserRequest) {
    return (await usersApi.updateCurrentUser(data)).data;
  },
};
