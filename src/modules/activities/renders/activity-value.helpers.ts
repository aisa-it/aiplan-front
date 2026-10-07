import { WORKSPACE_ROLE_TEXT } from '../model/activity-role.constants';

import type { ActivityVerb } from '../model/activity.types';

const ACTIVITY_VERB_TEXT: Readonly<Record<ActivityVerb, string>> = {
  created: 'создал(-а)',
  deleted: 'удалил(-а)',
  removed: 'убрал(-а)',
  added: 'добавил(-а)',
  updated: 'обновил(-а)',
  move: 'перенес(-ла)',
  copied: 'скопировал(-а)',
  move_doc_to_workspace: 'перенес(-ла)',
  move_doc_to_doc: 'перенес(-ла)',
  move_workspace_to_doc: 'перенес(-ла)',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const getDetailString = (detail: unknown, key: string) => {
  if (!isRecord(detail)) return undefined;

  const value = detail[key];

  return typeof value === 'string' ? value : undefined;
};

export const getDetailNumber = (detail: unknown, key: string) => {
  if (!isRecord(detail)) return undefined;

  const value = detail[key];

  return typeof value === 'number' ? value : undefined;
};

export const getActivityUserName = (user: unknown, fallback = '') => {
  if (!isRecord(user)) return fallback;

  const name = [
    getDetailString(user, 'last_name'),
    getDetailString(user, 'first_name'),
    user.is_active === false ? '(Заблокирован)' : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return name || getDetailString(user, 'email') || fallback;
};

export const getRoleText = (value?: string) =>
  WORKSPACE_ROLE_TEXT[Number(value)] ?? value ?? '';

export const getActivityVerbText = (verb?: string) =>
  (verb && ACTIVITY_VERB_TEXT[verb as ActivityVerb]) ?? verb ?? '';
