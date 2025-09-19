import { valToRole } from 'src/utils/strings';
import { translateVerb } from 'src/utils/translator';
import aiplan from 'src/utils/aiplan';
import { getURLDoc } from './doc-activity';

export function workspaceActivityRender(activity: any, onlyWorkspace = false) {
  let action = '';
  let value = '';

  const workspaceSource = onlyWorkspace
    ? ''
    : `в пространстве <a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${
                      activity?.entity_url ??
                      `/${activity.workspace_detail?.slug}`
                    }>
                    "${activity.workspace_detail?.name}"<a/>`;

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
        value = ` в пространство участника ${
          aiplan.UserName(activity.new_entity_detail).join(' ') ||
          activity.new_value
        } с ролью "${valToRole(+activity.new_value)?.label}"`;
      if (activity.verb === 'deleted')
        value = ` участника ${
          aiplan.UserName(activity.old_entity_detail).join(' ') ||
          activity.old_value
        } из пространства`;
      return `<span>${action} ${value}  <span/>`;

    case 'role':
      action = translateVerb(activity.verb);
      return `<span>${action} роль участника пространства ${aiplan
        .UserName(activity.new_entity_detail)
        .join(' ')} с "${
        valToRole(+activity.old_value)?.label
      }" на "${valToRole(+activity.new_value)?.label}" <span/>`;

    case 'description':
      action = translateVerb(activity.verb);
      return `<span>${action} описание пространства </span>`;
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
        action = 'создал(-а) проект';
      }
      if (activity.verb === 'deleted') {
        action = 'удалил(-а) проект';
      }
      return `<span>${action} ${projectLink}<span/>`;

    case 'integration':
      if (activity.verb === 'added') {
        action = 'добавил(-а) интеграцию';
      }
      if (activity.verb === 'removed') {
        action = 'удалил(-а) интеграцию';
      }
      const integrationName =
        activity.verb === 'added' ? activity.new_value : activity.old_value;
      return `<span>${action} ${integrationName} ${workspaceSource}<span/>`;

    default:
      break;
  }
}
