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
      `${getActivityVerbText(activity.verb)} шаблон задачи "${
        activity.new_value ?? ''
      }"`,
    ),
  );

export const renderTemplateDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} шаблон задачи "${
        activity.old_value ?? ''
      }"`,
    ),
  );

export const renderTemplateName: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) название шаблона задачи с "${
        activity.old_value ?? ''
      }" на "${activity.new_value ?? ''}"`,
    ),
  );

export const renderTemplateContent: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) шаблон задачи "${
        getDetailString(activity.new_entity_detail, 'name') ?? ''
      }"`,
    ),
  );
