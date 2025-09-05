import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import {
  AiplanUpdateStateRequest,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const projectsApi = new (withInterceptors(Projects))();

const getProjectStates = async (
  workspaceSlug: string,
  projectID: string,
  queryData?: { search_query?: string },
): Promise<Record<string, DtoStateLight[]>> => {
  return projectsApi
    .getStateList(workspaceSlug, projectID, queryData)
    .then((res) => res.data);
};

const updateState = async (
  workspaceSlug: string,
  projectID: string,
  stateId: string,
  data: AiplanUpdateStateRequest,
): Promise<DtoStateLight> => {
  return projectsApi
    .updateState(workspaceSlug, projectID, stateId, data)
    .then((res) => res.data);
};

const deleteState = async (
  workspaceSlug: string,
  projectID: string,
  stateId: string,
): Promise<void> => {
  projectsApi.deleteState(workspaceSlug, projectID, stateId);
};

const createState = async (
  workspaceSlug: string,
  projectID: string,
  data: DtoStateLight,
): Promise<DtoStateLight> => {
  return projectsApi
    .createState(workspaceSlug, projectID, data)
    .then((res) => res.data);
};

export { getProjectStates, updateState, deleteState, createState };
