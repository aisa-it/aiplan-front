import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function getUrlFile(id = '', url = '/api/auth/file/'): string {
  if (!id) return '';

  return url + id;
}

export function getUserName(
  user: DtoUser,
  isShowBlockStatus: boolean = true,
): string {
  let fullName = `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();

  if (isShowBlockStatus && !user.is_active) {
    fullName += ' (Заблокирован)';
  }

  return fullName;
}
