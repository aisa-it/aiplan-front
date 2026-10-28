import { i18n } from '@/i18n';
import {
  createActivityMessage,
  createTextPart,
} from '../../activity-message.helpers';
import {
  getActivityUserName,
  getActivityVerbText,
  getRoleText,
} from '../../activity-value.helpers';
import {
  createProjectRelationParts,
  createWorkspaceContextParts,
  createWorkspaceSourceParts,
} from './project-message.helpers';

import type { ActivityRenderer } from '../../activity-renderer.types';
import type { MessageKey } from '@/i18n';

const renderDefaultMember = (
  targetKey: MessageKey,
): ActivityRenderer => {
  return (activity, context) => {
    const isAdded = Boolean(activity.new_value);
    const projectParts = createProjectRelationParts(
      activity,
      context,
      isAdded ? 'into' : 'from',
    );
    const detail = isAdded
      ? activity.new_entity_detail
      : activity.old_entity_detail;

    return createActivityMessage(
      createTextPart(
        `${i18n.global.t(
          isAdded
            ? 'activities.issue.fieldActions.added'
            : 'activities.issue.fieldActions.removed',
        )} `,
      ),
      ...projectParts,
      ...(projectParts.length ? [createTextPart(' ')] : []),
      createTextPart(
        `${i18n.global.t(targetKey)} ${getActivityUserName(
          detail,
          activity.new_value ?? activity.old_value,
        )}`,
      ),
      ...createWorkspaceContextParts(activity, context),
    );
  };
};

export const renderDefaultAssignee = renderDefaultMember(
  'activities.project.members.defaultAssignee',
);

export const renderDefaultWatcher = renderDefaultMember(
  'activities.project.members.defaultWatcher',
);

export const renderProjectMemberAdded: ActivityRenderer = (
  activity,
  context,
) => {
  const projectParts = createProjectRelationParts(activity, context, 'into');
  const workspaceParts = createWorkspaceSourceParts(activity, context);

  return createActivityMessage(
    createTextPart(`${getActivityVerbText(activity.verb)} `),
    ...projectParts,
    ...(projectParts.length ? [createTextPart(' ')] : []),
    createTextPart(
      i18n.global.t('activities.project.memberWithRole', {
        name: getActivityUserName(activity.new_entity_detail),
        role: getRoleText(activity.new_value),
      }),
    ),
    ...(workspaceParts.length ? [createTextPart(' '), ...workspaceParts] : []),
  );
};

export const renderProjectMemberRemoved: ActivityRenderer = (
  activity,
  context,
) => {
  const projectParts = createProjectRelationParts(activity, context, 'from');
  const workspaceParts = createWorkspaceSourceParts(activity, context);

  return createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.project.member',
        {
          name: getActivityUserName(
            activity.old_entity_detail,
            activity.old_value,
          ),
        },
      )}${
        projectParts.length
          ? ' '
          : ` ${i18n.global.t('activities.project.fromProjectSuffix')}`
      }`,
    ),
    ...projectParts,
    ...(workspaceParts.length ? [createTextPart(' '), ...workspaceParts] : []),
  );
};

export const renderProjectMemberRole: ActivityRenderer = (
  activity,
  context,
) => {
  const projectParts = createProjectRelationParts(activity, context, 'of');

  return createActivityMessage(
    createTextPart(
      `${getActivityVerbText(activity.verb)} ${i18n.global.t(
        'activities.project.roleTarget',
        { name: getActivityUserName(activity.new_entity_detail) },
      )} `,
    ),
    ...projectParts,
    createTextPart(
      `${projectParts.length ? ' ' : ''}${i18n.global.t(
        'activities.project.fromToQuoted',
        {
          previous: getRoleText(activity.old_value),
          next: getRoleText(activity.new_value),
        },
      )}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );
};
