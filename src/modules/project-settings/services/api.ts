import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';
import { Projects } from '@aisa-it/aiplan-api-ts/src/Projects';
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const projectsApi = new (withInterceptors(Projects))();

const updateProject = async (
  workspaceSlug: string,
  projectID: string,
  data: DtoProject,
): Promise<void> => {
  await projectsApi.updateProject(workspaceSlug, projectID, data);
};

//TODO когда появится, сделать через сгенерированное апи
const updateProjectLogo = async (
  workspaceSlug: string,
  projectID: string,
  data: { file: File },
) => {
  const formData = new FormData();
  formData.append('file', data.file);

  const response = await fetch(
    `/api/auth/workspaces/${workspaceSlug}/projects/${projectID}/logo/`,
    {
      method: 'POST',
      body: formData,
    },
  );

  if (!response.ok) {
    console.log(`Ошибка загрузки: ${response.statusText}`);
  }

  return response.json();
};

//TODO когда появится, сделать через сгенерированное апи
const deleteProjectLogo = async (workspaceSlug: string, projectID: string) => {
  const response = await fetch(
    `/api/auth/workspaces/${workspaceSlug}/projects/${projectID}/logo/`,
    {
      method: 'DELETE',
    },
  );

  return response.json();
};

export { updateProject, updateProjectLogo, deleteProjectLogo };
