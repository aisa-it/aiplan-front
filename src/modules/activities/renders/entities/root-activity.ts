import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../activity-value.helpers';
import { createActivityRenderer } from '../create-activity-renderer';

import type { ActivityRenderer } from '../activity-renderer.types';

const renderWorkspaceCreated: ActivityRenderer = (activity) => {
  const workspace = activity.new_entity_detail;
  const name = activity.new_value || getDetailString(workspace, 'name') || '';

  return createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)}${i18n.global.t(
        'activities.root.space',
      )}`,
    ),
    createExternalLinkPart(
      getDetailString(workspace, 'url'),
      `"${name}"`,
    ),
  );
};

const renderWorkspaceDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)}${i18n.global.t(
        'activities.root.spaceQuoted',
        { name: activity.old_value ?? '' },
      )}`,
    ),
  );

export const renderRootActivity = createActivityRenderer({
  workspace: {
    created: renderWorkspaceCreated,
    deleted: renderWorkspaceDeleted,
  },
});
