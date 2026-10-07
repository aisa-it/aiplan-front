import {
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';

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

const createWorkspaceLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const workspace = activity.workspace_detail;
  const href =
    workspace?.url ?? (workspace?.slug ? `/${workspace.slug}` : undefined);

  return createExternalLinkPart(href, `"${workspace?.name ?? ''}"`);
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

export const createDocLink = (
  activity: DtoActivityEventFull,
  detail: unknown,
  fallback = '',
) => {
  const id = getDetailString(detail, 'id');
  const title = getDetailString(detail, 'title');
  const workspaceSlug = activity.workspace_detail?.slug;

  return id && title && workspaceSlug
    ? createExternalLinkPart(
        `/${workspaceSlug}/aidoc/${id}`,
        `"${title}"`,
      )
    : createTextPart(fallback);
};
