import type { DtoProjectMemberWithLead } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { checkPermissionByProject, defineRole } from '@/utils/permissions';

export function hasProjectPermission(
  membership: DtoProjectMemberWithLead | undefined,
  action: string,
) {
  const role = membership?.is_project_lead
    ? 'lead'
    : defineRole(membership?.role ?? 0);
  return checkPermissionByProject(role, action);
}

export function canConfigureProjectNotifications(
  membership?: DtoProjectMemberWithLead,
) {
  return defineRole(membership?.role ?? 0) === 'admin';
}
