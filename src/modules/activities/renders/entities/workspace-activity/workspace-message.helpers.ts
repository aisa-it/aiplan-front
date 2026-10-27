import { createTextPart } from '../../activity-message.helpers';
import { createWorkspaceLink } from '../../entity-link.helpers';

import type { ActivityRenderContext } from '../../../model/activity.types';
import type { ActivityMessagePart } from '../../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export type WorkspaceRelation = 'at' | 'from' | 'in' | 'of';

const WORKSPACE_RELATION_TEXT: Readonly<Record<WorkspaceRelation, string>> = {
  at: 'в пространстве ',
  from: 'из пространства ',
  in: 'в пространство ',
  of: 'пространства ',
};

export const createWorkspaceRelationParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
  relation: WorkspaceRelation,
): ActivityMessagePart[] => {
  const isCurrentWorkspace =
    context.scope === 'entity' && context.entity.type === 'workspace';

  if (!isCurrentWorkspace) {
    return [
      createTextPart(WORKSPACE_RELATION_TEXT[relation]),
      createWorkspaceLink(activity),
    ];
  }

  if (relation === 'from') return [createTextPart('из пространства')];
  if (relation === 'of') return [createTextPart('пространства')];

  return [];
};

export const createWorkspaceContextParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
  relation: WorkspaceRelation,
): ActivityMessagePart[] => {
  if (context.scope === 'entity' && context.entity.type === 'workspace') {
    return [];
  }

  const workspaceParts = createWorkspaceRelationParts(
    activity,
    context,
    relation,
  );

  return workspaceParts.length
    ? [createTextPart(' '), ...workspaceParts]
    : [];
};
