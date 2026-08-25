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

export const ACTIVITY_VERBS = [
  'updated',
  'removed',
  'added',
  'deleted',
  'created',
  'move',
  'copied',
  'move_doc_to_workspace',
  'move_doc_to_doc',
  'move_workspace_to_doc',
] as const;

export type ActivityVerb = (typeof ACTIVITY_VERBS)[number];

export const isActivityVerb = (value?: string): value is ActivityVerb =>
  ACTIVITY_VERBS.includes(value as ActivityVerb);

export type ActivityRenderScope = 'overview' | 'entity';

export type ActivityEntityReference =
  | {
      type: 'project';
      identifier: string;
    }
  | {
      type: Exclude<ActivityEntityType, 'project'>;
    };

export type ActivityRenderContext =
  | {
      scope: 'overview';
    }
  | {
      scope: 'entity';
      entity: ActivityEntityReference;
    };

export interface ActivitiesListRequest {
  page: number;
  rowsPerPage: number;
}
