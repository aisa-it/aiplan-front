export const ROLES = {
  workspace: {
    owner: [
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
    ],
    admin: [
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
    ],
    member: ['show-ws', 'edit-document'],
    guest: ['show-ws'],
  },
  project: {
    owner: [
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
    ],
    admin: [
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
    ],
    member: [
      'add-comment',
      'create-issue',
      'change-issue-basic',
      'show-project-popup',
      'show-project',
      'change-issue-status',
      'add-to-fav',
    ],
    guest: ['show-project-popup', 'show-project', 'show-comment', 'add-to-fav'],
  },
  issue: {
    author: [
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
    ],
    assignee: [
      'add-comment',
      'create-issue',
      'change-issue-secondary',
      'change-issue-basic',
      'change-issue-status',
    ],
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

export function defineRole(role_value: number) {
  let role = '';

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
