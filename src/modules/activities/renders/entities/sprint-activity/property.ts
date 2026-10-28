import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { createSprintLink } from './sprint-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const renderSprintProperty = (labelKey: MessageKey): ActivityRenderer => {
  return (activity) =>
    createActivityMessage(
      createTextPart(
        i18n.global.t('activities.sprint.changedField', {
          target: i18n.global.t(labelKey),
        }),
      ),
      createSprintLink(activity),
    );
};

export const renderSprintName = renderSprintProperty(
  'activities.sprint.fields.name',
);

export const renderSprintDescription = renderSprintProperty(
  'activities.sprint.fields.description',
);
