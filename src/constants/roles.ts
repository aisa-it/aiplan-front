import { RolesValue } from 'src/composables/usePermission';

export type Actions =
  | 'ws-settings'
  | 'delete-ws'
  | 'create-project'
  | 'delete-project'
  | 'add-comment'
  | 'create-issue'
  | 'change-issue-primary'
  | 'change-issue-secondary'
  | 'change-issue-basic'
  | 'delete-issue'
  | 'project-settings'
  | 'show-project-popup'
  | 'jira-import'
  | 'show-project'
  | 'transfer-issue'
  | 'add-linked-issue'
  | 'add-sub-issue'
  | 'show-ws'
  | 'create-form'
  | 'change-lead-ws'
  | 'change-issue-status'
  | 'delete-issue-comment'
  | 'edit-document'
  | 'create-sprint'
  | 'show-sprint-popup'
  | 'change-lead-project'
  | 'show-sprints-nav'
  | 'add-to-fav'
  | 'show-comment';

export type WorkspaceActions =
  | 'ws-settings'
  | 'delete-ws'
  | 'create-project'
  | 'delete-project'
  | 'jira-import'
  | 'show-ws'
  | 'create-form'
  | 'change-lead-ws'
  | 'edit-document'
  | 'create-sprint'
  | 'show-sprint-popup'
  | 'show-sprints-nav';

export type ProjectActions =
  | 'delete-project'
  | 'create-issue'
  | 'project-settings'
  | 'show-project-popup'
  | 'show-project'
  | 'change-lead-project'
  | 'add-to-fav'
  | 'show-comment';

export type IssuesActions =
  | 'ws-settings'
  | 'add-comment'
  | 'create-issue'
  | 'change-issue-primary'
  | 'change-issue-secondary'
  | 'change-issue-basic'
  | 'delete-issue'
  | 'transfer-issue'
  | 'add-linked-issue'
  | 'add-sub-issue'
  | 'change-issue-status'
  | 'delete-issue-comment'
  | 'show-comment';

type AdminWorkspaceActions = WorkspaceActions | ProjectActions | IssuesActions;
type AdminProjectActions = ProjectActions | IssuesActions;

export const workspaceOwnerActions: Actions[] = [
  'ws-settings',
  'delete-ws',
  'create-project',
  'delete-project',
  'add-comment',
  'create-issue',
  'change-issue-primary',
  'change-issue-secondary',
  'change-issue-basic',
  'delete-issue',
  'project-settings',
  'show-project-popup',
  'jira-import',
  'show-project',
  'transfer-issue',
  'add-linked-issue',
  'add-sub-issue',
  'show-ws',
  'create-form',
  'change-lead-ws',
  'change-issue-status',
  'delete-issue-comment',
  'edit-document',
  'create-sprint',
  'show-sprint-popup',
  'show-sprints-nav',
];

export const workspaceAdminActions: Actions[] = [
  'ws-settings',
  'create-project',
  'delete-project',
  'add-comment',
  'create-issue',
  'change-issue-primary',
  'change-issue-secondary',
  'change-issue-basic',
  'delete-issue',
  'project-settings',
  'show-project-popup',
  'jira-import',
  'show-project',
  'transfer-issue',
  'add-linked-issue',
  'add-sub-issue',
  'show-ws',
  'create-form',
  'change-issue-status',
  'delete-issue-comment',
  'edit-document',
  'create-sprint',
  'show-sprint-popup',
  'show-sprints-nav',
];

export const workspaceMemberActions: Actions[] = [
  'show-ws',
  'edit-document',
  'show-sprints-nav',
];

export const workspaceGuestActions: Actions[] = ['show-ws'];

export const projectOwnerActions: Actions[] = [
  'delete-project',
  'add-comment',
  'create-issue',
  'change-issue-primary',
  'change-issue-secondary',
  'change-issue-basic',
  'delete-issue',
  'project-settings',
  'show-project-popup',
  'change-lead-project',
  'show-project',
  'transfer-issue',
  'add-linked-issue',
  'add-sub-issue',
  'add-to-fav',
  'change-issue-status',
  'delete-issue-comment',
];

export const projectAdminActions: Actions[] = [
  'add-comment',
  'create-issue',
  'change-issue-primary',
  'change-issue-secondary',
  'change-issue-basic',
  'delete-issue',
  'project-settings',
  'show-project-popup',
  'show-project',
  'transfer-issue',
  'add-linked-issue',
  'add-sub-issue',
  'add-to-fav',
  'change-issue-status',
  'delete-issue-comment',
];

export const projectMemberActions: Actions[] = [
  'add-comment',
  'create-issue',
  'change-issue-basic',
  'show-project-popup',
  'show-project',
  'change-issue-status',
  'add-to-fav',
];

export const projectGuestActions: Actions[] = [
  'show-project-popup',
  'show-project',
  'show-comment',
  'add-to-fav',
];

export const issueAuthorActions: Actions[] = [
  'add-comment',
  'delete-issue',
  'create-issue',
  'change-issue-primary',
  'change-issue-secondary',
  'change-issue-basic',
  'transfer-issue',
  'add-linked-issue',
  'add-sub-issue',
  'change-issue-status',
];

export const issueAssigneeActions: Actions[] = [
  'add-comment',
  'create-issue',
  'change-issue-secondary',
  'change-issue-basic',
  'change-issue-status',
];

export const ROLES = {
  workspace: {
    owner: workspaceOwnerActions,
    admin: workspaceAdminActions,
    member: workspaceMemberActions,
    guest: workspaceGuestActions,
  },
  project: {
    owner: projectOwnerActions,
    admin: projectAdminActions,
    member: projectMemberActions,
    guest: projectGuestActions,
  },
  issue: {
    author: issueAuthorActions,
    assignee: issueAssigneeActions,
    reader: [],
    watcher: [],
  },
};

export function checkPermission(roles: any, action: string) {
  let isAllowed = false;

  if (!roles || !action) return isAllowed;

  for (const role in roles) {
    if (isAllowed === true) return isAllowed;
    isAllowed = ROLES[role][roles[role]]?.includes(action) ? true : false;
  }
  return isAllowed;
}

export function checkPermissionByWs(role: string, action: string) {
  let isAllowed = false;

  isAllowed = ROLES.workspace[role as keyof typeof ROLES.project]?.includes(
    action,
  )
    ? true
    : false;

  return isAllowed;
}

export function checkPermissionByProject(project_role: string, action: string) {
  let isAllowed = false;

  isAllowed =
    ROLES.project[project_role as keyof typeof ROLES.project]?.includes(
      action,
    ) ?? false;

  return isAllowed;
}

export function checkPermissionByIssue(
  ws_role: string,
  project_role: string,
  issue_role: string,
  action: string,
) {
  let isAllowed = false;
  let isAllowedByIssue = false;
  isAllowed = !!(
    ROLES.project[project_role as keyof typeof ROLES.project]?.includes(
      action,
    ) ||
    ROLES.workspace[ws_role as keyof typeof ROLES.workspace]?.includes(action)
  );

  isAllowedByIssue =
    issue_role.length > 0
      ? ROLES.issue[issue_role as keyof typeof ROLES.issue]?.includes(action)
      : false;
  return isAllowed || isAllowedByIssue;
}

export function defineRole(role_value: number): RolesValue {
  let role: RolesValue = 'guest';

  switch (role_value) {
    case 15:
      role = 'admin';
      break;
    case 10:
      role = 'member';
      break;
    case 5:
      role = 'guest';
      break;
  }

  return role;
}

export function checkPerm() {}
