import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../../activity-value.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderSprint: ActivityRenderer = (activity) => {
  const detail = activity.new_entity_detail;
  const id = getDetailString(detail, 'id');
  const value = activity.new_value || activity.old_value || '';
  const href =
    id && activity.workspace_detail?.slug
      ? `/${activity.workspace_detail.slug}/sprints/${id}`
      : undefined;
  const sprintLink = detail
    ? createExternalLinkPart(href, `"${activity.new_value ?? ''}"`)
    : createTextPart(value);

  return createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.workspace.sprintTarget',
      )}`,
    ),
    sprintLink,
  );
};

export const renderSprintFolder: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.workspace.sprintFolderTarget',
        { value: activity.new_value || activity.old_value || '' },
      )}`,
    ),
  );

export const renderSprintFolderName: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.workspace.sprintFolderNameChanged', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
  );
