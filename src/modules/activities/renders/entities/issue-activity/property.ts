import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getDetailString } from '../../activity-value.helpers';
import { createIssueContextParts } from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const PRIORITY_KEY: Readonly<Record<string, MessageKey>> = {
  urgent: 'activities.issue.priorities.urgent',
  high: 'activities.issue.priorities.high',
  medium: 'activities.issue.priorities.medium',
  low: 'activities.issue.priorities.low',
  null: 'activities.issue.priorities.unset',
  none: 'activities.issue.priorities.unset',
  '<nil>': 'activities.issue.priorities.unset',
};

const renderIssueProperty = (labelKey: MessageKey): ActivityRenderer => {
  return (activity, context) =>
    createActivityMessage(
      createTextPart(
        i18n.global.t('activities.issue.changedField', {
          target: i18n.global.t(labelKey),
        }),
      ),
      ...createIssueContextParts(activity, context, 'in'),
    );
};

export const renderIssueName = renderIssueProperty(
  'activities.issue.fields.name',
);

export const renderIssueDescription = renderIssueProperty(
  'activities.issue.fields.description',
);

export const renderIssueStatus: ActivityRenderer = (activity, context) => {
  const hasStatus = Boolean(
    getDetailString(activity.new_entity_detail, 'name'),
  );
  const status = hasStatus
    ? (activity.new_value ?? '').replace(/([a-z])([A-Z])/g, '$1 $2')
    : i18n.global.t('activities.issue.statusUnset');

  return createActivityMessage(
    createTextPart(i18n.global.t('activities.issue.statusSet', { value: status })),
    ...createIssueContextParts(activity, context, 'in'),
  );
};

export const renderIssuePriority: ActivityRenderer = (
  activity,
  context,
) => {
  const isAdded = Boolean(activity.new_value);
  const priorityKey = PRIORITY_KEY[activity.new_value ?? ''];
  const priority = priorityKey
    ? i18n.global.t(priorityKey)
    : (activity.new_value ?? '');

  return createActivityMessage(
    createTextPart(
      isAdded
        ? i18n.global.t('activities.issue.prioritySet', { value: priority })
        : i18n.global.t('activities.issue.priorityRemoved'),
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
};
