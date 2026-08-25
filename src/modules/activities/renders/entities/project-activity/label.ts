import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';
import { createProjectContextParts } from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderLabelCreated: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`добавил(-а) тег "${activity.new_value ?? ''}"`),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderLabelDeleted: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`убрал(-а) тег "${activity.old_value ?? ''}"`),
    ...createProjectContextParts(activity, context, 'from'),
  );

export const renderLabelName: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) название тега с "${activity.old_value ?? ''}" на "${
        activity.new_value ?? ''
      }"`,
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderLabelColor: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) цвет тега "${
        getDetailString(activity.new_entity_detail, 'name') ?? ''
      }" с "${activity.old_value ?? ''}" на "${activity.new_value ?? ''}"`,
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );
