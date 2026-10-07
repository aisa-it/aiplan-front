import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  capitalizeFirstLetter,
  getEntity,
  getFullName,
  getIssueHref,
  getNetworkText,
  getPriorityText,
  getProjectHref,
  getRoleText,
  getStateText,
  getStringValue,
  getVerbText,
  linkPart,
  textPart,
} from './notification-render.helpers';

const getProjectReference = (
  notification: WorkspaceNotification,
): NotificationMessagePart => {
  const { project, workspace } = notification.detail;

  return linkPart(
    project?.name ?? '',
    getProjectHref(
      workspace?.slug ?? project?.workspace,
      project?.identifier,
    ),
  );
};

const getChangedIssueReference = (
  notification: WorkspaceNotification,
  data: NotificationActivityData,
  useOldEntity = false,
): NotificationMessagePart => {
  const entity = getEntity(
    useOldEntity ? data.old_entity_detail : data.new_entity_detail,
  );
  const value = getStringValue(useOldEntity ? data.old_value : data.new_value);
  const project = notification.detail.project;
  const issueText = `${value}${entity.name ? ` "${entity.name}"` : ''}`;

  return linkPart(
    issueText,
    getIssueHref(
      notification.detail.workspace?.slug,
      project?.identifier,
      entity.sequence_id,
    ),
  );
};

