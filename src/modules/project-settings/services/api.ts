import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import {
  DtoProject,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const projectsApi = new (withInterceptors(Projects))();

const updateProject = async (
  workspaceSlug: string,
  projectID: string,
  data: DtoProject,
): Promise<void> => {
  await projectsApi.updateProject(workspaceSlug, projectID, data);
};

export { updateProject };
