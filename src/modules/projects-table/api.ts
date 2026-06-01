import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const api = new (withInterceptors(Projects))();

const getWorkspaceProjects = async (
  workspaceSlug: string,
  searchQuery?: string,
): Promise<DtoProjectLight[]> => {
  const response = await api.getProjectList(workspaceSlug, {
    search_query: searchQuery,
  });
  return response.data;
};

export { getWorkspaceProjects };
