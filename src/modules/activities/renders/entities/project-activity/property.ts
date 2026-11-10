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
    return i18n.global.t('projectActivity.visibility.public');
  }
  if (value === 'false') {
    return i18n.global.t('projectActivity.visibility.private');
  }

  return value ?? '';
};

export const renderProjectIcon: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('projectActivity.iconChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectName: ActivityRenderer = (activity, context) => {
  const projectParts = createProjectRelationParts(activity, context, 'of');

  return createActivityMessage(
    createTextPart(
      i18n.global.t('projectActivity.nameChangedFrom', {
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
    createTextPart(i18n.global.t('projectActivity.identifierChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` ${i18n.global.t('projectActivity.fromToQuoted', {
        previous: activity.old_value ?? '',
        next: activity.new_value ?? '',
      })}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectPrivacy: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('projectActivity.privacyChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` ${i18n.global.t('projectActivity.fromToQuoted', {
        previous: getVisibilityText(activity.old_value),
        next: getVisibilityText(activity.new_value),
      })}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectLead: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('projectActivity.leadChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    createTextPart(
      ` ${i18n.global.t('projectActivity.fromToPlain', {
        previous: getActivityUserName(
          activity.old_entity_detail,
          i18n.global.t('projectActivity.userDeleted'),
        ),
        next: getActivityUserName(
          activity.new_entity_detail,
          i18n.global.t('projectActivity.userDeleted'),
        ),
      })}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );

export const renderProjectRules: ActivityRenderer = (activity, context) =>
  createActivityMessage(
    createTextPart(i18n.global.t('projectActivity.rulesChanged')),
    ...createOptionalProjectLinkParts(activity, context),
    ...createWorkspaceContextParts(activity, context),
  );
