import { computed, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import type {
  DtoProjectPropertyTemplate,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import {
  getEntityId,
  getGroupUser,
  getSavedBoardGroupKey,
  getSavedGroupKey,
  isEmptyGroupEntity,
} from '../model/issue-groups';
import type {
  IssueGroup,
  IssueGroupBy,
  IssueGroupEntity,
  IssueGroupHeader,
} from '../model/issue-groups';

export const useIssueGroupHeaders = (
  groups: Ref<IssueGroup[]>,
  getGroupBy: () => IssueGroupBy,
  getSettings: () => TypesViewProps | undefined,
  getTemplate: () => DtoProjectPropertyTemplate | undefined,
  lookupLabels: Ref<Record<string, string>>,
  isBoard: () => boolean,
) => {
  const { t } = useI18n();

  const propertyTitle = (entity: IssueGroupEntity) => {
    if (isEmptyGroupEntity(entity)) return t('issues.groups.unsetProperty');

    const type = getTemplate()?.type;
    if (type === 'boolean' || typeof entity === 'boolean') {
      return entity === true || entity === 'true'
        ? t('issues.groups.checked')
        : t('issues.groups.unchecked');
    }
    if (type === 'date' || type === 'datetime') {
      const date =
        type === 'date' ? dayjs(String(entity)) : dayjs.unix(Number(entity));
      if (date.isValid())
        return date.format(type === 'date' ? 'DD.MM.YYYY' : 'DD.MM.YYYY HH:mm');
    }
    if (type === 'link' || type === 'lookup') {
      const value = parseEntityObject(entity);
      if (type === 'link' && value) {
        return typeof value.name === 'string' && value.name
          ? value.name
          : t('issues.groups.unsetProperty');
      }
      if (type === 'lookup') {
        const id = getEntityId(value ?? entity);
        if (typeof value?.value === 'string') return value.value;
        if (id && lookupLabels.value[id]) return lookupLabels.value[id];
      }
    }
    return String(entity);
  };

  const titleFor = (groupBy: IssueGroupBy, entity: IssueGroupEntity) => {
    const user = getGroupUser(groupBy, entity);
    if (user) {
      return (
        [
          user.last_name?.trim(),
          user.first_name?.trim(),
          user.is_active === false ? `(${t('common.states.blocked')})` : '',
        ]
          .filter(Boolean)
          .join(' ') ||
        user.email ||
        ''
      );
    }
    switch (groupBy) {
      case 'labels':
        if (isEmptyGroupEntity(entity)) return t('issues.groups.noLabels');
        break;
      case 'assignees':
        if (isEmptyGroupEntity(entity)) return t('issues.groups.noAssignees');
        break;
      case 'watchers':
        if (isEmptyGroupEntity(entity)) return t('issues.groups.noWatchers');
        break;
      case 'priority': {
        const priority = getEntityId(entity);
        switch (priority) {
          case 'urgent':
          case 'high':
          case 'medium':
          case 'low':
            return t(`issues.groups.priorities.${priority}`);
          default:
            return priority || t('issues.groups.noPriority');
        }
      }
    }
    if (groupBy.startsWith('property:')) return propertyTitle(entity);
    return entity && typeof entity === 'object'
      ? String(entity.name ?? entity.id ?? '')
      : String(entity ?? '');
  };

  return computed<(IssueGroup & IssueGroupHeader)[]>(() => {
    const groupBy = getGroupBy();
    const settings = getSettings();
    const hiddenGroups = settings?.group_tables_hide;
    const board = isBoard();
    return groups.value
      .filter((group) => group.total > 0 || settings?.showEmptyGroups)
      .map((group) => ({
        ...group,
        title: titleFor(groupBy, group.entity),
        color:
          typeof group.entity === 'object' &&
          typeof group.entity?.color === 'string'
            ? group.entity.color
            : undefined,
        user: getGroupUser(groupBy, group.entity),
        expanded: !(
          board
            ? hiddenGroups?.[getSavedBoardGroupKey(group.entity)]
            : (hiddenGroups?.[group.key] ??
              hiddenGroups?.[getSavedGroupKey(group.entity)])
        ),
      }));
  });
};

const parseEntityObject = (
  entity: IssueGroupEntity,
): Record<string, unknown> | undefined => {
  if (entity && typeof entity === 'object') return entity;
  if (typeof entity !== 'string' || !entity.trimStart().startsWith('{')) return;
  try {
    const value: unknown = JSON.parse(entity);
    if (value && typeof value === 'object')
      return value as Record<string, unknown>;
  } catch {}
};
