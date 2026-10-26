import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../../activity-value.helpers';
import { createWorkspaceContextParts } from './workspace-message.helpers';

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
    ...createWorkspaceContextParts(
      activity,
      context,
      relation,
    ),
  );
};
