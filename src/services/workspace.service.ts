import type { AiplanCreateWorkspaceRequest } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { workspaceApi } from './clients';

export const WorkspaceService = {
  async getUserWorkspaces() {
    return (await workspaceApi.getUserWorkspaceList()).data ?? [];
  },

  async getWorkspace(workspaceSlug: string) {
    return (await workspaceApi.getWorkspace(workspaceSlug)).data;
  },

  async getMeInWorkspace(workspaceSlug: string) {
    return (await workspaceApi.getWorkspaceCurrentMembership(workspaceSlug))
      .data;
  },

  async createWorkspace(data: AiplanCreateWorkspaceRequest) {
    return (await workspaceApi.createWorkspace(data)).data;
  },

  async addToFavorites(workspaceId: string) {
    await workspaceApi.addWorkspaceToFavorites({ workspace: workspaceId });
  },

  async removeFromFavorites(workspaceId: string) {
    await workspaceApi.removeWorkspaceFromFavorites(workspaceId);
  },
};
