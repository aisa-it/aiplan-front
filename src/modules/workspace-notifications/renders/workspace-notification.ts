import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  getEntity,
  getFullName,
  getProjectHref,
  getRoleText,
  getStringValue,
  getVerbText,
  linkPart,
  textPart,
} from './notification-render.helpers';

export const renderWorkspaceNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const action = getVerbText(data.verb);
  const newValue = getStringValue(data.new_value);
  const oldValue = getStringValue(data.old_value);

  switch (data.field) {
    case 'logo':
      return [textPart(`${action} иконку`)];
    case 'name':
      return [textPart(`${action} название пространства`)];
    case 'owner':
      return [
        textPart(
          `${action} лидера пространства с ${getFullName(data.old_entity_detail)} на ${getFullName(data.new_entity_detail)}`,
        ),
      ];
    case 'description':
      return [textPart(`${action} описание пространства`)];
    case 'integration_token':
      return [textPart(`${action} токен`)];
    case 'member':
      if (data.verb === 'added') {
        return [
          textPart(
            `${action} нового пользователя ${getFullName(data.new_entity_detail)} с ролью "${getRoleText(data.new_value)}"`,
          ),
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            `${action} пользователя ${getFullName(data.old_entity_detail)}`,
          ),
        ];
      }
      break;
    case 'role':
      return [
        textPart(
          `изменил(-а) роль пользователя ${getFullName(data.new_entity_detail)} с "${getRoleText(data.old_value)}" на "${getRoleText(data.new_value)}"`,
        ),
      ];
    case 'integration':
      return [
        textPart(`${action} интеграцию "${newValue || oldValue}"`),
      ];
    case 'project':
      if (data.verb === 'created') {
        const project = getEntity(data.new_entity_detail);
        const href = getProjectHref(
          notification.detail.workspace?.slug,
          project.identifier,
        );
        const projectText = project.name
          ? `${newValue} "${project.name}"`
          : newValue;
        return [textPart('создал(-а) проект '), linkPart(projectText, href)];
      }
      if (data.verb === 'deleted') {
        return [textPart(`удалил(-а) проект ${oldValue}`)];
      }
      break;
    case 'doc': {
      const entity = getEntity(
        data.verb === 'removed'
          ? data.old_entity_detail
          : data.new_entity_detail,
      );
      const value = data.verb === 'removed' ? oldValue : newValue;
      const doc = linkPart(`"${value}"`, entity.url);

      if (data.verb === 'created') return [textPart('создал(-а) документ '), doc];
      if (data.verb === 'deleted') {
        return [textPart(`удалил(-а) документ ${oldValue}`)];
      }
      if (data.verb === 'added') {
        return [textPart('добавил(-а) дочерний документ '), doc];
      }
      if (data.verb === 'removed') {
        return [textPart('убрал(-а) дочерний документ '), doc];
      }
      break;
    }
    case 'sprint':
      if (data.verb === 'created') {
        const sprint = getEntity(data.new_entity_detail);
        return [
          textPart('создал(-а) спринт '),
          linkPart(newValue, sprint.url),
        ];
      }
      if (data.verb === 'deleted') {
        return [textPart(`удалил(-а) спринт "${oldValue}"`)];
      }
      break;
  }

  return [];
};
