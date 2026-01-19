import { storeToRefs } from 'pinia';

import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { Actions, defineRole, ROLES } from 'src/constants/roles';
import {
  DtoIssue,
  DtoProjectMember,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useProjectStore } from 'src/stores/project-store';

type PermissionBy = 'workspace' | 'project' | 'issue';

export type RolesValue = 'owner' | 'admin' | 'member' | 'guest';

export type IssueRoles = 'assignee' | 'author' | 'watcher' | 'reader';
interface PermissionData {
  action: Actions;
  workspaceId?: string;
  projectId?: string;
  issue?: DtoIssue;
}

export function usePermission() {
  const userStore = useUserStore();
  const projectStore = useProjectStore();
  const workspaceStore = useWorkspaceStore();
  const { project } = storeToRefs(projectStore);

  const { workspaceInfo } = storeToRefs(workspaceStore);
  const { user, workspaceMemberships, projectMemberships } =
    storeToRefs(userStore);

  const findActionByRole = (
    action: Actions,
    role: number,
    field: 'workspace' | 'project',
  ) => {
    const parsedRole: RolesValue = defineRole(role);
    return ROLES[field][parsedRole]?.includes(action);
  };

  const findActionByIssueRole = (action: Actions, issueRole: IssueRoles) => {
    return ROLES.issue[issueRole]?.includes(action);
  };

  const checkPermissionByWorkspace = (action: Actions, workspaceId: string) => {
    let workspaceRole: number =
      workspaceMemberships.value.find(
        (membership: DtoWorkspaceMember) =>
          membership?.workspace_id === workspaceId,
      )?.role || 5;

    return findActionByRole(action, workspaceRole, 'workspace');
  };

  const checkPermissionByProject = (action: Actions, projectId: string) => {
    let projectRole: number =
      projectMemberships.value.find(
        (membership: DtoProjectMember) => membership.project_id === projectId,
      )?.role || 5;

    return findActionByRole(action, projectRole, 'project');
  };

  const checkPermissionByIssue = (
    action: Actions,
    issue: DtoIssue,
  ): boolean => {
    let issueRole: IssueRoles = 'reader';

    if (issue.author_detail?.id === user.value.id) {
      issueRole = 'author';
    }

    if (
      issue.assignee_details?.find((assignee) => assignee.id === user.value.id)
    ) {
      issueRole = 'assignee';
    }

    if (issueRole !== 'reader') {
      return findActionByIssueRole(action, issueRole);
    }
    return false;
  };

  /**
   * Проверяет наличие разрешения у пользователя
   *
   * Алгоритм проверки:
   * 1. Сначала проверяет разрешение на уровне workspace
   * 2. Если нет доступа, проверяет на уровне project
   * 3. Если нет доступа в проекте, проверяет в задаче (если указан issueId)
   *
   * При пропуске workspaceId и projectId, проверяются права для того пространства и проекта, в котором находится пользователь на данный момент
   *
   * @property  action - Название действия
   * @property  workspaceId - ID рабочего пространства (опционально)
   * @property  projectId - ID проекта (опционально)
   * @property  issue - тело задачи (опционально)
   * @returns {boolean} true - доступ разрешен, false - доступ запрещен
   *
   * @example
   * // Проверка разрешения на чтение в workspace
   * checkPermission({
   *   action: 'show-ws',
   *   workspaceId: 'ws-123'
   * });
   *
   */

  const checkPermission = (data: PermissionData): boolean => {
    let workspaceID;
    let projectID;

    if (!data.workspaceId && !data.projectId) {
      workspaceID = workspaceInfo?.value?.id;
      projectID = project.value?.id;
    } else {
      workspaceID = data.workspaceId;
      projectID = data.projectId;
    }

    if (!workspaceID || !projectID) return false;

    let isAllowed: boolean = checkPermissionByWorkspace(
      data.action,
      workspaceID,
    );

    if (data.projectId && isAllowed === false) {
      isAllowed = checkPermissionByProject(data.action, projectID);
    }

    if (data.issue && isAllowed === false) {
      isAllowed = checkPermissionByIssue(data.action, data.issue);
    }

    return isAllowed;
  };

  return {
    checkPermission,
  };
}
