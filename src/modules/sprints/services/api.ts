import {
  AiplanRequestIssueIdList,
  AiplanRequestSprint,
  AiplanRequestUserIdList,
  DtoRequestSprintFolder,
  DtoSprint,
  DtoSprintLight,
  DtoSprintFolder,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Sprint } from '@aisa-it/aiplan-api-ts/src/Sprint';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(Sprint))();

export const getSprints = async (
  workspaceSlug: string,
): Promise<DtoSprintFolder[]> => {
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

export const createSprintFolder = async (
  workspaceSlug: string,
  data: DtoRequestSprintFolder,
) => {
  return api.addSprintFolders(workspaceSlug, data).then((res) => res.data);
}

export const deleteSprintFolder = async (
  workspaceSlug: string,
  sprintFolderId: string,
) => {
  return api.deleteSprintFolders(workspaceSlug, sprintFolderId).then((res) => res.data);
}

export const updateSprintFolder = async (
  workspaceSlug: string,
  sprintFolderId: string,
  data: DtoRequestSprintFolder,
) => {
  return api.updateSprintFolders(workspaceSlug, sprintFolderId, data).then((res) => res.data);
}

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

export const sprintUpdate = async (
  workspaceSlug: string,
  sprintId: string,
  data: AiplanRequestSprint,
) => {
  return api
    .updateSprint(workspaceSlug, sprintId, data)
    .then((res) => res.data);
};

export const deleteSprint = async (
  workspaceSlug: string,
  sprintId: string,
): Promise<void> => {
  return api.deleteSprint(workspaceSlug, sprintId).then((res) => res.data);
};

export const updateSprintView = async (
  workspaceSlug: string,
  sprintId: string,
  view_props: TypesViewProps,
) => {
  return api
    .updateSprintView(workspaceSlug, sprintId, view_props)
    .then((res) => res.data);
};
