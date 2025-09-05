import { getFullName } from 'src/utils/helpers';
import { getDocLink } from '../helpers/getDocLink';

export function docNotificationRender(data: any, detail: any) {
  const link = detail.doc
    ? getDocLink(detail.doc?.title, detail.doc?.url)
    : detail.doc.title ?? '';

  switch (data.field) {
    case 'title':
      if (data.verb === 'updated') {
        return `обновил(-а) название в документе ${link}`;
      }
    case 'description':
      if (data.verb === 'updated') {
        return `обновил(-а) описание в документе ${link}`;
      }
    case 'attachment':
      if (data.verb === 'created') {
        return `добавил(-а) вложение в документ ${link}`;
      }
      if (data.verb === 'deleted') {
        return `удалил(-а) вложение в документе ${link}`;
      }
    case 'comment':
      if (data.verb === 'created') {
        return `добавил(-а) комментарий в документ ${link}`;
      }
      if (data.verb === 'deleted') {
        return `удалил(-а) комментарий в документе ${link}`;
      }
      if (data.verb === 'updated') {
        return `изменил(-а) комментарий в документе ${link}`;
      }
    case 'watchers':
      if (data.verb === 'added') {
        return `добавил(-а) наблюдателя ${getFullName(
          data.new_entity_detail,
        )} в документ ${link}`;
      }
      if (data.verb === 'removed') {
        return `убрал(-а) наблюдателя ${getFullName(
          data.old_entity_detail,
        )} из документа ${link}`;
      }
    case 'reader_role':
    case 'editor_role':
      if (data.verb === 'updated') {
        return `обновил(-а) права доступа в документе ${link}`;
      }
    case 'readers':
    case 'editors':
      if (data.verb === 'added') {
        return `обновил(-а) индивидуальные права доступа пользователя ${getFullName(
          data.new_entity_detail,
        )} в документе ${link}`;
      }
      if (data.verb === 'removed') {
        return `обновил(-а) индивидуальные права доступа пользователя ${getFullName(
          data.old_entity_detail,
        )} в документе ${link}`;
      }
    case 'doc':
      if (data.verb === 'created') {
        return `создал(-а) документ ${
          data.new_entity_detail
            ? getDocLink(data.new_value, data.new_entity_detail?.url)
            : data.new_value
        }`;
      }
      if (data.verb === 'deleted') {
        return `удалил(-а) документ ${data.old_value}`;
      }
      if (
        [
          'move_doc_to_doc',
          'move_doc_to_workspace',
          'move_workspace_to_doc',
        ].includes(data.verb)
      ) {
        return `перенес(-ла) документ ${link} из ${
          data.old_entity_detail ? data.old_value : 'корневой папки'
        } в ${data.new_entity_detail ? data.new_value : 'корневую папку'}`;
      }
      if (data.verb === 'added') {
        return `добавил(-а) дочерний документ ${getDocLink(
          data.new_value,
          data.new_entity_detail?.url,
        )}`;
      }
      if (data.verb === 'removed') {
        return `убрал(-а) дочерний документ ${getDocLink(
          data.old_value,
          data.old_entity_detail?.url,
        )}`;
      }
  }

  return '';
}
