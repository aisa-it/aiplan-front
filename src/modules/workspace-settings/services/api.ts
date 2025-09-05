import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import {
  AiplanRequestEmailMember,
  AiplanRequestMembersInvite,
  AiplanRequestRoleMember,
  DaoWorkspaceBackup,
  DtoWorkspace,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const api = new (withInterceptors(Workspace))();

export const inviteWorkspace = async (
  workspaceSlug: string,
  data: AiplanRequestMembersInvite,
) => {
  await api.addToWorkspace(workspaceSlug, data);
};

export const updateWorkspace = async (
  workspaceSlug: string,
  data: DtoWorkspace,
) => {
  return (await api.updateWorkspace(workspaceSlug, data)).data;
};

export const deleteWorkspace = async (workspaceSlug: string) => {
  await api.deleteWorkspace(workspaceSlug);
};

export const updateWorkspaceMember = async (
  workspaceSlug: string,
  memberID: string,
  data: AiplanRequestRoleMember,
) => {
  await api.updateWorkspaceMember(workspaceSlug, memberID, data);
};

export const deleteWorkspaceMember = async (
  workspaceSlug: string,
  memberID: string,
) => {
  await api.deleteWorkspaceMember(workspaceSlug, memberID);
};

export const getWorkspaceToken = async (workspaceSlug: string) => {
  return (await api.getWorkspaceToken(workspaceSlug)).data;
};

export const resetWorkspaceToken = async (workspaceSlug: string) => {
  await api.resetWorkspaceToken(workspaceSlug);
};

export const exportWorkspace = async (
  workspaceSlug: string,
): Promise<DaoWorkspaceBackup> => {
  return (await api.exportWorkspace(workspaceSlug)).data;
};

export const importWorkspaceFromMinio = async (
  backupAsset: DaoWorkspaceBackup,
): Promise<any> => {
  return await api.importWorkspaceMinio(backupAsset);
};

export const setMemberEmail = async (
  currentWorkspaceSlug: string,
  memberId: string,
  data: AiplanRequestEmailMember,
) => {
  await api.updateUserEmail(currentWorkspaceSlug, memberId, data);
};

export const uploadWorkspaceLogo = async (
  currentWorkspaceSlug: string,
  file: File,
) => {
  return api.updateWorkspaceLogo(currentWorkspaceSlug, {
    file,
  });
};

export const deleteWorkspaceLogo = async (currentWorkspaceSlug: string) => {
  return api.deleteWorkspaceLogo(currentWorkspaceSlug);
};

export const getWorkspaceActivities = async (
  currentWorkspaceSlug: string,
  offset?: number,
  limit?: number,
) => {
  return (
    await api.getWorkspaceActivityList(currentWorkspaceSlug, {
      offset: offset,
      limit: limit,
    })
  ).data;
};
export const getActivityDateOnWorkspace = async (
  currentWorkspaceSlug: string,
  from: string,
  to: string,
) => {
  return (
    await api.getWorkspaceMembersActivityList(currentWorkspaceSlug as string, {
      from,
      to,
    })
  ).data;
};

export const getWorkspaceIntegrations = async (
  currentWorkspaceSlug: string,
) => {
  return (await api.getIntegrationList(currentWorkspaceSlug)).data;
};

export const addWorkspaceIntegration = async (
  currentWorkspaceSlug: string,
  integrationName: string,
) => {
  return await api.addIntegrationToWorkspace(
    currentWorkspaceSlug,
    integrationName,
  );
};

// export const deleteWorkspaceIntegration = async (
//   currentWorkspaceSlug: string,
//   integrationName: string,
// ) => {
//   return await api.deleteIntegrationFromWorkspace(
//     currentWorkspaceSlug,
//     integrationName,
//   );
// };
