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
            ? 'issueActivity.fieldActions.added'
            : 'issueActivity.fieldActions.removed',
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
  'projectActivity.members.defaultAssignee',
);

export const renderDefaultWatcher = renderDefaultMember(
  'projectActivity.members.defaultWatcher',
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
      i18n.global.t('projectActivity.memberWithRole', {
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
        'projectActivity.member',
        {
          name: getActivityUserName(
            activity.old_entity_detail,
            activity.old_value,
          ),
        },
      )}${
        projectParts.length
          ? ' '
          : ` ${i18n.global.t('projectActivity.fromProjectSuffix')}`
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
        'projectActivity.roleTarget',
        { name: getActivityUserName(activity.new_entity_detail) },
      )} `,
    ),
    ...projectParts,
    createTextPart(
      `${projectParts.length ? ' ' : ''}${i18n.global.t(
        'projectActivity.fromToQuoted',
        {
          previous: getRoleText(activity.old_value),
          next: getRoleText(activity.new_value),
        },
      )}`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );
};
