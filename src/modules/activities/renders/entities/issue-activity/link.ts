import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueContextParts,
  getIssueFieldActionText,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueLink: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getIssueFieldActionText(activity.verb)} ссылку`),
    ...createIssueContextParts(activity, context, 'in'),
  );

export const renderIssueLinkUrl: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) ссылку с "${activity.old_value ?? ''}" на "${
        activity.new_value ?? ''
      }"`,
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );

export const renderIssueLinkTitle: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      `изменил(-а) название ссылки с "${
        activity.old_value ?? ''
      }" на "${activity.new_value ?? ''}"`,
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
