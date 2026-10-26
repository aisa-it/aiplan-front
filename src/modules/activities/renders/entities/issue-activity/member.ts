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

const renderIssueMember = (
  target: 'исполнителя' | 'наблюдателя',
  isAdded: boolean,
): ActivityRenderer => {
  return (activity, context) => {
    const detail = isAdded
      ? activity.new_entity_detail
      : activity.old_entity_detail;
    const fallback = isAdded ? activity.new_value : activity.old_value;

    return createActivityMessage(
      createTextPart(
        `${getActivityVerbText(activity.verb)} ${target} ${getActivityUserName(
          detail,
          fallback,
        )}`,
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
  'исполнителя',
  true,
);

export const renderIssueAssigneeRemoved = renderIssueMember(
  'исполнителя',
  false,
);

export const renderIssueWatcherAdded = renderIssueMember(
  'наблюдателя',
  true,
);

export const renderIssueWatcherRemoved = renderIssueMember(
  'наблюдателя',
  false,
);
