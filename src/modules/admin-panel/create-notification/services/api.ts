import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import { AiplanRequestMessage } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const apiAdminPanel = new (withInterceptors(AdminPanel))();

export const api = {
  createMessage: async (data: AiplanRequestMessage): Promise<void> => {
    return apiAdminPanel.createMessageForMember(data).then((res) => res.data);
  },
};
