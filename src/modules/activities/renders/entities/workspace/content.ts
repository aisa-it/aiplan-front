import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../../activity-value.helpers';
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

export const renderWorkspaceForm: ActivityRenderer = (activity) => {
  const detail = activity.new_entity_detail;
  const title = getDetailString(detail, 'title');
  const slug = getDetailString(detail, 'slug');
  const value = activity.new_value || activity.old_value || '';
  const formLink = title
    ? createExternalLinkPart(
        activity.entity_url ?? (slug ? `/f/${slug}` : undefined),
        `"${title}"`,
      )
    : createTextPart(`"${value}"`);

  return createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} форму `),
    formLink,
  );
};
