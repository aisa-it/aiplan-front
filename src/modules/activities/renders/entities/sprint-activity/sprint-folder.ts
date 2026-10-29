import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createSprintLink } from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderSprintFolder: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(i18n.global.t('sprintActivity.folderChanged')),
    createSprintLink(activity),
    createTextPart(
      ` ${i18n.global.t('sprintActivity.fromToQuoted', {
        previous:
          activity.old_value || i18n.global.t('sprintActivity.noFolder'),
        next: activity.new_value || i18n.global.t('sprintActivity.noFolder'),
      })}`,
    ),
  );
