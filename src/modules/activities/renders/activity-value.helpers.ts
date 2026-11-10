import { i18n } from '@/i18n';
import { WORKSPACE_ROLE_KEY } from '../model/activity-role.constants';

import type { ActivityVerb } from '../model/activity.types';
import type { MessageKey } from '@/i18n';

const ACTIVITY_VERB_KEY: Readonly<Record<ActivityVerb, MessageKey>> = {
  created: 'activities.verbs.created',
  deleted: 'activities.verbs.deleted',
  removed: 'activities.verbs.removed',
  added: 'activities.verbs.added',
  updated: 'activities.verbs.updated',
  move: 'activities.verbs.move',
  copied: 'activities.verbs.copied',
  move_doc_to_workspace: 'activities.verbs.move_doc_to_workspace',
  move_doc_to_doc: 'activities.verbs.move_doc_to_doc',
  move_workspace_to_doc: 'activities.verbs.move_workspace_to_doc',
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
    user.is_active === false ? `(${i18n.global.t('common.states.blocked')})` : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return name || getDetailString(user, 'email') || fallback;
};

export const getRoleText = (value?: string) => {
  const role = value !== undefined ? WORKSPACE_ROLE_KEY[Number(value)] : undefined;

  return role ? i18n.global.t(role.labelKey) : (value ?? '');
};

export const getActivityVerbText = (verb?: string) =>
  verb && ACTIVITY_VERB_KEY[verb as ActivityVerb]
    ? i18n.global.t(ACTIVITY_VERB_KEY[verb as ActivityVerb])
    : (verb ?? '');
