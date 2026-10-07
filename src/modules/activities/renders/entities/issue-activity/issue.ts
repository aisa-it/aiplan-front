import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityVerbText } from '../../activity-value.helpers';
import {
  createIssueLink,
  createIssueSubjectContextParts,
  createIssueWorkspaceContextParts,
  getIssueFieldActionText,
} from './issue-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

export const renderIssueField: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getIssueFieldActionText(activity.verb)} задачу ${
        activity.old_value
          ? `${activity.project_detail?.identifier ?? ''}-${activity.old_value}`
          : ''
      }`,
    ),
    ...createIssueWorkspaceContextParts(activity, context),
  );

export const renderIssueCreated: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} задачу`),
    ...createIssueSubjectContextParts(activity, context),
  );

export const renderIssueMoved: ActivityRenderer = (activity, context) => {
  const project = activity.project_detail;
  const isCurrentTargetProject =
    context.scope === 'entity' &&
    context.entity.type === 'project' &&
    context.entity.identifier === project?.identifier;
  const oldProjectName =
    activity.old_entity_detail?.name || 'из скрытого/удаленного проекта';
  const newProjectName = project?.name || 'в скрытый/удаленный проект';

  return createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} задачу `),
    createIssueLink(activity),
    createTextPart(
      ` из "${oldProjectName}"${
        isCurrentTargetProject ? '' : ` в "${newProjectName}"`
      }`,
    ),
    ...createIssueWorkspaceContextParts(activity, context),
  );
};
