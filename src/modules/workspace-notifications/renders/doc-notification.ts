import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  getEntity,
  getFullName,
  getStringValue,
  linkPart,
  textPart,
} from './notification-render.helpers';

const getDocReference = (
  notification: WorkspaceNotification,
): NotificationMessagePart => {
  const doc = notification.detail.doc;
  return linkPart(`"${doc?.title ?? ''}"`, doc?.url);
};

export const renderDocNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const doc = getDocReference(notification);

  switch (data.field) {
    case 'title':
      if (data.verb === 'updated') {
        return [textPart('обновил(-а) название в документе '), doc];
      }
      break;
    case 'description':
      if (data.verb === 'updated') {
        return [textPart('обновил(-а) описание в документе '), doc];
      }
      break;
    case 'attachment':
      if (data.verb === 'created') {
        return [textPart('добавил(-а) вложение в документ '), doc];
      }
      if (data.verb === 'deleted') {
        return [textPart('удалил(-а) вложение в документе '), doc];
      }
      break;
    case 'comment':
      if (data.verb === 'created') {
        return [textPart('добавил(-а) комментарий в документ '), doc];
      }
      if (data.verb === 'deleted') {
        return [textPart('удалил(-а) комментарий в документе '), doc];
      }
      if (data.verb === 'updated') {
        return [textPart('изменил(-а) комментарий в документе '), doc];
      }
      break;
    case 'watchers':
      if (data.verb === 'added') {
        return [
          textPart(
            `добавил(-а) наблюдателя ${getFullName(data.new_entity_detail)} в документ `,
          ),
          doc,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            `убрал(-а) наблюдателя ${getFullName(data.old_entity_detail)} из документа `,
          ),
          doc,
        ];
      }
      break;
    case 'reader_role':
    case 'editor_role':
      if (data.verb === 'updated') {
        return [textPart('обновил(-а) права доступа в документе '), doc];
      }
      break;
    case 'readers':
    case 'editors':
      if (data.verb === 'added' || data.verb === 'removed') {
        const user =
          data.verb === 'added'
            ? data.new_entity_detail
            : data.old_entity_detail;
        return [
          textPart(
            `обновил(-а) индивидуальные права доступа пользователя ${getFullName(user)} в документе `,
          ),
          doc,
        ];
      }
      break;
    case 'doc': {
      const newValue = getStringValue(data.new_value);
      const oldValue = getStringValue(data.old_value);

      if (data.verb === 'created') {
        const entity = getEntity(data.new_entity_detail);
        return [
          textPart('создал(-а) документ '),
          linkPart(`"${newValue}"`, entity.url),
        ];
      }
      if (data.verb === 'deleted') {
        return [textPart(`удалил(-а) документ ${oldValue}`)];
      }
      if (
        data.verb === 'move_doc_to_doc' ||
        data.verb === 'move_doc_to_workspace' ||
        data.verb === 'move_workspace_to_doc'
      ) {
        return [
          textPart('перенес(-ла) документ '),
          doc,
          textPart(
            ` из ${data.old_entity_detail ? oldValue : 'корневой папки'} в ${data.new_entity_detail ? newValue : 'корневую папку'}`,
          ),
        ];
      }
      if (data.verb === 'added') {
        return [
          textPart('добавил(-а) дочерний документ '),
          linkPart(`"${newValue}"`, getEntity(data.new_entity_detail).url),
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart('убрал(-а) дочерний документ '),
          linkPart(`"${oldValue}"`, getEntity(data.old_entity_detail).url),
        ];
      }
      break;
    }
  }

  return [];
};
