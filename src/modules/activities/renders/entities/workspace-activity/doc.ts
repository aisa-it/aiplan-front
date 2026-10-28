import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityVerbText } from '../../activity-value.helpers';
import { createDocLink } from '../../entity-link.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderDocCreated: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.workspace.docTarget',
      )}`,
    ),
    createDocLink(
      activity,
      activity.new_entity_detail,
      activity.new_value,
    ),
  );

export const renderDocDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.workspace.docTarget',
      )}${activity.old_value ?? ''}`,
    ),
  );

export const renderChildDocAdded: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.workspace.childDocTarget',
      )}`,
    ),
    createDocLink(
      activity,
      activity.new_entity_detail,
      `"${activity.new_value ?? ''}"`,
    ),
    createTextPart(i18n.global.t('activities.workspace.toRootFolder')),
  );

export const renderChildDocRemoved: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.workspace.childDocTarget',
      )}`,
    ),
    createDocLink(
      activity,
      activity.old_entity_detail,
      `"${activity.old_value ?? ''}"`,
    ),
    createTextPart(i18n.global.t('activities.workspace.fromRootFolder')),
  );

export const renderDocSort: ActivityRenderer = () =>
  createActivityMessage(
    createTextPart(i18n.global.t('activities.workspace.sortedRootDocs')),
  );
