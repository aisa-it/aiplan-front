import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityVerbText } from '../../activity-value.helpers';
import {
  createIssueLink,
  createProjectContextParts,
  createWorkspaceContextParts,
} from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueAdded: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} задачу `),
    createIssueLink(activity),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderIssueCreated: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} задачу `),
    activity.new_entity_detail
      ? createIssueLink(activity)
      : createTextPart(activity.new_value ?? ''),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderIssueDeleted: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} задачу ${activity.old_value ?? ''}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderIssueCopied: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} задачу `),
    createIssueLink(activity),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderIssueRemoved: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('удалил(-а) задачу '),
    createIssueLink(activity),
    ...createProjectContextParts(activity, context, 'from'),
  );
