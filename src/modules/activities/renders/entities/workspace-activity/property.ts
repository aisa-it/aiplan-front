import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityUserName,
  getActivityVerbText,
} from '../../activity-value.helpers';
import { createWorkspaceRelationParts } from './workspace-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderWorkspaceProperty = (
  target: string,
): ActivityRenderer => {
  return (activity, context) =>
    createActivityMessage(
      createTextPart(`${getActivityVerbText(activity.verb)} ${target} `),
      ...createWorkspaceRelationParts(activity, context, 'of'),
    );
};

export const renderWorkspaceName: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} имя пространства с "${
        activity.old_value ?? ''
      }" на "${activity.new_value ?? ''}"`,
    ),
  );

export const renderWorkspaceOwner: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} лидера `),
    ...createWorkspaceRelationParts(activity, context, 'of'),
    createTextPart(
      ` с ${getActivityUserName(
        activity.old_entity_detail,
        activity.old_value,
      )} на ${getActivityUserName(
        activity.new_entity_detail,
        activity.new_value,
      )}`,
    ),
  );
