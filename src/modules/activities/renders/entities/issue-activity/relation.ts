import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueContextParts,
  createIssueLink,
  createIssueWorkspaceContextParts,
  getChangedValue,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const renderIssueRelation = (
  addedTarget: MessageKey,
  removedTarget: MessageKey = addedTarget,
): ActivityRenderer => {
  return (activity, context) => {
    const isAdded = Boolean(activity.new_value);
    const actionKey = isAdded
      ? 'activities.issue.fieldActions.added'
      : 'activities.issue.fieldActions.removed';

    return createActivityMessage(
      createTextPart(
        `${i18n.global.t(actionKey)} ${i18n.global.t(
          isAdded ? addedTarget : removedTarget,
        )} ${getChangedValue(activity)}`,
      ),
      ...createIssueContextParts(activity, context, 'for'),
    );
  };
};

export const renderIssueParent = renderIssueRelation(
  'activities.issue.relationTargets.parentAdded',
  'activities.issue.relationTargets.parentRemoved',
);

export const renderIssueSubIssue = renderIssueRelation(
  'activities.issue.relationTargets.subIssue',
);

export const renderIssueLinked = renderIssueRelation(
  'activities.issue.relationTargets.linked',
);

export const renderIssueBlocking: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);

  return createActivityMessage(
    createTextPart(
      i18n.global.t(
        isAdded
          ? 'activities.issue.blockingSet'
          : 'activities.issue.blockingUnset',
      ),
    ),
    createIssueLink(activity),
    createTextPart(
      i18n.global.t('activities.issue.blocksSuffix', {
        value: getChangedValue(activity),
      }),
    ),
    ...createIssueWorkspaceContextParts(activity, context),
  );
};

export const renderIssueBlocks: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);
  const messageKey = isAdded
    ? 'activities.issue.blockerSet'
    : 'activities.issue.blockerRemoved';

  return createActivityMessage(
    createTextPart(
      i18n.global.t(messageKey, { value: getChangedValue(activity) }),
    ),
    ...createIssueContextParts(activity, context, 'for'),
  );
};
