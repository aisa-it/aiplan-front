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

const renderIssueRelation = (
  addedTarget: 'родительскую задачу' | 'подзадачу' | 'связанную задачу',
  removedTarget: string = addedTarget,
): ActivityRenderer => {
  return (activity, context) => {
    const isAdded = Boolean(activity.new_value);

    return createActivityMessage(
      createTextPart(
        `${isAdded ? 'добавил(-а)' : 'убрал(-а)'} ${
          isAdded ? addedTarget : removedTarget
        } ${getChangedValue(activity)}`,
      ),
      ...createIssueContextParts(activity, context, 'for'),
    );
  };
};

export const renderIssueParent = renderIssueRelation(
  'родительскую задачу',
  'родителя',
);

export const renderIssueSubIssue = renderIssueRelation('подзадачу');

export const renderIssueLinked = renderIssueRelation('связанную задачу');

export const renderIssueBlocking: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);

  return createActivityMessage(
    createTextPart(
      `${isAdded ? 'установил(-а)' : 'убрал(-а)'}, что задача `,
    ),
    createIssueLink(activity),
    createTextPart(` блокирует ${getChangedValue(activity)}`),
    ...createIssueWorkspaceContextParts(activity, context),
  );
};

export const renderIssueBlocks: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);

  return createActivityMessage(
    createTextPart(
      `${isAdded ? 'установил(-а)' : 'убрал(-а)'} блокировщик ${getChangedValue(
        activity,
      )}`,
    ),
    ...createIssueContextParts(activity, context, 'for'),
  );
};
