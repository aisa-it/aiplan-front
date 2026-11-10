import type { MessageKey } from '@/i18n';

export const WORKSPACE_ROLES = {
  guest: 5,
  member: 10,
  admin: 15,
  forbid: 20,
} as const;

export type WorkspaceRoleKey = 'guest' | 'member' | 'admin' | 'forbid';

export const WORKSPACE_ROLE_KEY: Readonly<
  Record<number, { key: WorkspaceRoleKey; labelKey: MessageKey }>
> = {
  [WORKSPACE_ROLES.guest]: { key: 'guest', labelKey: 'activities.roles.guest' },
  [WORKSPACE_ROLES.member]: { key: 'member', labelKey: 'activities.roles.member' },
  [WORKSPACE_ROLES.admin]: { key: 'admin', labelKey: 'activities.roles.admin' },
  [WORKSPACE_ROLES.forbid]: { key: 'forbid', labelKey: 'activities.roles.forbid' },
};
