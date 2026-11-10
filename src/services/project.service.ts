import type { AiplanCreateProjectRequest } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { projectsApi } from './clients';

type ProjectListQuery = Parameters<typeof projectsApi.getProjectList>[1];

export const ProjectService = {
  async getProjects(workspaceSlug: string, query?: ProjectListQuery) {
    return (await projectsApi.getProjectList(workspaceSlug, query)).data;
  },

  async getProject(workspaceSlug: string, projectId: string) {
    return (await projectsApi.getProject(workspaceSlug, projectId)).data;
  },

  async getMeInProject(workspaceSlug: string, projectId: string) {
    return (
      await projectsApi.getProjectCurrentMembership(workspaceSlug, projectId)
    ).data;
  },

  async createProject(workspaceSlug: string, data: AiplanCreateProjectRequest) {
    return (await projectsApi.createProject(workspaceSlug, data)).data;
  },
};
