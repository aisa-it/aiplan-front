import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import {
  DaoPaginationResponse,
  DtoUserLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IQueryParams } from 'src/shared/types/query-params';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const apiAdminPanel = new (withInterceptors(AdminPanel))();

export const api = {
  getAllUsers: async (
    data?: IQueryParams,
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoUserLight[];
    }
  > => {
    return apiAdminPanel.getAllUserList(data).then((res) => res.data);
  },
  updateUser: async (userId: string, data: DtoUserLight) => {
    return apiAdminPanel.updateUser(userId, data).then((res) => res.data);
  },
  deleteUser: async (userId: string) => {
    return apiAdminPanel.deleteUser(userId).then((res) => res.data);
  }
};
