import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueContextParts,
  getIssueFieldActionText,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueComment: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getIssueFieldActionText(activity.verb)} комментарий`),
    ...createIssueContextParts(activity, context, 'in'),
  );
