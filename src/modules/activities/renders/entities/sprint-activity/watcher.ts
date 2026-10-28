import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityUserName,
  getActivityVerbText,
} from '../../activity-value.helpers';
import { createSprintLink } from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const renderSprintWatcher = (isAdded: boolean): ActivityRenderer => {
  return (activity) => {
    const detail = isAdded
      ? activity.new_entity_detail
      : activity.old_entity_detail;

    return createActivityMessage(
      createTextPart(
        `${getActivityVerbText(activity.verb)} ${i18n.global.t(
          'activities.sprint.watcherTarget',
        )} ${getActivityUserName(
          detail,
          isAdded ? activity.new_value : activity.old_value,
        )} ${i18n.global.t(
          isAdded
            ? 'activities.sprint.relations.to'
            : 'activities.sprint.relations.from',
        )}`,
      ),
      createSprintLink(activity),
    );
  };
};

export const renderSprintWatcherAdded = renderSprintWatcher(true);

export const renderSprintWatcherRemoved = renderSprintWatcher(false);
