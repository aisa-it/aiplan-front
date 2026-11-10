import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createSprintLink } from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const renderSprintDate = (dateKey: MessageKey): ActivityRenderer => {
  return (activity) =>
    createActivityMessage(
      createTextPart(
        i18n.global.t('sprintActivity.dateChanged', {
          target: i18n.global.t(dateKey),
        }),
      ),
      createSprintLink(activity),
    );
};

export const renderSprintStartDate = renderSprintDate(
  'sprintActivity.dates.start',
);

export const renderSprintEndDate = renderSprintDate(
  'sprintActivity.dates.end',
);
