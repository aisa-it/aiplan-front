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
  urgent: 'issueActivity.priorities.urgent',
  high: 'issueActivity.priorities.high',
  medium: 'issueActivity.priorities.medium',
  low: 'issueActivity.priorities.low',
  null: 'issueActivity.priorities.unset',
  none: 'issueActivity.priorities.unset',
  '<nil>': 'issueActivity.priorities.unset',
};

const renderIssueProperty = (labelKey: MessageKey): ActivityRenderer => {
  return (activity, context) =>
    createActivityMessage(
      createTextPart(
        i18n.global.t('issueActivity.changedField', {
          target: i18n.global.t(labelKey),
        }),
      ),
      ...createIssueContextParts(activity, context, 'in'),
    );
};

export const renderIssueName = renderIssueProperty(
  'issueActivity.fields.name',
);

export const renderIssueDescription = renderIssueProperty(
  'issueActivity.fields.description',
);

export const renderIssueStatus: ActivityRenderer = (activity, context) => {
  const hasStatus = Boolean(
    getDetailString(activity.new_entity_detail, 'name'),
  );
  const status = hasStatus
    ? (activity.new_value ?? '').replace(/([a-z])([A-Z])/g, '$1 $2')
    : i18n.global.t('issueActivity.statusUnset');

  return createActivityMessage(
    createTextPart(i18n.global.t('issueActivity.statusSet', { value: status })),
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
        ? i18n.global.t('issueActivity.prioritySet', { value: priority })
        : i18n.global.t('issueActivity.priorityRemoved'),
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
};
