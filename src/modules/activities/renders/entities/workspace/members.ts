import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityUserName,
  getActivityVerbText,
  getRoleText,
} from '../../activity-value.helpers';
import { createWorkspaceRelationParts } from './workspace-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderMemberAdded: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} `),
    ...createWorkspaceRelationParts(activity, context, 'in'),
    ...(context.placement === 'aggregate' ? [createTextPart(' ')] : []),
    createTextPart(
      `пользователя ${getActivityUserName(
        activity.new_entity_detail,
        activity.new_value,
      )} с ролью "${getRoleText(activity.new_value)}"`,
    ),
  );

export const renderMemberRemoved: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} пользователя ${getActivityUserName(
        activity.old_entity_detail,
        activity.old_value,
      )} `,
    ),
    ...createWorkspaceRelationParts(activity, context, 'from'),
  );

export const renderMemberRole: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} роль пользователя ${getActivityUserName(
        activity.new_entity_detail,
      )} `,
    ),
    ...createWorkspaceRelationParts(activity, context, 'of'),
    createTextPart(
      ` с "${getRoleText(activity.old_value)}" на "${getRoleText(
        activity.new_value,
      )}"`,
    ),
  );
