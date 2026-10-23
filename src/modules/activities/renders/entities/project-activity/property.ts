import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityUserName } from '../../activity-value.helpers';
import { createProjectLink } from '../../entity-link.helpers';
import {
  createOptionalProjectLinkParts,
  createProjectRelationParts,
  createWorkspaceContextParts,
} from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const getVisibilityText = (value?: string) => {
  if (value === 'true') return 'Публичный';
  if (value === 'false') return 'Скрытый';

  return value ?? '';
};

export const renderProjectIcon: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('изменил(-а) иконку проекта'),
    ...createOptionalProjectLinkParts(activity, context),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectName: ActivityRenderer = (activity, context) => {
  const projectParts = createProjectRelationParts(activity, context, 'of');

  return createActivityMessage(
    createTextPart(
      `изменил(-а) название проекта с "${activity.old_value ?? ''}" на `,
    ),
    ...(projectParts.length
      ? [createProjectLink(activity)]
      : [createTextPart(`"${activity.new_value ?? ''}"`)]),
    ...createWorkspaceContextParts(activity, context),
  );
};

export const renderProjectIdentifier: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart('изменил(-а) идентификатор проекта'),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` с "${activity.old_value ?? ''}" на "${activity.new_value ?? ''}"`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectPrivacy: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('изменил(-а) приватность проекта'),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` с "${getVisibilityText(activity.old_value)}" на "${getVisibilityText(
        activity.new_value,
      )}"`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectLead: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('изменил(-а) лидера проекта'),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` с ${getActivityUserName(
        activity.old_entity_detail,
        'Пользователь удалён',
      )} на ${getActivityUserName(
        activity.new_entity_detail,
        'Пользователь удалён',
      )}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectRules: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('изменил(-а) сценарий проекта'),
    ...createOptionalProjectLinkParts(activity, context),
    ...createWorkspaceContextParts(activity, context),
  );
