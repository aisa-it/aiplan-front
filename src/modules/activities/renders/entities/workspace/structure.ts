import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../../activity-value.helpers';
import { createAggregateWorkspaceRelationParts } from './workspace-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderProject: ActivityRenderer = (activity, context) => {
  const detail = activity.new_entity_detail;
  const name = getDetailString(detail, 'name');
  const url = getDetailString(detail, 'url');
  const value = activity.new_value || activity.old_value || '';
  const projectLink = name
    ? createExternalLinkPart(url, `${activity.new_value ?? ''} "${name}"`)
    : createTextPart(`"${value}"`);
  const relation = activity.verb === 'created' ? 'at' : 'from';

  return createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} проект `),
    projectLink,
    ...createAggregateWorkspaceRelationParts(
      activity,
      context,
      relation,
    ),
  );
};

export const renderIntegrationAdded: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} интеграцию ${
        activity.new_value ?? ''
      }`,
    ),
    ...createAggregateWorkspaceRelationParts(activity, context, 'in'),
  );

export const renderIntegrationRemoved: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `удалил(-а) интеграцию ${activity.old_value ?? ''}`,
    ),
    ...createAggregateWorkspaceRelationParts(activity, context, 'from'),
  );

export const renderSprint: ActivityRenderer = (activity) => {
  const detail = activity.new_entity_detail;
  const id = getDetailString(detail, 'id');
  const value = activity.new_value || activity.old_value || '';
  const href =
    id && activity.workspace_detail?.slug
      ? `/${activity.workspace_detail.slug}/sprints/${id}`
      : undefined;
  const sprintLink = detail
    ? createExternalLinkPart(href, `"${activity.new_value ?? ''}"`)
    : createTextPart(value);

  return createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} спринт `),
    sprintLink,
  );
};

export const renderSprintFolder: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} папку спринтов "${
        activity.new_value || activity.old_value || ''
      }"`,
    ),
  );

export const renderSprintFolderName: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) название папки спринтов с "${
        activity.old_value ?? ''
      }" на "${activity.new_value ?? ''}"`,
    ),
  );
