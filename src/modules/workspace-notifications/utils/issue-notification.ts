import { addSpaceIfCamelCase } from 'src/utils/strings';
import { formatDateTime } from 'src/utils/time';
import { translatePrioritets, translateVerb } from 'src/utils/translator';
import aiplan from 'src/utils/aiplan';
import dayjs from 'dayjs';

export function issueNotificationRender(data: any, detail: any) {
  let action = '';
  let value = '';
  let issue = '';
  const link = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${detail.issue.url}>
                    ${detail.project.identifier}-${detail.issue?.sequence_id} "${detail.issue?.name}"<a/>`;

  const customLink = (href: string, name: string) => `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 400;"
                    href=${href}>
                    ${name}<a/>`;
  const entityDetail = Boolean(data.new_value)
    ? data.new_entity_detail
    : data.old_entity_detail;

  switch (data.field) {
    case 'issue':
      action = translateVerb(data.verb);
      value = 'задачу';
      return `<span>${action} ${value} ${
        data.old_value
          ? '"' + detail.project.identifier + '-' + data.old_value + '"'
          : ''
      }<span/>`;
    case 'labels':
      action =
        data.new_value !== '' ? 'добавил(-а) новый тег' : 'убрал(-а) тег';
      issue = 'в задаче';
      value = data.new_value !== '' ? data.new_value : data.old_value;
      return `<span>${action} "${value}" ${issue}
                  ${link}
                <span/>`;

    case 'status':
      action = 'поменял(-а) статус на';
      value = data.new_value
        ? addSpaceIfCamelCase(data.new_value)
        : 'Не выбрано';
      issue = 'в задаче';
      return `<span>${action} "${value}" ${issue}
                ${link}
                <span/>`;

    case 'priority':
      action =
        data.new_value && data.new_value !== ''
          ? data.old_value && data.old_value !== '<nil>'
            ? 'изменил(-а) приоритет на'
            : 'установил(-а) приоритет'
          : 'убрал(-а) приоритет';
      const translate = translatePrioritets(data.new_value);
      value = translate
        ? `"${
            translate.charAt(0).toUpperCase() + translate.slice(1).toLowerCase()
          }"`
        : '';
      issue = 'в задаче';
      return `<span>${action} ${value} ${issue}
                ${link}
                <span/>`;

    case 'blocking':
      action =
        data.new_value !== ''
          ? 'установил(-а), что задача '
          : 'убрал(-а), что задача ';
      value = data.new_value !== '' ? data.new_value : data.old_value;
      return `<span>${action} ${link} блокирует ${value}
                <span/>`;

    case 'blocks':
      action =
        data.new_value !== ''
          ? 'установил(-а) блокировщик'
          : 'убрал(-а) блокировщик';
      value = data.new_value !== '' ? data.new_value : data.old_value;
      return `<span>${action} ${value} для задачи ${link}
                <span/>`;

    case 'target_date':
      action =
        data.new_value && data.new_value !== ''
          ? 'установил(-а) срок исполнения'
          : 'убрал(-а) срок исполнения';
      const date =
        data.new_value && data.new_value !== ''
          ? data.new_value
          : data.old_value.replace(/"/g, '');
      value = dayjs(date).isValid() ? formatDateTime(date) : date;
      return `<span>${action} ${value} для задачи ${link}
                <span/>`;

    case 'parent':
      action =
        data.new_value && data.new_value !== ''
          ? 'добавил(-а) родительскую задачу '
          : 'убрал(-а) родителя';
      value =
        data.new_value !== ''
          ? data.new_value
          : data.old_value !== ''
            ? data.old_value
            : '';
      return `<span>${action} ${value} для задачи ${link}
                <span/>`;

    case 'sub_issue':
      action =
        data.new_value && data.new_value !== ''
          ? 'добавил(-а) подзадачу '
          : 'убрал(-а) подзадачу';
      value =
        data.new_value !== ''
          ? data.new_value
          : data.old_value !== ''
            ? data.old_value
            : '';
      return `<span>${action} ${value} для задачи ${link}
                <span/>`;

    case 'linked':
      action =
        data.new_value && data.new_value !== ''
          ? 'добавил(-а) связанную задачу '
          : 'убрал(-а) связанную задачу ';
      value =
        data.new_value !== ''
          ? data.new_value
          : data.old_value !== ''
            ? data.old_value
            : '';
      return `<span>${action} ${value} для задачи ${link}
                            <span/>`;

    case 'watchers':
      action =
        data.new_value && data.new_value !== ''
          ? 'добавил(-а) наблюдателя'
          : 'убрал(-а) наблюдателя';
      value = aiplan.UserName(entityDetail).join(' ');
      return `<span>${action} ${value} ${
        data.new_value ? 'в задачу' : 'из задачи'
      } ${link}
                <span/>`;

    case 'assignees':
      action =
        data.new_value && data.new_value !== ''
          ? 'добавил(-а) исполнителя'
          : 'убрал(-а) исполнителя';
      value = aiplan.UserName(entityDetail).join(' ');
      return `<span>${action} ${value} ${
        data.new_value ? 'в задачу' : 'из задачи'
      } ${link}
                <span/>`;

    case 'description':
      action = 'обновил(-а)';
      value = 'описание';
      return `<span>${action} ${value} в задаче ${link}<span/>`;
    case 'name':
      action = 'обновил(-а)';
      value = 'название';
      return `<span>${action} ${value} в задаче ${link}<span/>`;
    case 'attachment':
      action = action = translateVerb(data.verb);
      value = 'вложение';
      return `<span>${action} ${value} в задачу ${link}<span/>`;
    case 'link':
      action = translateVerb(data.verb);
      value = 'ссылку';
      return `<span>${action} ${value} в задачe ${link}<span/>`;

    case 'link_url':
      action = translateVerb(data.verb);
      value = 'ссылку';
      return `<span>${action} ${value} в задачe ${link}<span/>`;

    case 'link_title':
      action = translateVerb(data.verb);
      value = 'название ссылки';
      return `<span>${action} ${value} в задачe ${link}<span/>`;

    case 'comment':
      action = translateVerb(data.verb);
      value = 'комментарий';
      return `<span>${action} ${value} в задачe ${link}<span/>`;

    case 'label':
      action = translateVerb(data.verb);
      value = 'тег';
      return `<span>${action} ${value} в задачe ${link}<span/>`;

    case 'project':
      const newProject = data.new_value
        ? `в проект ${customLink(data.new_entity_detail.url, data.new_entity_detail.name)}`
        : 'в скрытый/удаленный проект';

      const oldProject = data.old_value
        ? `из проекта ${customLink(data.old_entity_detail.url, data.old_entity_detail.name)}`
        : 'из скрытого/удаленного проекта';

      if (data.verb === 'move') {
        return `<span>перенес(-ла) задачу ${link} ${oldProject} ${newProject} </span>`;
      }
    case 'issue_transfer':
      const newVal = data.new_value
        ? `в проект "${data.new_value}"`
        : 'в скрытый/удаленный проект';

      const oldVal = data.old_value
        ? `из проекта "${data.old_value}"`
        : 'из скрытого/удаленного проекта';

      if (data.verb === 'copied') {
        return `<span>скопировал(-а) задачу ${link} ${oldVal} ${newVal} </span>`;
      }

      return `<span>перенес(-ла) задачу ${link} ${oldVal} ${newVal} </span>`;

    case 'sprint': {
      const sprintEntity =
        data?.verb === 'removed' ? data?.old_entity_detail : data?.new_entity_detail;
      const sprintName =
        sprintEntity?.name || data?.new_value || data?.old_value || '';
      const sprintLink =
        sprintEntity?.url
          ? customLink(sprintEntity.url, `${sprintName}`)
          : sprintName
            ? `"${sprintName}"`
            : '';

      if (data?.verb === 'added') {
        return `<span>добавил(-а) задачу ${link} в спринт ${sprintLink}<span/>`;
      }
      if (data?.verb === 'removed') {
        return `<span>убрал(-а) задачу ${link} из спринта ${sprintLink}<span/>`;
      }
      if (data?.verb === 'updated') {
        return `<span>изменил(-а) спринт на ${sprintLink} в задаче ${link}<span/>`;
      }
      break;
    }

    default:
      break;
  }

  if (data.verb === 'created') {
    action = 'создал(-а) задачу';
    return `<span>${action}  ${link}<span/>`;
  }

  if (data.comment_stripped) {
    action = translateVerb('added');
    value = 'комментарий';
    return `<span>${action} ${value} в задачe ${link}<span/>`;
  }
}
