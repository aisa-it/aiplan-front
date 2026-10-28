import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueContextParts,
  getChangedValue,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueLabel: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);
  const messageKey = isAdded
    ? 'activities.issue.labelAdded'
    : 'activities.issue.labelRemoved';

  return createActivityMessage(
    createTextPart(
      i18n.global.t(messageKey, { value: getChangedValue(activity) }),
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
};
