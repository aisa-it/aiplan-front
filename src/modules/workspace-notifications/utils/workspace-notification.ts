import { valToRole } from 'src/utils/translator';
import { translateVerb } from 'src/utils/translator';
import { getFullName } from 'src/utils/helpers';
import { getDocLink } from '../helpers/getDocLink';

export function workspaceNotificationRender(activity: any, detail: any) {
  let action = '';
  let value = '';

  switch (activity.field) {
    case 'logo':
      action = translateVerb(activity.verb);
      return `${action} иконку`;

    case 'name':
      action = translateVerb(activity.verb);
      return `${action} название пространства`;

    case 'description':
      action = translateVerb(activity.verb);
      return `${action} описание пространства`;

    case 'integration_token':
      action = translateVerb(activity.verb);
      return `${action} токен`;

    case 'member':
      action = translateVerb(activity.verb);
      if (activity.verb === 'added')
        value = `нового пользователя ${getFullName(
          activity.new_entity_detail,
        )} с ролью "${valToRole(+activity.new_value)?.label}"`;
      if (activity.verb === 'removed')
        value = `пользователя ${getFullName(activity.old_entity_detail)}`;
      return `${action} ${value}`;

    case 'role':
      action = translateVerb(activity.verb);
      return `изменил(-а) роль пользователя ${getFullName(
        activity.new_entity_detail,
      )} с "${valToRole(+activity.old_value)?.label}" на "${
        valToRole(+activity.new_value)?.label
      }" <span/>`;

    case 'integration':
      action = translateVerb(activity.verb);
      return `${action} интеграцию "${activity.new_value || activity.old_value}"`;

    case 'project':
      if (activity.verb === 'created') {
        let link = '';
        if (activity.new_entity_detail) {
          link = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${activity.new_entity_detail.url}>${activity.new_value} "${activity.new_entity_detail.name}"</a>`;
        }
        return `${action} создал(-а) проект ${link ? link : activity.new_value}`;
      }

      if (activity.verb === 'deleted') {
        return `${action} удалил(-а) проект ${activity.old_value}`;
      }
    case 'doc':
      if (activity.verb === 'created') {
        return `создал(-а) документ ${
          activity.new_entity_detail
            ? getDocLink(activity.new_value, activity.new_entity_detail?.url)
            : activity.new_value
        }`;
      }
      if (activity.verb === 'deleted') {
        return `удалил(-а) документ ${activity.old_value}`;
      }
      if (activity.verb === 'added') {
        return `добавил(-а) дочерний документ ${
          activity.new_entity_detail
            ? getDocLink(activity.new_value, activity.new_entity_detail?.url)
            : activity.new_value
        }`;
      }
      if (activity.verb === 'removed') {
        return `убрал(-а) дочерний документ ${
          activity.old_entity_detail
            ? getDocLink(activity.old_value, activity.old_entity_detail?.url)
            : activity.old_value
        }`;
      }

    default:
      break;
  }
}
