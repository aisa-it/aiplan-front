import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityVerbText,
  getDetailString,
} from '../../activity-value.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderTemplateCreated: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.project.templateTarget',
        { value: activity.new_value ?? '' },
      )}`,
    ),
  );

export const renderTemplateDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.project.templateTarget',
        { value: activity.old_value ?? '' },
      )}`,
    ),
  );

export const renderTemplateName: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.templateNameChanged', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
  );

export const renderTemplateContent: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.templateContentChanged', {
        name: getDetailString(activity.new_entity_detail, 'name') ?? '',
      }),
    ),
  );
