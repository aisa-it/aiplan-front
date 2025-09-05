import {
  DtoProjectMember,
  DtoProjectMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { projectsApi } from '../../services/api';


const deleteProjectMember = async (
  workspaceSlug: string,
  projectID: string,
  memberId: string,
): Promise<void> => {
  return projectsApi
    .deleteProjectMember(workspaceSlug, projectID, memberId)
    .then((res) => res.data);
};

const inviteMemberToProject = async (
  workspaceSlug: string,
  projectID: string,
  data: DtoProjectMember,
): Promise<DtoProjectMemberLight> => {
  return projectsApi
    .addMemberToProject(workspaceSlug, projectID, data)
    .then((res) => res.data);
};

const updateProjectMember = async (
  workspaceSlug: string,
  projectID: string,
  memberId: string,
  role: Record<string, number>,
): Promise<DtoProjectMemberLight> => {
  return projectsApi
    .updateProjectMember(workspaceSlug, projectID, memberId, role)
    .then((res) => res.data);
};

export { deleteProjectMember, inviteMemberToProject, updateProjectMember };
