import {
  AiplanRequestIssueIdList,
  AiplanRequestSprint,
  AiplanRequestUserIdList,
  DtoSprint,
  DtoSprintLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(Sprint))();

export const getSprints = async (
  workspaceSlug: string,
): Promise<DtoSprintLight[]> => {
  return api.getSprintList(workspaceSlug).then((res) => res.data);
};

export const getSprint = async (
  workspaceSlug: string,
  sprintId: string,
): Promise<DtoSprint> => {
  return api.getSprint(workspaceSlug, sprintId).then((res) => res.data);
};

export const createSprint = async (
  workspaceSlug: string,
  data: AiplanRequestSprint,
): Promise<DtoSprint> => {
  return api.createSprint(workspaceSlug, data).then((res) => res.data);
};

export const sprintIssuesUpdate = async (
  workspaceSlug: string,
  sprintId: string,
  data: AiplanRequestIssueIdList,
): Promise<void> => {
  return api
    .sprintIssuesUpdate(workspaceSlug, sprintId, data)
    .then((res) => res.data);
};

export const sprintWatchersUpdate = async (
  workspaceSlug: string,
  sprintId: string,
  data: AiplanRequestUserIdList,
): Promise<void> => {
  return api
    .sprintWatchersUpdate(workspaceSlug, sprintId, data)
    .then((res) => res.data);
};
