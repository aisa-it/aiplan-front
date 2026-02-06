import { capitalizeFirstLetter } from 'src/utils/strings';
import { valToNet, valToRole } from 'src/utils/translator';
import {
  stateRUS,
  translatePrioritets,
  translateVerb,
} from 'src/utils/translator';
import { getFullName } from 'src/utils/helpers';
import { NotificationsNotificationDetailResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { getProjectLink } from 'src/utils/links';

export function projectNotificationRender(
  data: any,
  detail?: NotificationsNotificationDetailResponse,
) {
  let action = '';
  let value = '';
  const projectLink = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${getProjectLink(
                      detail?.project?.workspace as string,
                      detail?.project?.identifier as string,
                    )}>
                    ${detail?.project?.name}</a>`;

  const issueLink = (href: string, prefix: string, name: string) => {
    return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${href}>
                    ${prefix} "${name}"</a>`;
  };
  const customLink = (href: string, name: string) => {
    return `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${href}>
                    ${name}</a>`;
  };
  switch (data.field) {
    case 'emoji':
      action = 'изменил(-а)';
      return `<span>${action} эмодзи проекта ${projectLink}<span/>`;

    case 'logo':
      action = 'изменил(-а)';
      return `<span>${action} лого проекта ${projectLink}<span/>`;

    case 'name':
      action = 'изменил(-а)';
      return `<span>${action} имя проекта с "${data.old_value}" на ${
        projectLink ? projectLink : `"${data.new_value}"`
      }<span/>`;

    case 'description':
      action = 'изменил(-а)';
      return `<span>${action} описание проекта ${projectLink} с "${
        data.old_value || 'Без описания'
      }" на "${data.new_value || 'Без описания'}" <span/>`;

    case 'identifier':
      action = 'изменил(-а)';
      return `<span>${action} идентификатор проекта ${projectLink} с "${data.old_value}" на "${data.new_value}"<span/>`;

    case 'network':
      action = 'изменил(-а)';
      return `<span>${action} приватность проекта ${projectLink} с "${
        valToNet(Boolean(data.old_value))?.label
      }" на "${valToNet(Boolean(data.new_value))?.label}"<span/>`;

    case 'public':
      return `<span>изменил(-а) приватность проекта ${projectLink} с "${
        valToNet(JSON.parse(data?.old_value))?.label
      }" на "${
        valToNet(JSON.parse(data?.new_value))?.label
      }"<span/>`;

    case 'project_lead':
      action = 'изменил(-а)';
      return `<span>${action} лидера проекта ${projectLink} с ${getFullName(
        data.old_entity_detail,
      )} на ${getFullName(data.new_entity_detail)}<span/>`;

    case 'default_assignees':
      action = data.new_value ? 'добавил(-а)' : 'убрал(-а)';
      value = data.new_value
        ? `${
            projectLink ? `в проект ${projectLink}` : ''
          } исполнителя по умолчанию ${getFullName(data.new_entity_detail)}`
        : `${
            projectLink ? `из проекта ${projectLink}` : ''
          } исполнителя по умолчанию ${getFullName(data.old_entity_detail)}`;
      return `<span>${action} ${value} <span/>`;

    case 'default_watchers':
      action = data.new_value ? 'добавил(-а)' : 'убрал(-а)';
      value = data.new_value
        ? `${
            projectLink ? `в проект ${projectLink}` : ''
          } наблюдателя по умолчанию ${getFullName(data.new_entity_detail)}`
        : `${
            projectLink ? `из проекта ${projectLink}` : ''
          } наблюдателя по умолчанию ${getFullName(data.old_entity_detail)}`;
      return `<span>${action} ${value} <span/>`;

    case 'member':
      action = translateVerb(data.verb);
      if (data.verb === 'added')
        value = `${
          projectLink ? `в проект ${projectLink}` : ''
        } пользователя ${getFullName(data.new_entity_detail)} с ролью
        "${valToRole(+data.new_value)?.label}"`;
      if (data.verb === 'removed') {
        value = `пользователя ${getFullName(data.old_entity_detail)} ${
          projectLink ? `из проекта ${projectLink}` : ''
        } `;
      }
      if (data.verb === 'deleted')
        value = ` пользователя ${getFullName(data.old_entity_detail)} ${
          projectLink ? `из проекта ${projectLink}` : ''
        }`;
      return `<span>${action} ${value} <span/>`;

    case 'role':
      action = translateVerb(data.verb);
      return `<span>${action} роль пользователя ${getFullName(
        data.new_entity_detail,
      )} ${projectLink ? `проекта ${projectLink}` : ''} с "${
        valToRole(+data.old_value)?.label
      }" на "${valToRole(+data.new_value)?.label}" <span/>`;

    case 'status':
      action = translateVerb(data.verb);
      if (data.verb === 'created')
        value = ` статус "${data.new_value}" ${
          projectLink ? `в проект ${projectLink}` : ''
        }`;
      if (data.verb === 'deleted')
        value = ` статус "${data.old_value}" ${
          projectLink ? `в проекте ${projectLink}` : ''
        }`;
      return `<span>${action} ${value} <span/>`;

    case 'default':
      action = 'поменял(-а)';
      if (data.verb === 'updated')
        value = `статус по умолчанию с "${data.old_value}" на "${
          data.new_value
        }" ${projectLink ? `в проекте ${projectLink}` : ''}`;
      return `<span>${action} ${value}<span/>`;

    case 'status_default':
      action = 'изменил(-а)';
      return `<span>${action} статус по умолчанию с "${
        data.old_value
      }" на "${data.new_value}" ${
        projectLink ? `в проекте ${projectLink}` : ''
      }<span/>`;

    case 'status_name':
      action = 'изменил(-а)';
      return `<span>${action} имя статуса с "${data.old_value}" на "${
        data.new_value
      }" ${projectLink ? `в проекте ${projectLink}` : ''}<span/>`;

    case 'status_description':
      action = 'изменил(-а)';
      return `<span>${action} описание статуса "${
        data?.new_entity_detail?.name || data.new_identifier
      }" с "${data.old_value || 'Без описания'}" на "${
        data.new_value || 'Без описания'
      }" ${projectLink ? `в проекте ${projectLink}` : ''}<span/>`;

    case 'status_group':
      action = 'изменил(-а)';
      return `<span>${action} группу статуса "${
        data?.new_entity_detail?.name || data.new_identifier
      }" с "${stateRUS(data.old_value)}" на "${stateRUS(data.new_value)}" ${
        projectLink ? `в проекте ${projectLink}` : ''
      } <span/>`;

    case 'status_color':
      action = 'изменил(-а)';
      return `<span>${action} цвет статуса с "${data.old_value.toUpperCase()}" на "${data.new_value.toUpperCase()}" ${
        projectLink ? `в проекте ${projectLink}` : ''
      }<span/>`;

    case 'label':
      action = translateVerb(data.verb);
      if (data.verb === 'created')
        value = `тег "${data.new_value}" ${
          projectLink ? `в проект ${projectLink}` : ''
        }`;
      if (data.verb === 'deleted')
        value = `тег "${data.old_value}" ${
          projectLink ? `в проекте ${projectLink}` : ''
        }`;
      return `<span>${action} ${value} <span/>`;

    case 'label_name':
      action = 'изменил(-а)';
      return `<span>${action} имя тега с "${data.old_value}" на "${
        data.new_value
      }" ${projectLink ? `в проекте ${projectLink}` : ''}<span/>`;

    case 'label_color':
      action = 'изменил(-а)';
      return `<span>${action} цвет тега с "${data.old_value.toUpperCase()}" на "${data.new_value.toUpperCase()}" ${
        projectLink ? `в проекте ${projectLink}` : ''
      }<span/>`;
    case 'issue':
      if (data.verb === 'created') {
        action = 'создал(-а)';
        const priority = data.new_entity_detail.priority
          ? `с приоритетом "${capitalizeFirstLetter(translatePrioritets(data.new_entity_detail.priority))}"`
          : 'без приоритета';
        return `<span>${action} задачу ${issueLink(data?.new_entity_detail?.url, data.new_value, data?.new_entity_detail?.name)} ${priority} ${
          projectLink ? `в проекте ${projectLink}` : ''
        }<span/>`;
      }
      if (data.verb === 'deleted') {
        action = 'удалил(-а)';
        return `<span>${action} задачу
          "${data.old_value}" ${
            projectLink ? `в проекте ${projectLink}` : ''
          }<span/>`;
      }

      if (data.verb === 'copied') {
        return `<span>скопировал(-а) задачу ${issueLink(data?.new_entity_detail?.url, data?.new_value, data?.new_entity_detail?.name)} в проект ${projectLink} </span>`;
      }
      if (data.verb === 'removed') {
        return `<span>убрал(-а) задачу ${issueLink(data?.old_entity_detail?.url, data.old_value, data?.old_entity_detail?.name)} из проекта ${customLink(detail?.project?.url ?? '', detail?.project?.name ?? '')} </span>`;
      }
      if (data.verb === 'added') {
        return `<span>добавил(-а) задачу ${issueLink(data?.new_entity_detail?.url, data?.new_value, data?.new_entity_detail?.name)} в проект ${projectLink} </span>`;
      }
      return;

    case 'template':
      if (data.verb === 'created') {
        return `<span>создал(-а) шаблон задачи "${data.new_value}" в проекте ${projectLink} </span>`;
      }
      if (data.verb === 'deleted') {
        return `<span>удалил(-а) шаблон задачи "${data.old_value}" в проекте ${projectLink} </span>`;
      }
      return;

    case 'template_name':
      if (data.verb === 'updated') {
        return `<span>изменил(-а) название шаблона задачи с "${data.old_value}" на "${data.new_value}" в проекте ${projectLink} </span>`;
      }
      return;

    case 'template_template':
      if (data.verb === 'updated') {
        return `<span>изменил(-а) шаблон задачи "${data.new_entity_detail.name}" в проекте ${projectLink} </span>`;
      }
      return;

    default:
      break;
  }

  if (data.verb === 'created') {
    action = 'добавил(-а) проект';
    return `<span>${action}  ${projectLink}<span/>`;
  }
  if (data.verb === 'deleted') {
    action = 'удалил(-а) проект';
    return `<span>${action}  "${data.old_value}<span/>"`;
  }
}
