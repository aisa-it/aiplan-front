import { i18n } from '@/i18n';
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
      `${getIssueFieldActionText(activity.verb)} ${i18n.global.t(
        'issueActivity.issueTarget',
      )} ${
        activity.old_value
          ? `${activity.project_detail?.identifier ?? ''}-${activity.old_value}`
          : ''
      }`,
    ),
    ...createIssueWorkspaceContextParts(activity, context),
  );

export const renderIssueCreated: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'issueActivity.issueTarget',
      )}`,
    ),
    ...createIssueSubjectContextParts(activity, context),
  );

export const renderIssueMoved: ActivityRenderer = (activity, context) => {
  const project = activity.project_detail;
  const isCurrentTargetProject =
    context.scope === 'entity' &&
    context.entity.type === 'project' &&
    context.entity.identifier === project?.identifier;
  const oldProjectName =
    activity.old_entity_detail?.name ||
    i18n.global.t('issueActivity.hiddenProjectFrom');
  const newProjectName =
    project?.name || i18n.global.t('issueActivity.hiddenProjectTo');

  return createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'issueActivity.issueTarget',
      )} `,
    ),
    createIssueLink(activity),
    createTextPart(
      `${i18n.global.t('issueActivity.movedFrom', {
        previous: oldProjectName,
      })}${
        isCurrentTargetProject
          ? ''
          : i18n.global.t('issueActivity.movedTo', {
              next: newProjectName,
            })
      }`,
    ),
    ...createIssueWorkspaceContextParts(activity, context),
  );
};
