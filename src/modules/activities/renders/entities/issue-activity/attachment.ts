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
      `${getIssueFieldActionText(activity.verb)} вложение "${getChangedValue(
        activity,
      )}"`,
    ),
    ...createIssueContextParts(
      activity,
      context,
      activity.verb === 'deleted' ? 'in' : 'into',
    ),
  );
