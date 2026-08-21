import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createIssueLink,
  createProjectContextParts,
} from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueAdded: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('добавил(-а) задачу '),
    createIssueLink(activity),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderIssueCreated: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart('создал(-а) задачу '),
    activity.new_entity_detail
      ? createIssueLink(activity)
      : createTextPart(activity.new_value ?? ''),
  );

export const renderIssueDeleted: ActivityRenderer = (activity) =>
  createActivityMessage(
    createTextPart(`удалил(-а) задачу ${activity.old_value ?? ''}`),
  );

export const renderIssueCopied: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('скопировал(-а) задачу '),
    createIssueLink(activity),
    ...createProjectContextParts(activity, context, 'into'),
  );

export const renderIssueRemoved: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart('удалил(-а) задачу '),
    createIssueLink(activity),
    ...createProjectContextParts(activity, context, 'from'),
  );
