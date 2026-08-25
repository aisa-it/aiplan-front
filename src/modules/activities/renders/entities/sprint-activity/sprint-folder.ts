import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createSprintLink } from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderSprintFolder: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart('изменил(-а) папку спринта '),
    createSprintLink(activity),
    createTextPart(
      ` с "${activity.old_value || 'Без папки'}" на "${
        activity.new_value || 'Без папки'
      }"`,
    ),
  );
