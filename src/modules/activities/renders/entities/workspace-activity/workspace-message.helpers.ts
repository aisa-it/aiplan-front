import { i18n } from '@/i18n';
import { createTextPart } from '../../activity-message.helpers';
import { createWorkspaceLink } from '../../entity-link.helpers';

import type { ActivityRenderContext } from '../../../model/activity.types';
import type { ActivityMessagePart } from '../../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { MessageKey } from '@/i18n';

export type WorkspaceRelation = 'at' | 'from' | 'in' | 'of';

// Ключ словаря для 'at' назван inside: PickupPaths из vue-i18n не пропускает имена методов массивов (Array.prototype.at)
const WORKSPACE_RELATION_KEY: Readonly<Record<WorkspaceRelation, MessageKey>> = {
  at: 'activities.workspaceRelations.inside',
  from: 'activities.workspaceRelations.from',
  in: 'activities.workspaceRelations.in',
  of: 'activities.workspaceRelations.of',
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
      createTextPart(i18n.global.t(WORKSPACE_RELATION_KEY[relation])),
      createWorkspaceLink(activity),
    ];
  }

  if (relation === 'from') {
    return [createTextPart(i18n.global.t('activities.workspaceRelationsShort.from'))];
  }
  if (relation === 'of') {
    return [createTextPart(i18n.global.t('activities.workspaceRelationsShort.of'))];
  }

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
