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
      ? 'issueActivity.fieldActions.added'
      : 'issueActivity.fieldActions.removed';

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
  'issueActivity.relationTargets.parentAdded',
  'issueActivity.relationTargets.parentRemoved',
);

export const renderIssueSubIssue = renderIssueRelation(
  'issueActivity.relationTargets.subIssue',
);

export const renderIssueLinked = renderIssueRelation(
  'issueActivity.relationTargets.linked',
);

export const renderIssueBlocking: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);

  return createActivityMessage(
    createTextPart(
      i18n.global.t(
        isAdded
          ? 'issueActivity.blockingSet'
          : 'issueActivity.blockingUnset',
      ),
    ),
    createIssueLink(activity),
    createTextPart(
      i18n.global.t('issueActivity.blocksSuffix', {
        value: getChangedValue(activity),
      }),
    ),
    ...createIssueWorkspaceContextParts(activity, context),
  );
};

export const renderIssueBlocks: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);
  const messageKey = isAdded
    ? 'issueActivity.blockerSet'
    : 'issueActivity.blockerRemoved';

  return createActivityMessage(
    createTextPart(
      i18n.global.t(messageKey, { value: getChangedValue(activity) }),
    ),
    ...createIssueContextParts(activity, context, 'for'),
  );
};
