import type {
  NotificationActivityData,
  NotificationMessagePart,
} from '../models';

export interface NotificationEntity {
  email?: string;
  first_name?: string;
  id?: string;
  identifier?: string;
  is_active?: boolean;
  is_onboarded?: boolean;
  last_name?: string;
  name?: string;
  priority?: string;
  sequence_id?: number | string;
  title?: string;
  url?: string;
}

export const textPart = (text: string): NotificationMessagePart => ({
  text,
  type: 'text',
});

const getSafeHref = (href?: string) => {
  if (!href) return;

  try {
    const url = new URL(href, window.location.origin);
    return url.protocol === 'http:' || url.protocol === 'https:'
      ? href
      : undefined;
  } catch {
    return;
  }
};

export const linkPart = (
  text: string,
  href?: string,
): NotificationMessagePart => {
  const safeHref = getSafeHref(href);
  return safeHref
    ? { href: safeHref, text, type: 'link' }
    : textPart(text);
};

export const getStringValue = (value: unknown) => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
};

export const getEntity = (value: unknown): NotificationEntity =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as NotificationEntity)
    : {};

export const getEntityByChange = (data: NotificationActivityData) =>
  getEntity(data.new_value ? data.new_entity_detail : data.old_entity_detail);

export const getFullName = (
  value: unknown,
  entityType?: string,
): string => {
  const user = getEntity(value);

  if (!Object.keys(user).length) return 'Пользователь удалён';

  if (!user.is_onboarded && entityType === 'form') {
    return `${user.last_name ?? ''} ${user.first_name ?? ''}`.trim();
  }

  if (!user.is_onboarded && entityType === 'comment') {
    return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  }

  if (!user.is_onboarded) return user.email ?? '';

  return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
};

export const getUserDisplayName = (value: unknown) => {
  const user = getEntity(value);
  const name = [
    user.last_name,
    user.first_name,
    user.is_active === false ? '(Заблокирован)' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return name || user.email || '';
};

export const getVerbText = (verb?: string) => {
  switch (verb) {
    case 'created':
      return 'добавил(-a)';
    case 'deleted':
    case 'remove':
    case 'removed':
      return 'убрал(-а)';
    case 'added':
      return 'добавил(-а)';
    case 'updated':
      return 'обновил(-a)';
    default:
      return verb ?? '';
  }
};

export const getPriorityText = (priority: unknown) => {
  switch (getStringValue(priority)) {
    case 'urgent':
      return 'критический';
    case 'high':
      return 'высокий';
    case 'medium':
      return 'средний';
    case 'low':
      return 'низкий';
    case 'null':
    case 'none':
    case '<nil>':
      return 'не выбран';
    default:
      return getStringValue(priority);
  }
};

export const getRoleText = (role: unknown) => {
  switch (Number(role)) {
    case 10:
      return 'Участник';
    case 15:
      return 'Администратор';
    case 20:
      return 'Никто';
    default:
      return 'Гость';
  }
};

export const getNetworkText = (value: unknown) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) ? 'Публичный' : 'Скрытый';
    } catch {
      return value ? 'Публичный' : 'Скрытый';
    }
  }

  return value ? 'Публичный' : 'Скрытый';
};

export const getStateText = (value: unknown) => {
  const state = getStringValue(value);

  switch (state.toLowerCase()) {
    case 'backlog':
      return 'Открыто';
    case 'unstarted':
      return 'Не начато';
    case 'started':
      return 'Начато';
    case 'completed':
      return 'Завершено';
    case 'cancelled':
      return 'Отменено';
    default:
      return state;
  }
};

export const capitalizeFirstLetter = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

export const addSpaceIfCamelCase = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, '$1 $2');

export const getProjectHref = (
  workspaceSlug?: string,
  projectIdentifier?: string,
) =>
  workspaceSlug && projectIdentifier
    ? `/${workspaceSlug}/projects/${projectIdentifier}`
    : undefined;

export const getIssueHref = (
  workspaceSlug?: string,
  projectIdentifier?: string,
  sequenceId?: number | string,
) =>
  workspaceSlug && projectIdentifier && sequenceId !== undefined
    ? `/${workspaceSlug}/projects/${projectIdentifier}/issues/${sequenceId}`
    : undefined;

export const getSprintHref = (
  workspaceSlug?: string,
  sprintId?: number | string,
) =>
  workspaceSlug && sprintId !== undefined
    ? `/${workspaceSlug}/sprints/${sprintId}`
    : undefined;
