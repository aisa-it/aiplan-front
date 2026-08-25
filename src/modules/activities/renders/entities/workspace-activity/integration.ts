import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityVerbText } from '../../activity-value.helpers';
import { createWorkspaceContextParts } from './workspace-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

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
    ...createWorkspaceContextParts(activity, context, 'in'),
  );

export const renderIntegrationRemoved: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(`удалил(-а) интеграцию ${activity.old_value ?? ''}`),
    ...createWorkspaceContextParts(activity, context, 'from'),
  );
