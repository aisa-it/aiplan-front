import dayjs from 'dayjs';

import { i18n } from '@/i18n';
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
      createTextPart(
        i18n.global.t('issueActivity.dueDateSet', { value: newDate }),
      ),
      ...createIssueContextParts(activity, context, 'for'),
    );
  }

  if (!activity.new_value && oldDate) {
    return createActivityMessage(
      createTextPart(
        i18n.global.t('issueActivity.dueDateRemoved', { value: oldDate }),
      ),
      ...createIssueContextParts(activity, context, 'from'),
    );
  }

  return createActivityMessage(
    createTextPart(
      i18n.global.t('issueActivity.dueDateChanged', {
        previous: oldDate,
        next: newDate,
      }),
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
};

export const renderIssueStartDate: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('issueActivity.started')),
    ...createIssueSubjectContextParts(activity, context),
  );

export const renderIssueCompletedAt: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(i18n.global.t('issueActivity.completed')),
    ...createIssueSubjectContextParts(activity, context),
  );
