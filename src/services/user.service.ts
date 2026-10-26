import type {
  AiplanUserUpdateRequest,
  DtoUser,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { usersApi } from './clients';
import type { RequestParams } from '@aisa-it/aiplan-api-ts/src/http-client';

export type UpdateCurrentUserRequest = AiplanUserUpdateRequest & {
  tutorial?: DtoUser['tutorial'];
};

export const UserService = {
  async getCurrentUser() {
    return (await usersApi.getCurrentUser()).data;
  },

  async updateCurrentUser(
    data: UpdateCurrentUserRequest,
    params?: RequestParams,
  ) {
    return (await usersApi.updateCurrentUser(data, params)).data;
  },
};
