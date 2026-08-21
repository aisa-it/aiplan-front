import {
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getDetailNumber,
  getDetailString,
} from '../../activity-value.helpers';

import type { ActivityRenderContext } from '../../../model/activity.types';
import type { ActivityMessagePart } from '../../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export type ProjectRelation = 'at' | 'from' | 'into' | 'of';

const PROJECT_RELATION_TEXT: Readonly<Record<ProjectRelation, string>> = {
  at: 'в проекте ',
  from: 'из проекта ',
  into: 'в проект ',
  of: 'проекта ',
};

const isCurrentProject = (context: ActivityRenderContext) =>
  context.currentEntity?.type === 'project' ||
  (context.placement === 'entity' && !context.currentEntity);

const isCurrentWorkspace = (context: ActivityRenderContext) =>
  context.currentEntity?.type === 'workspace';

export const createProjectLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const project = activity.project_detail;
  const workspaceSlug = activity.workspace_detail?.slug;
  const href =
    project?.url ??
    (workspaceSlug && project?.id
      ? `/${workspaceSlug}/projects/${project.id}`
      : undefined);

  return createExternalLinkPart(href, `"${project?.name ?? ''}"`);
};

export const createProjectRelationParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
  relation: ProjectRelation,
): ActivityMessagePart[] =>
  isCurrentProject(context)
    ? []
    : [
        createTextPart(PROJECT_RELATION_TEXT[relation]),
        createProjectLink(activity),
      ];

export const createOptionalProjectLinkParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] =>
  isCurrentProject(context)
    ? []
    : [createTextPart(' '), createProjectLink(activity)];

export const createWorkspaceSourceParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] => {
  if (context.placement !== 'aggregate' || isCurrentWorkspace(context)) {
    return [];
  }

  const workspace = activity.workspace_detail;
  const href =
    workspace?.url ?? (workspace?.slug ? `/${workspace.slug}` : undefined);

  return [
    createTextPart('в пространстве '),
    createExternalLinkPart(href, `"${workspace?.name ?? ''}"`),
  ];
};

export const createWorkspaceContextParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] => {
  const workspaceParts = createWorkspaceSourceParts(activity, context);

  return workspaceParts.length
    ? [createTextPart(' '), ...workspaceParts]
    : [];
};

export const createProjectContextParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
  relation: ProjectRelation,
): ActivityMessagePart[] => {
  const projectParts = createProjectRelationParts(activity, context, relation);

  return [
    ...(projectParts.length ? [createTextPart(' '), ...projectParts] : []),
    ...createWorkspaceContextParts(activity, context),
  ];
};

export const createIssueLink = (
  activity: DtoActivityEventFull,
): ActivityMessagePart => {
  const detail = activity.new_entity_detail ?? activity.old_entity_detail;
  const identifier = activity.new_value ?? activity.old_value ?? '';
  const name = getDetailString(detail, 'name') ?? '';
  const sequenceId =
    getDetailNumber(detail, 'sequence_id') ?? identifier.split('-').at(-1);
  const workspaceSlug = activity.workspace_detail?.slug;
  const project = activity.project_detail;
  const projectIdentifier = project?.identifier ?? project?.id;
  const href =
    workspaceSlug && projectIdentifier && sequenceId
      ? `/${workspaceSlug}/projects/${projectIdentifier}/issues/${sequenceId}`
      : getDetailString(detail, 'url');

  return createExternalLinkPart(
    href,
    `${identifier}${name ? ` "${name}"` : ''}`,
  );
};
