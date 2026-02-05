import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import {
  AiplanGetRulesLogfilterRequest,
  DaoPaginationResponse,
  DtoRulesLog,
  DtoRulesScriptResponse,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const projectsApi = new (withInterceptors(Projects))();

const loadLogsList = async (
  workspaceSlug: string,
  projectID: string,
  data: AiplanGetRulesLogfilterRequest,
  queryData?: { offset?: number; limit?: number },
): Promise<
  DaoPaginationResponse & {
    result?: DtoRulesLog[];
  }
> => {
  return projectsApi
    .getRulesLog(workspaceSlug, projectID, data, queryData)
    .then((res) => res.data);
};

const loadRulesScript = async (
  workspaceSlug: string,
  projectID: string,
): Promise<DtoRulesScriptResponse> => {
  return projectsApi.getProjectRulesScript(workspaceSlug, projectID).then((res) => res.data);
};

export { loadLogsList, loadRulesScript };
