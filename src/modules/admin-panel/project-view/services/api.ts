import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import {
  DaoPaginationResponse,
  DtoProject,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { IQueryParams } from 'src/shared/types/query-params';

const apiAdminPanel = new (withInterceptors(AdminPanel))();
export const api = {
  getWsProjects: async (
    workspaceId: string,
    data?: IQueryParams,
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoProject[];
    }
  > => {
    return apiAdminPanel
      .getWorkspaceProjectList(workspaceId, data)
      .then((res) => res.data);
  },
};
