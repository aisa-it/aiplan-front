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
        i18n.global.t('sprintActivity.changedField', {
          target: i18n.global.t(labelKey),
        }),
      ),
      createSprintLink(activity),
    );
};

export const renderSprintName = renderSprintProperty(
  'sprintActivity.fields.name',
);

export const renderSprintDescription = renderSprintProperty(
  'sprintActivity.fields.description',
);
