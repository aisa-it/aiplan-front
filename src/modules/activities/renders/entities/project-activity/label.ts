import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';
import { createProjectContextParts } from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderLabelCreated: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.labelAdded', {
        value: activity.new_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderLabelDeleted: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.labelRemoved', {
        value: activity.old_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'from'),
  );

export const renderLabelName: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.labelNameChanged', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderLabelColor: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.labelColorChanged', {
        name: getDetailString(activity.new_entity_detail, 'name') ?? '',
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );
