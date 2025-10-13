import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Users } from '@aisa-it/aiplan-api-ts/src/Users';
import {
  AiplanEmailRequest,
  AiplanEmailVerifyRequest,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const usersApi = new (withInterceptors(Users))();

export const api = {
  changeMyEmail: async (data: AiplanEmailRequest): Promise<void> => {
    return usersApi.changeMyEmail(data).then((res) => res.data);
  },
  verifyMyEmail: async (data: AiplanEmailVerifyRequest) => {
    return usersApi.verifyMyEmail(data).then((res) => res.data);
  },
};
