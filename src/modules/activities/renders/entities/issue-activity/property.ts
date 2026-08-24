import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';
import { createIssueContextParts } from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const PRIORITY_TEXT: Readonly<Record<string, string>> = {
  urgent: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  null: 'Не выбран',
  none: 'Не выбран',
  '<nil>': 'Не выбран',
};

const renderIssueProperty = (target: string): ActivityRenderer => {
  return (activity, context) =>
    createActivityMessage(
      createTextPart(`изменил(-а) ${target}`),
      ...createIssueContextParts(activity, context, 'in'),
    );
};

export const renderIssueName = renderIssueProperty('название');

export const renderIssueDescription = renderIssueProperty('описание');

export const renderIssueStatus: ActivityRenderer = (activity, context) => {
  const hasStatus = Boolean(
    getDetailString(activity.new_entity_detail, 'name'),
  );
  const status = hasStatus
    ? (activity.new_value ?? '').replace(/([a-z])([A-Z])/g, '$1 $2')
    : 'Не выбрано';

  return createActivityMessage(
    createTextPart(`поменял(-а) статус на "${status}"`),
    ...createIssueContextParts(activity, context, 'in'),
  );
};

export const renderIssuePriority: ActivityRenderer = (
  activity,
  context,
) => {
  const isAdded = Boolean(activity.new_value);
  const priority =
    PRIORITY_TEXT[activity.new_value ?? ''] ?? activity.new_value ?? '';

  return createActivityMessage(
    createTextPart(
      isAdded
        ? `установил(-а) приоритет "${priority}"`
        : 'убрал(-а) приоритет',
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
};
