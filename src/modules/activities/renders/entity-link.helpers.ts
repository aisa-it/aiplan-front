import {
  createExternalLinkPart,
  createTextPart,
} from './activity-message.helpers';
import { getDetailString } from './activity-value.helpers';

import type { ActivityMessagePart } from './activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const createWorkspaceLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const workspace = activity.workspace_detail;
  const href =
    workspace?.url ?? (workspace?.slug ? `/${workspace.slug}` : undefined);

  return createExternalLinkPart(href, `"${workspace?.name ?? ''}"`);
};

export const createProjectLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const project = activity.project_detail;
  const workspaceSlug = activity.workspace_detail?.slug;
  const href =
    (workspaceSlug && project?.identifier
      ? `/${workspaceSlug}/projects/${project.identifier}`
      : undefined) ?? project?.url;

  return createExternalLinkPart(href, `"${project?.name ?? ''}"`);
};

export const createDocLink = (
  activity: DtoActivityEventFull,
  detail: unknown,
  fallback = '',
): ActivityMessagePart => {
  const id = getDetailString(detail, 'id');
  const title = getDetailString(detail, 'title');
  const url = getDetailString(detail, 'url');
  const workspaceSlug = activity.workspace_detail?.slug;
  const href =
    (id && workspaceSlug ? `/${workspaceSlug}/aidoc/${id}` : undefined) ?? url;

  return href && title
    ? createExternalLinkPart(href, `"${title}"`)
    : createTextPart(fallback);
};
