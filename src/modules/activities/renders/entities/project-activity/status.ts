import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';
import { createProjectContextParts } from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const STATUS_GROUP_TEXT: Readonly<Record<string, string>> = {
  backlog: 'Открыто',
  unstarted: 'Не начато',
  started: 'Начато',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const getStatusGroupText = (value?: string) =>
  (value && STATUS_GROUP_TEXT[value.toLowerCase()]) ?? value ?? '';

const renderStatusProperty = (
  target: string,
  formatValue: (value?: string) => string = (value) => value ?? '',
): ActivityRenderer => {
  return (activity, context) =>
    createActivityMessage(
      createTextPart(`изменил(-а) ${target}`),
      createTextPart(
        ` с "${formatValue(activity.old_value)}" на "${formatValue(
          activity.new_value,
        )}"`,
      ),
      ...createProjectContextParts(activity, context, 'at'),
    );
};

export const renderStatusCreated: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`добавил(-а) статус "${activity.new_value ?? ''}"`),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderStatusDeleted: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`убрал(-а) статус "${activity.old_value ?? ''}"`),
    ...createProjectContextParts(activity, context, 'from'),
  );

export const renderDefaultStatus: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `поменял(-а) статус по умолчанию с "${
        activity.old_value ?? ''
      }" на "${activity.new_value ?? ''}"`,
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusName: ActivityRenderer = renderStatusProperty(
  'название статуса',
);

export const renderStatusDescription: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) описание статуса "${
        getDetailString(activity.new_entity_detail, 'name') ?? ''
      }" с "${activity.old_value || 'Без описания'}" на "${
        activity.new_value || 'Без описания'
      }"`,
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusGroup: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) группу статуса "${
        getDetailString(activity.new_entity_detail, 'name') ?? ''
      }" с "${getStatusGroupText(
        activity.old_value,
      )}" на "${getStatusGroupText(activity.new_value)}"`,
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusColor: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) цвет статуса "${
        getDetailString(activity.new_entity_detail, 'name') ?? ''
      }" с "${activity.old_value ?? ''}" на "${activity.new_value ?? ''}"`,
    ),
    ...createProjectContextParts(activity, context, 'at'),
  );

export const renderStatusDefault = renderStatusProperty(
  'статус по умолчанию',
);
