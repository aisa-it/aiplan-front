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

const renderDefaultMember = (
  target: 'исполнителя' | 'наблюдателя',
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
      createTextPart(`${isAdded ? 'добавил(-а)' : 'убрал(-а)'} `),
      ...projectParts,
      ...(projectParts.length ? [createTextPart(' ')] : []),
      createTextPart(
        `${target} по умолчанию ${getActivityUserName(
          detail,
          activity.new_value ?? activity.old_value,
        )}`,
      ),
      ...createWorkspaceContextParts(activity, context),
    );
  };
};

export const renderDefaultAssignee = renderDefaultMember('исполнителя');

export const renderDefaultWatcher = renderDefaultMember('наблюдателя');

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
      `пользователя ${getActivityUserName(
        activity.new_entity_detail,
      )} с ролью "${getRoleText(activity.new_value)}"`,
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
      `${getActivityVerbText(activity.verb)} пользователя ${getActivityUserName(
        activity.old_entity_detail,
        activity.old_value,
      )}${projectParts.length ? ' ' : ' из проекта'}`,
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
      `${getActivityVerbText(activity.verb)} роль пользователя ${getActivityUserName(
        activity.new_entity_detail,
      )} `,
    ),
    ...projectParts,
    createTextPart(
      `${projectParts.length ? ' ' : ''}с "${getRoleText(
        activity.old_value,
      )}" на "${getRoleText(
        activity.new_value,
      )}"`,
    ),
    ...createWorkspaceContextParts(activity, context),
  );
};
