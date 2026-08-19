export const ACTIVITY_ENTITY_TYPES = [
  'root',
  'workspace',
  'project',
  'issue',
  'sprint',
  'doc',
  'form',
] as const;

export type ActivityEntityType = (typeof ACTIVITY_ENTITY_TYPES)[number];

export const isActivityEntityType = (
  value?: string,
): value is ActivityEntityType =>
  ACTIVITY_ENTITY_TYPES.includes(value as ActivityEntityType);

export type ActivityPlacement = 'entity' | 'aggregate';

export interface ActivityEntityReference {
  type: ActivityEntityType;
  id?: string;
}

export interface ActivityRenderContext {
  placement: ActivityPlacement;
  currentEntity?: ActivityEntityReference;
}

export interface ActivitiesListRequest {
  page: number;
  rowsPerPage: number;
}
