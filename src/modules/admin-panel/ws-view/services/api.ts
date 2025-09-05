import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import {
  DaoPaginationResponse,
  DtoWorkspaceWithCount,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { IQueryParams } from 'src/shared/types/query-params';

const apiAdminPanel = new (withInterceptors(AdminPanel))();
export const api = {
  getWorkspaces: async (
    data?: IQueryParams,
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoWorkspaceWithCount[];
    }
  > => {
    return apiAdminPanel.getAllWorkspaceList(data).then((res) => res.data);
  },
};
