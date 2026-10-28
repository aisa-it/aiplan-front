import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import { getActivityUserName } from '../../activity-value.helpers';
import { createProjectLink } from '../../entity-link.helpers';
import {
  createOptionalProjectLinkParts,
  createProjectRelationParts,
  createWorkspaceContextParts,
} from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';

const getVisibilityText = (value?: string) => {
  if (value === 'true') {
    return i18n.global.t('activities.project.visibility.public');
  }
  if (value === 'false') {
    return i18n.global.t('activities.project.visibility.private');
  }

  return value ?? '';
};

export const renderProjectIcon: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('activities.project.iconChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectName: ActivityRenderer = (activity, context) => {
  const projectParts = createProjectRelationParts(activity, context, 'of');

  return createActivityMessage(
    createTextPart(
      i18n.global.t('activities.project.nameChangedFrom', {
        previous: activity.old_value ?? '',
      }),
    ),
    ...(projectParts.length
      ? [createProjectLink(activity)]
      : [createTextPart(`"${activity.new_value ?? ''}"`)]),
    ...createWorkspaceContextParts(activity, context),
  );
};

export const renderProjectIdentifier: ActivityRenderer = (
  activity,
  context,
) =>
  createActivityMessage(
    createTextPart(i18n.global.t('activities.project.identifierChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` ${i18n.global.t('activities.project.fromToQuoted', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      })}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectPrivacy: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('activities.project.privacyChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` ${i18n.global.t('activities.project.fromToQuoted', {
        previous: getVisibilityText(activity.old_value),
        next: getVisibilityText(activity.new_value),
      })}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectLead: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('activities.project.leadChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` ${i18n.global.t('activities.project.fromToPlain', {
        previous: getActivityUserName(
          activity.old_entity_detail,
          i18n.global.t('activities.project.userDeleted'),
        ),
        next: getActivityUserName(
          activity.new_entity_detail,
          i18n.global.t('activities.project.userDeleted'),
        ),
      })}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectRules: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('activities.project.rulesChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    ...createWorkspaceContextParts(activity, context),
  );
