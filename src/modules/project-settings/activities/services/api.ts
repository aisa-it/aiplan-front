import {
  DaoPaginationResponse,
  DtoEntityActivityFull,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { projectsApi } from '../../services/api';


const getProjectActivities = async (
  workspaceSlug: string,
  projectID: string,
  queryData?: { offset?: number; limit?: number },
): Promise<
  DaoPaginationResponse & {
    result?: DtoEntityActivityFull[];
  }
> => {
  return projectsApi
    .getProjectActivityList(workspaceSlug, projectID, queryData)
    .then((res) => res.data);
};

export { getProjectActivities };
