import { computed } from 'vue';
import {
  valToNet,
  valToRole,
  stateRUS,
  translateVerb,
} from 'src/utils/translator';
import { getFullName } from 'src/utils/helpers';
import aiplan from 'src/utils/aiplan';
import { translateAction } from './actionTranslations';
import { useRoute } from 'vue-router';

export function projectActivityRender(
  activity: any,
  onlyProject = false,
  onlyWorkspace = false,
) {
  const route = useRoute();
  let action = '';
  let value = '';

  const link = onlyProject
    ? ''
    : `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${`/${activity.workspace_detail?.slug}/projects/${activity?.project_detail?.id}`}>
                    "${activity?.project_detail?.name}"</a>`;

  const issueLinkIdentifier = computed<string>(() =>
    activity.new_value ? activity.new_value : activity.old_value,
  );
  const issueLinkName = computed<string>(() =>
    activity?.new_entity_detail?.name
      ? activity?.new_entity_detail?.name
      : activity?.old_entity_detail?.name,
  );
  const issueLink = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${`/${activity.workspace_detail?.slug}/projects/${
                      activity?.project_detail?.identifier
                    }/issues/${issueLinkIdentifier.value.split('-')[1]}`}>
                    ${issueLinkIdentifier.value} "${issueLinkName.value}"</a>`;
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
    case 'emoji':
    case 'logo':
      return `<span>изменил(-а) иконку проекта ${link} ${workspaceSource}<span/>`;

    case 'name':
      return `<span>изменил(-а) название проекта с "${activity?.old_value}" на ${
        link ? link : `"${activity?.new_value}"`
      } ${workspaceSource}<span/>`;

    case 'identifier':
      return `<span>изменил(-а) идентификатор проекта ${link} с "${activity?.old_value}" на "${activity?.new_value}" ${workspaceSource}<span/>`;

    case 'public':
      return `<span>изменил(-а) приватность проекта ${link} с "${
        valToNet(JSON.parse(activity?.old_value))?.label
      }" на "${
        valToNet(JSON.parse(activity?.new_value))?.label
      }" ${workspaceSource}<span/>`;

    case 'project_lead':
      return `<span>изменил(-а) лидера проекта ${link} с ${getFullName(
        activity?.old_entity_detail,
      )} на ${getFullName(
        activity?.new_entity_detail,
      )} ${workspaceSource}<span/>`;

    case 'default_assignees':
      action = translateAction(
        onlyProject ? 'default' : 'default_assignees',
        Boolean(activity?.new_value),
      );
      value = aiplan
        .UserName(
          activity.new_entity_detail
            ? activity.new_entity_detail
            : activity.old_entity_detail,
        )
        .join(' ');
      return `<span>${action} ${
        link ? link : ''
      } исполнителя по умолчанию ${value} ${workspaceSource}<span/>`;

    case 'default_watchers':
      action = translateAction(
        onlyProject ? 'default' : 'default_watchers',
        Boolean(activity?.new_value),
      );
      value = aiplan
        .UserName(
          activity.new_entity_detail
            ? activity.new_entity_detail
            : activity.old_entity_detail,
        )
        .join(' ');
      return `<span>${action} ${
        link ? link : ''
      } наблюдателя по умолчанию ${value} ${workspaceSource}<span/>`;

    case 'member':
      action = translateVerb(activity.verb);
      if (activity?.verb === 'added')
        value = `${link ? `в проект ${link}` : ''} пользователя ${aiplan
          .UserName(activity.new_entity_detail)
          .join(' ')} с ролью "${
          valToRole(+activity?.new_value)?.label
        }" ${workspaceSource}`;
      if (activity?.verb === 'removed')
        value = ` пользователя ${
          aiplan.UserName(activity.old_entity_detail).join(' ') ||
          activity.old_value
        } ${link ? `из проекта ${link}` : 'из проекта'} ${workspaceSource}`;
      return `<span>${action} ${value}<span/>`;

    case 'role':
      action = translateVerb(activity.verb);
      return `<span>${action} роль пользователя ${aiplan
        .UserName(activity.new_entity_detail)
        .join(' ')} ${link ? `проекта ${link}` : ''} с "${
        valToRole(+activity?.old_value)?.label
      }" на "${
        valToRole(+activity?.new_value)?.label
      }" ${workspaceSource}<span/>`;

    case 'state':
      action = translateVerb(activity.verb);
      if (activity?.verb === 'created')
        value = ` статус "${activity?.new_value}" ${
          link ? `в проект ${link} ${workspaceSource}` : ''
        }`;
      if (activity?.verb === 'deleted')
        value = ` статус "${activity?.old_value}" ${
          link ? `из проекта ${link} ${workspaceSource}` : ''
        }`;
      return `<span>${action} ${value}<span/>`;

    case 'default':
      action = 'поменял(-а)';
      if (activity?.verb === 'updated')
        value = `статус по умолчанию с "${activity?.old_value}" на "${activity?.new_value}" ${
          link ? `в проекте ${link} ${workspaceSource}` : ''
        }`;
      return `<span>${action} ${value}<span/>`;

    case 'status_name':
      action = 'изменил(-а)';
      return `<span>${action} название статуса с "${activity?.old_value}" на "${activity?.new_value}" ${
        link ? `в проекте ${link} ${workspaceSource}` : ''
      }<span/>`;

    case 'status_description':
      action = 'изменил(-а)';
      return `<span>${action} описание статуса "${
        activity?.new_entity_detail?.name
      }" с "${activity?.old_value || 'Без описания'}" на "${
        activity?.new_value || 'Без описания'
      }" ${link ? `в проекте ${link} ${workspaceSource}` : ''}<span/>`;

    case 'status_group':
      action = 'изменил(-а)';
      return `<span>${action} группу статуса "${
        activity?.new_entity_detail.name
      }" с "${stateRUS(activity?.old_value)}" на "${stateRUS(
        activity?.new_value,
      )}" ${link ? `в проекте ${link} ${workspaceSource}` : ''} <span/>`;

    case 'status_color':
      action = 'изменил(-а)';
      return `<span>${action} цвет статуса "${
        activity?.new_entity_detail.name
      }" с "${activity?.old_value}" на "${activity?.new_value}" ${
        link ? `в проекте ${link} ${workspaceSource}` : ''
      }<span/>`;

    case 'status_default':
      action = 'изменил(-а)';
      return `<span>${action} статус по умолчанию с "${
        activity.old_value
      }" на "${activity.new_value}" ${
        link ? `в проекте ${link} ${workspaceSource}` : ''
      }<span/>`;

    case 'label':
      action = translateVerb(activity?.verb);
      if (activity?.verb === 'created')
        value = `тег "${activity?.new_value}" ${
          link ? `в проект ${link} ${workspaceSource}` : ''
        }`;
      if (activity?.verb === 'deleted')
        value = `тег "${activity?.old_value}" ${
          link ? `из проекта ${link} ${workspaceSource}` : ''
        }`;
      return `<span>${action} ${value}<span/>`;

    case 'label_name':
      action = 'изменил(-а)';
      return `<span>${action} название тега с "${activity?.old_value}" на "${activity?.new_value}" ${
        link ? `в проекте ${link} ${workspaceSource}` : ''
      }<span/>`;

    case 'label_color':
      action = 'изменил(-а)';
      return `<span>${action} цвет тега "${
        activity?.new_entity_detail.name
      }" с "${activity?.old_value}" на "${activity?.new_value}" ${
        link ? `в проекте ${link} ${workspaceSource}` : ''
      }<span/>`;

    case 'issue':
      const linkIssue = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${`/${activity.workspace_detail?.slug}/projects/${activity?.project_detail?.id}/issues/${activity?.new_entity_detail?.sequence_id || activity?.old_entity_detail?.sequence_id}`}>
                    ${activity?.new_value || activity?.old_value} "${
                      activity?.new_entity_detail?.name ||
                      activity?.old_entity_detail?.name
                    }"</a>`;
      if (activity.verb === 'added') {
        if (activity.project_detail?.identifier)
          return `${
            route.params.project === activity.project_detail?.identifier
              ? `<span> добавил(-а) задачу ${issueLink} ${workspaceSource}<span/>`
              : `<span> добавил(-а) задачу ${issueLink} в "${activity.project_detail.name}" ${workspaceSource}<span/>`
          }`;
      } else if (activity.verb === 'created') {
        return `<span> создал(-а) задачу ${
          activity?.new_entity_detail ? linkIssue : `${activity?.new_value}`
        } ${workspaceSource}<span/>`;
      } else if (activity.verb === 'remove') {
        if (activity.project_detail?.identifier)
          return `${
            route.params.project === activity.project_detail?.identifier
              ? `<span> убрал(-а) задачу ${issueLink} ${workspaceSource}<span/>`
              : `<span> убрал(-а) задачу ${issueLink} в "${activity.project_detail.name}" ${workspaceSource}<span/>`
          }`;
      } else if (activity.verb === 'deleted') {
        return `${`<span> удалил(-а) задачу ${activity?.old_value} ${workspaceSource}<span/>`}`;
      } else if (activity.verb === 'copied') {
        return `<span> скопировал(-а) задачу ${linkIssue} ${link ? 'в проект' + link : ''} ${workspaceSource}<span/>`;
      } else if (activity.verb === 'removed') {
        return `<span> удалил(-а) задачу ${linkIssue} ${link ? 'из проекта' + link : ''} ${workspaceSource}<span/>`;
      }

    case 'template':
      if (activity.verb === 'created') {
        return `создал(-а) шаблон задачи "${activity.new_value}"`;
      }
      if (activity.verb === 'deleted') {
        return `удалил(-а) шаблон задачи "${activity.old_value}"`;
      }
    case 'template_template':
    case 'template_name':
      if (activity.verb === 'updated') {
        return `изменил(-а) шаблон задачи "${activity.new_entity_detail.name}"`;
      }

    default:
      break;
  }

  if (activity?.verb === 'created') {
    action = 'добавил(-а) проект';
    return `<span>${action} ${link} ${workspaceSource}<span/>`;
  }
  if (activity?.verb === 'deleted') {
    action = 'удалил(-а) проект';
    return `<span>${action} "${activity?.old_value} ${workspaceSource}<span/>"`;
  }
}
