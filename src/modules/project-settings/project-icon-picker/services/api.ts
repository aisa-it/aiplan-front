import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

export const projectsApi = new (withInterceptors(Projects))();

const updateProjectLogo = async (
  workspaceSlug: string,
  projectId: string,
  data: {
    /** Файл логотипа */
    file: File;
  },
): Promise<void> => {
  return projectsApi
    .updateProjectLogo(workspaceSlug, projectId, data)
    .then((res) => res.data);
};

export { updateProjectLogo };
