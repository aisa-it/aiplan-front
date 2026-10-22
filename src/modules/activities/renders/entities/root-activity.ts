import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../activity-message.helpers';
import { getActivityVerbText } from '../activity-value.helpers';
import { createActivityRenderer } from '../create-activity-renderer';

import type { ActivityRenderer } from '../activity-renderer.types';

const renderWorkspaceCreated: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} пространство `),
    createExternalLinkPart(
      activity.new_entity_detail.url,
      `"${activity.new_value ?? ''}"`,
    ),
  );

const renderWorkspaceDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} пространство "${
        activity.old_value ?? ''
      }"`,
    ),
  );

export const renderRootActivity = createActivityRenderer({
  workspace: {
    created: renderWorkspaceCreated,
    deleted: renderWorkspaceDeleted,
  },
});
