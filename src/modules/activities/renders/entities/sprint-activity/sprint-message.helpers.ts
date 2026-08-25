import { createExternalLinkPart } from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';

import type { ActivityMessagePart } from '../../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const createSprintLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const sprint = activity.sprint_detail;
  const workspaceSlug = activity.workspace_detail?.slug;
  const href =
    (workspaceSlug && sprint?.id
      ? `/${workspaceSlug}/sprints/${sprint.id}`
      : undefined) ?? sprint?.url;

  return createExternalLinkPart(href, `"${sprint?.name ?? ''}"`);
};

export const createSprintIssueLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const isRemoved = activity.verb === 'removed';
  const detail = isRemoved
    ? activity.old_entity_detail
    : activity.new_entity_detail;
  const key = isRemoved ? activity.old_value : activity.new_value;
  const name = getDetailString(detail, 'name') ?? '';
  const href = getDetailString(detail, 'url');
  const text = key
    ? `${key}${name ? ` "${name}"` : ''}`
    : name
      ? `"${name}"`
      : '';

  return createExternalLinkPart(href, text);
};
