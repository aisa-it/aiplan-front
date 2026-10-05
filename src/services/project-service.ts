import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import type {
  DtoProject,
  DtoProjectMemberWithLead,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const projectsApi = new (withInterceptors(Projects))();

export const projectService = {
  async getProject(
    workspaceSlug: string,
    projectId: string,
  ): Promise<DtoProject> {
    return await projectsApi
      .getProject(workspaceSlug, projectId)
      .then((res) => res.data);
  },

  async getMeInProject(
    workspaceSlug: string,
    projectId: string,
  ): Promise<DtoProjectMemberWithLead> {
    return await projectsApi
      .getProjectCurrentMembership(workspaceSlug, projectId)
      .then((res) => res.data);
  },
};
