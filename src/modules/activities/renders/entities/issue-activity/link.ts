import { i18n } from '@/i18n';
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
    createTextPart(
      `${getIssueFieldActionText(activity.verb)} ${i18n.global.t(
        'issueActivity.linkTarget',
      )}`,
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );

export const renderIssueLinkUrl: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('issueActivity.linkUrlChanged', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );

export const renderIssueLinkTitle: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(
      i18n.global.t('issueActivity.linkTitleChanged', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      }),
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
