import type {
  DtoUserLight,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { IssueListQuery, IssueListResult } from './issue-list.types';

export const ISSUE_GROUP_FIELDS = [
  'state',
  'labels',
  'priority',
  'author',
  'assignees',
  'watchers',
] as const;

export type IssueGroupBy =
  | (typeof ISSUE_GROUP_FIELDS)[number]
  | 'project'
  | `property:${string}`;
export type IssueGroupEntity =
  | string
  | number
  | boolean
  | Record<string, unknown>
  | null;
export type GroupIssueFilters = TypesIssuesListFilters & {
  properties?: Record<string, IssueGroupEntity[]>;
};

export interface IssueGroupResult extends IssueListResult {
  entity: IssueGroupEntity;
}

export interface IssueGroup extends IssueGroupResult {
  key: string;
  page: number;
  loading: boolean;
}

export interface IssueGroupHeader {
  key: string;
  title: string;
  total: number;
  expanded: boolean;
  color?: string;
  user?: DtoUserLight;
}

export interface GroupedIssueSource {
  streamGroups(
    filters: TypesIssuesListFilters,
    query: IssueListQuery,
    groupBy: IssueGroupBy,
    onGroup: (group: IssueGroupResult) => void,
    signal: AbortSignal,
  ): Promise<void>;
  loadGroup(
    filters: TypesIssuesListFilters,
    query: IssueListQuery,
    groupBy: IssueGroupBy,
    entity: IssueGroupEntity,
    signal: AbortSignal,
  ): Promise<IssueListResult>;
}

const LEGACY_GROUP_FIELDS = new Map<string, IssueGroupBy>([
  ['State', 'state'],
  ['Label', 'labels'],
  ['Priority', 'priority'],
  ['Created by', 'author'],
  ['Assignee to', 'assignees'],
  ['Watchers', 'watchers'],
]);

export const normalizeIssueGroupBy = (value?: string): IssueGroupBy | null => {
  if (!value) return null;
  if (value.startsWith('property:') && value.length > 'property:'.length) {
    return value as `property:${string}`;
  }
  if (value === 'project') return value;
  return (
    ISSUE_GROUP_FIELDS.find((field) => field === value) ??
    LEGACY_GROUP_FIELDS.get(value) ??
    null
  );
};

export const getEntityId = (entity: IssueGroupEntity): string | undefined => {
  if (typeof entity === 'string') return entity || undefined;
  if (entity && typeof entity === 'object' && typeof entity.id === 'string') {
    return entity.id || undefined;
  }
};

export const isEmptyGroupEntity = (entity: IssueGroupEntity) =>
  entity === null || entity === '';

export const getIssueGroupKey = (
  groupBy: IssueGroupBy,
  entity: IssueGroupEntity,
) => {
  if (!groupBy.startsWith('property:')) {
    return JSON.stringify([groupBy, getEntityId(entity) ?? null]);
  }
  const value =
    entity && typeof entity === 'object'
      ? Object.fromEntries(
          Object.entries(entity).sort(([a], [b]) => a.localeCompare(b)),
        )
      : isEmptyGroupEntity(entity)
        ? null
        : entity;
  return JSON.stringify([groupBy, value]);
};

export const getSavedGroupKey = (entity: IssueGroupEntity) =>
  getEntityId(entity) ?? String(entity);

export const getGroupUser = (
  groupBy: IssueGroupBy,
  entity: IssueGroupEntity,
) =>
  (groupBy === 'author' || groupBy === 'assignees' || groupBy === 'watchers') &&
  entity &&
  typeof entity === 'object'
    ? (entity as DtoUserLight)
    : undefined;

export const filtersForIssueGroup = (
  base: TypesIssuesListFilters,
  groupBy: IssueGroupBy,
  entity: IssueGroupEntity,
): GroupIssueFilters | null => {
  const id = getEntityId(entity);
  switch (groupBy) {
    case 'state':
      if (!id || (base.states?.length && !base.states.includes(id)))
        return null;
      return { ...base, states: [id] };
    case 'labels':
    case 'assignees':
    case 'watchers':
      return {
        ...base,
        [groupBy]: id ? { array: [id] } : { include_empty: true },
      };
    case 'priority':
      return { ...base, priorities: [id ?? ''] };
    case 'author':
      return id ? { ...base, authors: [id] } : null;
    case 'project':
      return id ? { ...base, projects: [id] } : null;
    default:
      return {
        ...base,
        properties: { [groupBy.slice('property:'.length)]: [entity ?? ''] },
      };
  }
};
