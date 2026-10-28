import { i18n } from '@/i18n';
import {
  createExternalLinkPart,
  createTextPart,
} from '../../activity-message.helpers';
import {
  createProjectLink,
  createWorkspaceLink,
} from '../../entity-link.helpers';
import { getDetailNumber, getDetailString } from '../../activity-value.helpers';

import type { ActivityRenderContext } from '../../../model/activity.types';
import type { ActivityMessagePart } from '../../activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { MessageKey } from '@/i18n';

export type ProjectRelation = 'at' | 'from' | 'into' | 'of';

// Ключ словаря для 'at' назван inside: PickupPaths из vue-i18n не пропускает имена методов массивов (Array.prototype.at)
const PROJECT_RELATION_KEY: Readonly<Record<ProjectRelation, MessageKey>> = {
  at: 'activities.project.relations.inside',
  from: 'activities.project.relations.from',
  into: 'activities.project.relations.into',
  of: 'activities.project.relations.of',
};

const isCurrentProject = (context: ActivityRenderContext) =>
  context.scope === 'entity' && context.entity.type === 'project';

const isCurrentWorkspace = (context: ActivityRenderContext) =>
  context.scope === 'entity' && context.entity.type === 'workspace';

export const createProjectRelationParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
  relation: ProjectRelation,
): ActivityMessagePart[] =>
  isCurrentProject(context)
    ? []
    : [
        createTextPart(i18n.global.t(PROJECT_RELATION_KEY[relation])),
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
  if (isCurrentWorkspace(context)) {
    return [];
  }

  return [
    // та же строка, что и в контексте workspace-событий — переиспользуем существующий ключ
    createTextPart(i18n.global.t('activities.workspaceRelations.inside')),
    createWorkspaceLink(activity),
  ];
};

export const createWorkspaceContextParts = (
  activity: DtoActivityEventFull,
  context: ActivityRenderContext,
): ActivityMessagePart[] => {
  const workspaceParts = createWorkspaceSourceParts(activity, context);

  return workspaceParts.length ? [createTextPart(' '), ...workspaceParts] : [];
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
  const identifier = activity.new_value || activity.old_value || '';
  const name = getDetailString(detail, 'name') ?? '';
  const sequenceId =
    getDetailNumber(detail, 'sequence_id') ?? identifier.split('-').at(-1);
  const workspaceSlug = activity.workspace_detail?.slug;
  const project = activity.project_detail;
  const projectIdentifier = project?.identifier ?? project?.id;
  const generatedHref =
    workspaceSlug && projectIdentifier && sequenceId
      ? `/${workspaceSlug}/projects/${projectIdentifier}/issues/${sequenceId}`
      : undefined;
  const issueHref =
    getDetailString(detail, 'short_url') ?? getDetailString(detail, 'url');
  const href =
    activity.verb === 'removed' ? issueHref : (generatedHref ?? issueHref);

  return createExternalLinkPart(
    href,
    `${identifier}${name ? ` "${name}"` : ''}`,
  );
};
