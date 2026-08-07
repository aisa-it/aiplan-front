import { ROLES } from '@/constants/roles';

export function checkPermission(roles: Record<string, string>, action: string) {
  let isAllowed = false;

  if (!roles || !action) return isAllowed;

  for (const role in roles) {
    if (isAllowed === true) return isAllowed;
    const roleKey = role as keyof typeof ROLES;
    const roleValue = roles[role];
    
    if (ROLES[roleKey]) {
      const permissions = (ROLES[roleKey] as Record<string, string[]>)[roleValue];
      isAllowed = permissions?.includes(action) ?? false;
    }
  }
  return isAllowed;
}

export function checkPermissionByWs(role: string, action: string) {
  const permissions = (ROLES.workspace as Record<string, string[]>)[role];
  return permissions?.includes(action) ?? false;
}

export function checkPermissionByProject(project_role: string, action: string) {
  const permissions = (ROLES.project as Record<string, string[]>)[project_role];
  return permissions?.includes(action) ?? false;
}

export function checkPermissionByIssue(
  ws_role: string,
  project_role: string,
  issue_role: string,
  action: string,
) {
  const wsPermissions = (ROLES.workspace as Record<string, string[]>)[ws_role];
  const projectPermissions = (ROLES.project as Record<string, string[]>)[project_role];
  
  const isAllowed = !!(
    projectPermissions?.includes(action) ||
    wsPermissions?.includes(action)
  );

  const issuePermissions = (ROLES.issue as Record<string, string[]>)[issue_role];
  const isAllowedByIssue = issue_role.length > 0
      ? (issuePermissions?.includes(action) ?? false)
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
