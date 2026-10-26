import dayjs from 'dayjs';

import { formatDateTime } from '@/utils/time';

import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueContextParts,
  createIssueSubjectContextParts,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const formatActivityValueDate = (value?: string) => {
  const normalizedValue = value?.replace(/"/g, '') ?? '';

  return dayjs(normalizedValue).isValid()
    ? formatDateTime(normalizedValue)
    : normalizedValue;
};

export const renderIssueTargetDate: ActivityRenderer = (
  activity,
  context,
) => {
  const oldDate = formatActivityValueDate(activity.old_value);
  const newDate = formatActivityValueDate(activity.new_value);

  if (activity.old_value === '<nil>' || !activity.old_value) {
    return createActivityMessage(
      createTextPart(`установил(-а) срок исполнения ${newDate}`),
      ...createIssueContextParts(activity, context, 'for'),
    );
  }

  if (!activity.new_value && oldDate) {
    return createActivityMessage(
      createTextPart(`убрал(-а) срок исполнения ${oldDate}`),
      ...createIssueContextParts(activity, context, 'from'),
    );
  }

  return createActivityMessage(
    createTextPart(
      `изменил(-а) срок исполнения с ${oldDate} на ${newDate}`,
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
};

export const renderIssueStartDate: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('начал(-а) выполнение задачи'),
    ...createIssueSubjectContextParts(activity, context),
  );

export const renderIssueCompletedAt: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart('завершил(-а) задачу'),
    ...createIssueSubjectContextParts(activity, context),
  );
