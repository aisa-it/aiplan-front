import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityVerbText } from '../../activity-value.helpers';
import { createDocLink } from './workspace-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderDocCreated: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} документ `),
    createDocLink(
      activity,
      activity.new_entity_detail,
      activity.new_value,
    ),
  );

export const renderDocDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} документ ${
        activity.old_value ?? ''
      }`,
    ),
  );

export const renderChildDocAdded: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} дочерний документ `,
    ),
    createDocLink(
      activity,
      activity.new_entity_detail,
      `"${activity.new_value ?? ''}"`,
    ),
    createTextPart(' в корневую папку'),
  );

export const renderChildDocRemoved: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} дочерний документ `,
    ),
    createDocLink(
      activity,
      activity.old_entity_detail,
      `"${activity.old_value ?? ''}"`,
    ),
    createTextPart(' из корневой папки'),
  );

export const renderDocSort: ActivityRenderer = () =>
  createActivityMessage(
    createTextPart('отсортировал(-а) список корневых документов'),
  );
