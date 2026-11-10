import { i18n } from '@/i18n';
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

export const renderMemberAdded: ActivityRenderer = (activity, context) => {
  const workspaceParts = createWorkspaceRelationParts(
    activity,
    context,
    'in',
  );

  return createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} `),
    ...workspaceParts,
    ...(workspaceParts.length ? [createTextPart(' ')] : []),
    createTextPart(
      i18n.global.t('workspaceActivity.memberWithRole', {
        name: getActivityUserName(
          activity.new_entity_detail,
          activity.new_value,
        ),
        role: getRoleText(activity.new_value),
      }),
    ),
  );
};

export const renderMemberRemoved: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'workspaceActivity.member',
        {
          name: getActivityUserName(
            activity.old_entity_detail,
            activity.old_value,
          ),
        },
      )} `,
    ),
    ...createWorkspaceRelationParts(activity, context, 'from'),
  );

export const renderMemberRole: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'workspaceActivity.roleTarget',
        { name: getActivityUserName(activity.new_entity_detail) },
      )} `,
    ),
    ...createWorkspaceRelationParts(activity, context, 'of'),
    createTextPart(
      ` ${i18n.global.t('workspaceActivity.fromToQuoted', {
        previous: getRoleText(activity.old_value),
        next: getRoleText(activity.new_value),
      })}`,
    ),
  );
