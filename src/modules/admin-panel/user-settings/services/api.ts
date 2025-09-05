import { AdminPanel } from '@aisa-it/aiplan-api-ts/src/AdminPanel';
import {
  AiplanRoleUpdRequest,
  DaoPaginationResponse,
  DtoProjectLight,
  DtoUserLight,
  DtoWorkspace,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IQueryParams } from 'src/shared/types/query-params';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const apiAdminPanel = new (withInterceptors(AdminPanel))();

export const api = {
  getUser: async (userId: string): Promise<DtoUserLight> => {
    return apiAdminPanel.getUserById(userId).then((res) => res.data);
  },

  deleteUserFromWorkspace: async (
    userId: string,
    wsId: string,
  ): Promise<void> => {
    return apiAdminPanel
      .authAdminUsersWorkspacesMemberDelete(wsId, userId)
      .then((res) => res.data);
  },

  deleteUserFromProject: async (
    userId: string,
    wsId: string,
    projectId: string,
  ): Promise<void> => {
    return apiAdminPanel
      .authAdminUsersWorkspacesProjectsMemberDelete(wsId, userId, projectId)
      .then((res) => res.data);
  },

  getWorkspaces: async (
    userId: string,
    data?: IQueryParams,
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoWorkspace[];
    }
  > => {
    return apiAdminPanel
      .geWorkspaceListByUser(userId, {
        ...data,
        all: true,
        order_by: 'role',
        desc: true,
      })
      .then((res) => res.data);
  },

  changeUserRoleInWorkspace: async (
    wsId: string,
    userId: string,
    data: AiplanRoleUpdRequest,
  ): Promise<void> => {
    return apiAdminPanel
      .authAdminUsersWorkspacesMemberCreate(wsId, userId, data)
      .then((res) => res.data);
  },

  getProjects: async (
    userId: string,
    wsId: string,
    data?: IQueryParams,
  ): Promise<
    DaoPaginationResponse & {
      result?: DtoProjectLight[];
    }
  > => {
    return apiAdminPanel
      .getProjectListByUser(userId, wsId, {
        ...data,
        all: true,
        order_by: 'role',
        desc: true,
      })
      .then((res) => res.data);
  },

  updateUserRoleInProject: async (
    wsId: string,
    userId: string,
    projectId: string,
    data: AiplanRoleUpdRequest,
  ): Promise<void> => {
    return apiAdminPanel
      .authAdminUsersWorkspacesProjectsMemberCreate(
        wsId,
        userId,
        projectId,
        data,
      )
      .then((res) => res.data);
  },
};
