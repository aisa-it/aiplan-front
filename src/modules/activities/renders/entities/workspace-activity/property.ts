import { i18n } from '@/i18n';
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
import type { MessageKey } from '@/i18n';

export const renderWorkspaceProperty = (
  labelKey: MessageKey,
): ActivityRenderer => {
  return (activity, context) =>
    createActivityMessage(
      createTextPart(
        `${getActivityVerbText(activity.verb)} ${i18n.global.t(
          labelKey,
        )} `,
      ),
      ...createWorkspaceRelationParts(activity, context, 'of'),
    );
};

export const renderWorkspaceName: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'workspaceActivity.nameChanged',
        {
          previous: activity.old_value ?? '',
          next: activity.new_value ?? '',
        },
      )}`,
    ),
  );

export const renderWorkspaceOwner: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'workspaceActivity.ownerTarget',
      )} `,
    ),
    ...createWorkspaceRelationParts(activity, context, 'of'),
    createTextPart(
      ` ${i18n.global.t('workspaceActivity.fromToPlain', {
        previous: getActivityUserName(
          activity.old_entity_detail,
          activity.old_value,
        ),
        next: getActivityUserName(
          activity.new_entity_detail,
          activity.new_value,
        ),
      })}`,
    ),
  );
