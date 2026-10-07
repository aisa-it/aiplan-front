import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueContextParts,
  getChangedValue,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueLabel: ActivityRenderer = (activity, context) => {
  const isAdded = Boolean(activity.new_value);

  return createActivityMessage(
    createTextPart(
      `${isAdded ? 'добавил(-а) новый тег' : 'убрал(-а) тег'} "${getChangedValue(
        activity,
      )}"`,
    ),
    ...createIssueContextParts(activity, context, 'in'),
  );
};
