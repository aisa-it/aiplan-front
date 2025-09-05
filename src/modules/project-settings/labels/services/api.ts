import { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { projectsApi } from '../../services/api';

const createProjectLabel = async (
  workspaceSlug: string,
  projectID: string,
  data: DtoLabelLight,
): Promise<DtoLabelLight> => {
  return projectsApi
    .createIssueLabel(workspaceSlug, projectID, data)
    .then(async (res) => {
      return res.data;
    });
};

const deleteProjectLabel = async (
  workspaceSlug: string,
  projectID: string,
  labelID: string,
): Promise<void> => {
  return projectsApi
    .deleteIssueLabel(workspaceSlug, projectID, labelID)
    .then(() => {
      return;
    });
};

const updateProjectLabel = async (
  workspaceSlug: string,
  projectID: string,
  labelID: string,
  data: DtoLabelLight,
): Promise<DtoLabelLight> => {
  return projectsApi
    .updateIssueLabel(workspaceSlug, projectID, labelID, data)
    .then(async (res) => {
      return res.data;
    });
};
export { createProjectLabel, deleteProjectLabel, updateProjectLabel };
