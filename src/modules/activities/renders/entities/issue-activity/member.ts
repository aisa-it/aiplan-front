import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityUserName,
  getActivityVerbText,
} from '../../activity-value.helpers';
import { createIssueContextParts } from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const renderIssueMember = (
  targetKey: MessageKey,
  isAdded: boolean,
): ActivityRenderer => {
  return (activity, context) => {
    const detail = isAdded
      ? activity.new_entity_detail
      : activity.old_entity_detail;
    const fallback = isAdded ? activity.new_value : activity.old_value;

    return createActivityMessage(
      createTextPart(
        `${getActivityVerbText(activity.verb)} ${i18n.global.t(
          targetKey,
        )} ${getActivityUserName(detail, fallback)}`,
      ),
      ...createIssueContextParts(
        activity,
        context,
        isAdded ? 'into' : 'from',
      ),
    );
  };
};

export const renderIssueAssigneeAdded = renderIssueMember(
  'activities.issue.members.assignee',
  true,
);

export const renderIssueAssigneeRemoved = renderIssueMember(
  'activities.issue.members.assignee',
  false,
);

export const renderIssueWatcherAdded = renderIssueMember(
  'activities.issue.members.watcher',
  true,
);

export const renderIssueWatcherRemoved = renderIssueMember(
  'activities.issue.members.watcher',
  false,
);
