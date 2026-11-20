import type {
  AiplanCreateProjectRequest,
  AiplanProjectNotificationRequest,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { projectsApi } from './clients';

type ProjectListQuery = Parameters<typeof projectsApi.getProjectList>[1];

export const ProjectService = {
  async getProjects(
    workspaceSlug: string,
    query?: ProjectListQuery,
    signal?: AbortSignal,
  ) {
    return (await projectsApi.getProjectList(workspaceSlug, query, { signal })).data;
  },

  async getProject(workspaceSlug: string, projectId: string) {
    return (await projectsApi.getProject(workspaceSlug, projectId)).data;
  },

  async getMeInProject(
    workspaceSlug: string,
    projectId: string,
    signal?: AbortSignal,
  ) {
    return (
      await projectsApi.getProjectCurrentMembership(workspaceSlug, projectId, {
        signal,
      })
    ).data;
  },

  async updateMyNotifications(
    workspaceSlug: string,
    projectId: string,
    settings: AiplanProjectNotificationRequest,
  ) {
    await projectsApi.updateMyNotifications(workspaceSlug, projectId, settings);
  },

  async createProject(workspaceSlug: string, data: AiplanCreateProjectRequest) {
    return (await projectsApi.createProject(workspaceSlug, data)).data;
  },

  async addToFavorites(workspaceSlug: string, projectId: string) {
    await projectsApi.addProjectToFavorites(workspaceSlug, {
      project: projectId,
    });
  },

  async removeFromFavorites(workspaceSlug: string, projectId: string) {
    await projectsApi.removeProjectFromFavorites(workspaceSlug, projectId);
  },

  async updateViewSettings(
    workspaceSlug: string,
    projectId: string,
    settings: TypesViewProps,
  ): Promise<void> {
    await projectsApi.updateProjectView(workspaceSlug, projectId, settings);
  },
};
