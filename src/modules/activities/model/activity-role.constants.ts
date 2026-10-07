export const WORKSPACE_ROLES = {
  guest: 5,
  member: 10,
  admin: 15,
  forbid: 20,
} as const;

export const WORKSPACE_ROLE_TEXT: Readonly<Record<number, string>> = {
  [WORKSPACE_ROLES.guest]: 'Гость',
  [WORKSPACE_ROLES.member]: 'Участник',
  [WORKSPACE_ROLES.admin]: 'Администратор',
  [WORKSPACE_ROLES.forbid]: 'Никто',
};
