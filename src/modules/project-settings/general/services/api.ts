import { projectsApi } from '../../services/api';

const deleteProject = async (
  workspaceSlug: string,
  projectId: string,
): Promise<void> => {
  projectsApi.deleteProject(workspaceSlug, projectId).then((res) => res.data);
};

export { deleteProject };
