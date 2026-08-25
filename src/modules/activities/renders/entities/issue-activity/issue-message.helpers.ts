import {
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';

import type { ActivityRenderContext } from '../../../model/activity.types';
import type { ActivityMessagePart } from '../../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export type IssueRelation = 'for' | 'from' | 'in' | 'into';

const ISSUE_RELATION_TEXT: Readonly<Record<IssueRelation, string>> = {
  for: 'для задачи ',
  from: 'из задачи ',
  in: 'в задаче ',
  into: 'в задачу ',
};

const isCurrentIssue = (context: ActivityRenderContext) =>
  context.scope === 'entity' && context.entity.type === 'issue';

const isCurrentWorkspace = (context: ActivityRenderContext) =>
  context.scope === 'entity' && context.entity.type === 'workspace';

export const getChangedValue = (activity: DtoActivityEventFull) =>
  activity.new_value || activity.old_value || '';

export const getChangedDetail = (activity: DtoActivityEventFull) =>
  activity.new_value ? activity.new_entity_detail : activity.old_entity_detail;

export const getIssueFieldActionText = (verb?: string) => {
  if (verb === 'created' || verb === 'added') return 'добавил(-а)';
  if (verb === 'deleted' || verb === 'removed') return 'убрал(-а)';
  if (verb === 'updated') return 'обновил(-а)';

  return verb ?? '';
};

export const createIssueLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const issue = activity.issue_detail;
  const projectIdentifier = activity.project_detail?.identifier ?? '';
  const sequenceId = issue?.sequence_id;
  const identifier =
    projectIdentifier && sequenceId
      ? `${projectIdentifier}-${sequenceId}`
      : projectIdentifier || String(sequenceId ?? '');
  const workspaceSlug = activity.workspace_detail?.slug;
  const href =
    (workspaceSlug && projectIdentifier && sequenceId
      ? `/${workspaceSlug}/projects/${projectIdentifier}/issues/${sequenceId}`
      : undefined) ??
    activity.entity_url ??
    issue?.url;

  return createExternalLinkPart(
    href,
    `${identifier}${issue?.name ? ` "${issue.name}"` : ''}`,
  );
};

export const createOptionalIssueLinkParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] =>
  isCurrentIssue(context) ? [] : [createIssueLink(activity)];

export const createIssueRelationParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
  relation: IssueRelation,
): ActivityMessagePart[] =>
  isCurrentIssue(context)
    ? []
    : [
        createTextPart(ISSUE_RELATION_TEXT[relation]),
        createIssueLink(activity),
      ];

export const createIssueWorkspaceContextParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] => {
  if (isCurrentWorkspace(context)) {
    return [];
  }

  const workspace = activity.workspace_detail;
  const href =
    workspace?.url ?? (workspace?.slug ? `/${workspace.slug}` : undefined);

  return [
    createTextPart(' в пространстве '),
    createExternalLinkPart(href, `"${workspace?.name ?? ''}"`),
  ];
};

export const createIssueSubjectContextParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] => {
  const issueParts = createOptionalIssueLinkParts(activity, context);

  return [
    ...(issueParts.length ? [createTextPart(' '), ...issueParts] : []),
    ...createIssueWorkspaceContextParts(activity, context),
  ];
};

export const createIssueContextParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
  relation: IssueRelation,
): ActivityMessagePart[] => {
  const issueParts = createIssueRelationParts(activity, context, relation);

  return [
    ...(issueParts.length ? [createTextPart(' '), ...issueParts] : []),
    ...createIssueWorkspaceContextParts(activity, context),
  ];
};
