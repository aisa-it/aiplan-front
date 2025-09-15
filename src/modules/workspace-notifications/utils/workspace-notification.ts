import { valToRole } from 'src/utils/strings';
import { translateVerb } from 'src/utils/translator';
import { getFullName } from 'src/utils/helpers';
import { getDocLink } from '../helpers/getDocLink';

export function workspaceNotificationRender(
  activity: any,
) {
  let action = '';
  let value = '';

  switch (activity.field) {
    case 'logo':
      action = translateVerb(activity.verb);
      return `<span>${action} аватар пространства <span/>`;

    case 'name':
      action = translateVerb(activity.verb);
      return `<span>${action} имя пространства с "${activity.old_value}" на "${activity.new_value}" <span/>`;

    case 'integration_token':
      action = translateVerb(activity.verb);
      return `<span>${action} токен пространства <span/>`;

    case 'member':
      action = translateVerb(activity.verb);
      if (activity.verb === 'added')
        value = ` в пространство участника ${getFullName(
          activity.new_entity_detail,
        )} с ролью "${valToRole(+activity.new_value)?.label}"`;
      if (activity.verb === 'deleted')
        value = ` участника ${getFullName(
          activity.old_entity_detail,
        )} из пространства`;
      return `<span>${action} ${value} <span/>`;

    case 'role':
      action = translateVerb(activity.verb);
      return `<span>${action} роль участника пространства ${getFullName(
        activity.new_entity_detail,
      )} с "${valToRole(+activity.old_value)?.label}" на "${valToRole(
        +activity.new_value,
      )?.label}" <span/>`;

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
