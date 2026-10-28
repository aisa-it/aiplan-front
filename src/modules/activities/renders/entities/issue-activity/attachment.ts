import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueContextParts,
  getChangedValue,
  getIssueFieldActionText,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueAttachment: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `${getIssueFieldActionText(activity.verb)} ${i18n.global.t(
        'activities.issue.attachment',
        { value: getChangedValue(activity) },
      )}`,
    ),
    ...createIssueContextParts(
      activity,
      context,
      activity.verb === 'deleted' ? 'in' : 'into',
    ),
  );
