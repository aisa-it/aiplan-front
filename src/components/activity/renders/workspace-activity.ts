import { valToRole } from 'src/utils/translator';
import { translateVerb } from 'src/utils/translator';
import aiplan from 'src/utils/aiplan';
import { getURLDoc } from './doc-activity';

export function workspaceActivityRender(activity: any, onlyWorkspace = false) {
  let action = '';
  let value = '';

  const atWorkspace = onlyWorkspace
    ? ''
    : `в пространстве <a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${
                      activity?.entity_url ??
                      `/${activity.workspace_detail?.slug}`
                    }>
                    "${activity.workspace_detail?.name}"<a/>`;
  const inWorkspace = onlyWorkspace
    ? ''
    : `в пространство <a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${
                      activity?.entity_url ??
                      `/${activity.workspace_detail?.slug}`
                    }>
                    "${activity.workspace_detail?.name}"<a/>`;
  const fromWorkspace = onlyWorkspace
    ? 'из пространства'
    : `из пространства <a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${
                      activity?.entity_url ??
                      `/${activity.workspace_detail?.slug}`
                    }>
                    "${activity.workspace_detail?.name}"<a/>`;

  const ofWorkspace = onlyWorkspace
    ? 'пространства'
    : `пространства <a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${
                      activity?.entity_url ??
                      `/${activity.workspace_detail?.slug}`
                    }>
                    "${activity.workspace_detail?.name}"<a/>`;

  switch (activity.field) {
    case 'logo':
      action = translateVerb(activity.verb);
      return `<span>${action} аватар ${ofWorkspace} <span/>`;

    case 'name':
      action = translateVerb(activity.verb);
      return `<span>${action} имя пространства с "${activity.old_value}" на "${activity.new_value}" <span/>`;

    case 'integration_token':
      action = translateVerb(activity.verb);
      return `<span>${action} токен ${ofWorkspace} <span/>`;

    case 'member':
      action = translateVerb(activity.verb);
      if (activity.verb === 'added')
        value = ` ${inWorkspace} пользователя ${
          aiplan.UserName(activity.new_entity_detail).join(' ') ||
          activity.new_value
        } с ролью "${valToRole(+activity.new_value)?.label}"`;
      if (activity.verb === 'removed')
        value = ` пользователя ${
          aiplan.UserName(activity.old_entity_detail).join(' ') ||
          activity.old_value
        } ${fromWorkspace}`;
      return `<span>${action} ${value}<span/>`;

    case 'role':
      action = translateVerb(activity.verb);
      return `<span>${action} роль пользователя ${aiplan
        .UserName(activity.new_entity_detail)
        .join(' ')} ${ofWorkspace} с "${
        valToRole(+activity.old_value)?.label
      }" на "${valToRole(+activity.new_value)?.label}" <span/>`;

    case 'description':
      action = translateVerb(activity.verb);
      return `<span>${action} описание ${ofWorkspace} </span>`;

    case 'doc':
      if (activity.verb === 'created')
        return `<span>создал(-а) документ ${getURLDoc(activity)}</span>`;
      if (activity.verb === 'deleted')
        return `<span>удалил(-а) документ ${activity.old_value}</span>`;
      if (activity.verb === 'added')
        return `<span>добавил(-а) дочерний документ "${activity.new_value}" в корневой</span>`;
      if (activity.verb === 'remove')
        return `<span>убрал(-а) дочерний документ "${activity.old_value}" из корневого`;

    case 'doc_sort':
      return '<span>отсортировал(-а) список корневых документов';

    case 'form':
      const formLink = activity?.new_entity_detail
        ? `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${
                      activity?.entity_url ??
                      `/f/${activity?.new_entity_detail?.slug}`
                    }>
                    "${activity?.new_entity_detail?.title}"<a/>`
        : `"${activity.new_value || activity.old_value}"`;
      if (activity.verb === 'created') {
        action = 'создал(-а) форму';
      }
      if (activity.verb === 'deleted') {
        action = 'удалил(-а) форму';
      }
      return `<span>${action} ${formLink}<span/>`;

    case 'project':
      const projectLink = activity.new_entity_detail
        ? `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${activity?.new_entity_detail?.url}>
                    ${activity?.new_value} "${activity.new_entity_detail.name}"<a/>`
        : `"${activity.new_value || activity.old_value}"`;
      if (activity.verb === 'created') {
        return `<span>создал(-а) проект ${projectLink} ${atWorkspace}<span/>`;
      } else if (activity.verb === 'deleted') {
        return `<span>удалил(-а) проект ${projectLink} ${onlyWorkspace ? '' : fromWorkspace}<span/>`;
      }

    case 'integration':
      if (activity.verb === 'added') {
        return `<span>добавил(-а) интеграцию ${activity.new_value} ${inWorkspace}<span/>`;
      } else if (activity.verb === 'removed') {
        return `<span>удалил(-а) интеграцию ${activity.old_value} ${onlyWorkspace ? '' : fromWorkspace}<span/>`;
      }

    case 'sprint':
      if (activity.verb === 'created') {
        return `<span>создал(-а) спринт  <a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${`/${activity.workspace_detail?.slug}/sprints/${activity.new_entity_detail.id}`}>
                    "${activity.new_value}"<a/><span/>`;
      } else if (activity.verb === 'deleted') {
        return `<span>удалил(-а) спринт ${activity.old_value}<span/>`;
      }

    default:
      break;
  }
}