export const renderProjectNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const project = getProjectReference(notification);
  const hasProject = Boolean(notification.detail.project?.name);
  const newValue = getStringValue(data.new_value);
  const oldValue = getStringValue(data.old_value);

  switch (data.field) {
    case 'emoji':
      return [textPart('изменил(-а) эмодзи проекта '), project];
    case 'logo':
      return [textPart('изменил(-а) лого проекта '), project];
    case 'name':
      return [
        textPart(`изменил(-а) имя проекта с "${oldValue}" на `),
        hasProject ? project : textPart(`"${newValue}"`),
      ];
    case 'description':
      return [
        textPart('изменил(-а) описание проекта '),
        project,
        textPart(
          ` с "${oldValue || 'Без описания'}" на "${newValue || 'Без описания'}"`,
        ),
      ];
    case 'identifier':
      return [
        textPart('изменил(-а) идентификатор проекта '),
        project,
        textPart(` с "${oldValue}" на "${newValue}"`),
      ];
    case 'network':
    case 'public':
      return [
        textPart('изменил(-а) приватность проекта '),
        project,
        textPart(
          ` с "${getNetworkText(data.old_value)}" на "${getNetworkText(data.new_value)}"`,
        ),
      ];
    case 'project_lead':
      return [
        textPart('изменил(-а) лидера проекта '),
        project,
        textPart(
          ` с ${getFullName(data.old_entity_detail)} на ${getFullName(data.new_entity_detail)}`,
        ),
      ];
    case 'default_assignees':
    case 'default_watchers': {
      const isAdded = Boolean(data.new_value);
      const role =
        data.field === 'default_assignees'
          ? 'исполнителя по умолчанию'
          : 'наблюдателя по умолчанию';
      const user = isAdded ? data.new_entity_detail : data.old_entity_detail;
      return [
        textPart(`${isAdded ? 'добавил(-а)' : 'убрал(-а)'} `),
        ...(hasProject
          ? [textPart(`${isAdded ? 'в' : 'из'} проект `), project, textPart(' ')]
          : []),
        textPart(`${role} ${getFullName(user)}`),
      ];
    }
    case 'member': {
      const action = getVerbText(data.verb);
      if (data.verb === 'added') {
        return [
          textPart(`${action} `),
          ...(hasProject ? [textPart('в проект '), project] : []),
          textPart(
            ` пользователя ${getFullName(data.new_entity_detail)} с ролью "${getRoleText(data.new_value)}"`,
          ),
        ];
      }
      if (data.verb === 'removed' || data.verb === 'deleted') {
        return [
          textPart(`${action} пользователя ${getFullName(data.old_entity_detail)} `),
          ...(hasProject ? [textPart('из проекта '), project] : []),
        ];
      }
      break;
    }
    case 'role':
      return [
        textPart(
          `${getVerbText(data.verb)} роль пользователя ${getFullName(data.new_entity_detail)} `,
        ),
        ...(hasProject ? [textPart('проекта '), project] : []),
        textPart(
          ` с "${getRoleText(data.old_value)}" на "${getRoleText(data.new_value)}"`,
        ),
      ];
    case 'status':
      if (data.verb === 'created') {
        return [
          textPart(`${getVerbText(data.verb)} статус "${newValue}" `),
          ...(hasProject ? [textPart('в проект '), project] : []),
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(`${getVerbText(data.verb)} статус "${oldValue}" `),
          ...(hasProject ? [textPart('в проекте '), project] : []),
        ];
      }
      break;
    case 'default':
      if (data.verb === 'updated') {
        return [
          textPart(
            `поменял(-а) статус по умолчанию с "${oldValue}" на "${newValue}" `,
          ),
          ...(hasProject ? [textPart('в проекте '), project] : []),
        ];
      }
      break;
    case 'status_default':
      return [
        textPart(
          `изменил(-а) статус по умолчанию с "${oldValue}" на "${newValue}" `,
        ),
        ...(hasProject ? [textPart('в проекте '), project] : []),
      ];
    case 'status_name':
      return [
        textPart(
          `изменил(-а) имя статуса с "${oldValue}" на "${newValue}" `,
        ),
        ...(hasProject ? [textPart('в проекте '), project] : []),
      ];
    case 'status_description':
      return [
        textPart(
          `изменил(-а) описание статуса "${getEntity(data.new_entity_detail).name || data.new_identifier || ''}" с "${oldValue || 'Без описания'}" на "${newValue || 'Без описания'}" `,
        ),
        ...(hasProject ? [textPart('в проекте '), project] : []),
      ];
    case 'status_group':
      return [
        textPart(
          `изменил(-а) группу статуса "${getEntity(data.new_entity_detail).name || data.new_identifier || ''}" с "${getStateText(data.old_value)}" на "${getStateText(data.new_value)}" `,
        ),
        ...(hasProject ? [textPart('в проекте '), project] : []),
      ];
    case 'status_color':
      return [
        textPart(
          `изменил(-а) цвет статуса с "${oldValue.toUpperCase()}" на "${newValue.toUpperCase()}" `,
        ),
        ...(hasProject ? [textPart('в проекте '), project] : []),
      ];
    case 'label':
      if (data.verb === 'created' || data.verb === 'deleted') {
        const value = data.verb === 'created' ? newValue : oldValue;
        return [
          textPart(`${getVerbText(data.verb)} тег "${value}" `),
          ...(hasProject
            ? [
                textPart(data.verb === 'created' ? 'в проект ' : 'в проекте '),
                project,
              ]
            : []),
        ];
      }
      break;
    case 'label_name':
      return [
        textPart(
          `изменил(-а) имя тега с "${oldValue}" на "${newValue}" `,
        ),
        ...(hasProject ? [textPart('в проекте '), project] : []),
      ];
    case 'label_color':
      return [
        textPart(
          `изменил(-а) цвет тега с "${oldValue.toUpperCase()}" на "${newValue.toUpperCase()}" `,
        ),
        ...(hasProject ? [textPart('в проекте '), project] : []),
      ];
    case 'issue':
      if (data.verb === 'created') {
        const entity = getEntity(data.new_entity_detail);
        const priority = entity.priority
          ? `с приоритетом "${capitalizeFirstLetter(getPriorityText(entity.priority))}"`
          : 'без приоритета';
        return [
          textPart('создал(-а) задачу '),
          getChangedIssueReference(notification, data),
          textPart(` ${priority} `),
          ...(hasProject ? [textPart('в проекте '), project] : []),
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(`удалил(-а) задачу "${oldValue}" `),
          ...(hasProject ? [textPart('в проекте '), project] : []),
        ];
      }
      if (data.verb === 'copied') {
        return [
          textPart('скопировал(-а) задачу '),
          getChangedIssueReference(notification, data),
          textPart(' в проект '),
          project,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart('убрал(-а) задачу '),
          getChangedIssueReference(notification, data, true),
          textPart(' из проекта '),
          project,
        ];
      }
      if (data.verb === 'added') {
        return [
          textPart('добавил(-а) задачу '),
          getChangedIssueReference(notification, data),
          textPart(' в проект '),
          project,
        ];
      }
      break;
    case 'template':
      if (data.verb === 'created' || data.verb === 'deleted') {
        const value = data.verb === 'created' ? newValue : oldValue;
        return [
          textPart(
            `${data.verb === 'created' ? 'создал(-а)' : 'удалил(-а)'} шаблон задачи "${value}" в проекте `,
          ),
          project,
        ];
      }
      break;
    case 'template_name':
      if (data.verb === 'updated') {
        return [
          textPart(
            `изменил(-а) название шаблона задачи с "${oldValue}" на "${newValue}" в проекте `,
          ),
          project,
        ];
      }
      break;
    case 'template_template':
      if (data.verb === 'updated') {
        return [
          textPart(
            `изменил(-а) шаблон задачи "${getEntity(data.new_entity_detail).name ?? ''}" в проекте `,
          ),
          project,
        ];
      }
      break;
  }

  if (data.verb === 'created') {
    return [textPart('добавил(-а) проект '), project];
  }
  if (data.verb === 'deleted') {
    return [textPart(`удалил(-а) проект "${oldValue}`)];
  }

  return [];
};
