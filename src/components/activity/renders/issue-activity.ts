import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import aiplan from 'src/utils/aiplan';
import { addSpaceIfCamelCase } from 'src/utils/strings';
import { formatDateTime } from 'src/utils/time';
import { translatePrioritets, translateVerb } from 'src/utils/translator';
import { translateAction } from './actionTranslations';
import { useRoute } from 'vue-router';
import dayjs from 'dayjs';

function setValue(activity: DtoEntityActivityFull) {
  if (activity.new_value) return activity.new_value;

  if (activity.old_value) return activity.old_value;
  else return '';
}
export function issueActivityRender(
  activity: DtoEntityActivityFull,
  onlyWorkspace = false,
) {
  const route = useRoute();
  let action = '';
  let value = '';
  const link = `<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${
                      activity?.entity_url ??
                      `/${activity.workspace_detail?.slug}/projects/${activity?.project_detail?.identifier}/issues/${activity.issue_detail?.sequence_id}`
                    }>
                    ${activity?.project_detail?.identifier}-${
                      activity.issue_detail?.sequence_id
                    } "${activity.issue_detail?.name}"<a/>`;
  const workspaceSource = onlyWorkspace
    ? ''
    : `в пространстве <a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${
                      activity?.entity_url ??
                      `/${activity.workspace_detail?.slug}`
                    }>
                    "${activity.workspace_detail?.name}"<a/>`;
  const entityDetail = Boolean(activity.new_value)
    ? activity.new_entity_detail
    : activity.old_entity_detail;

  switch (activity.field) {
    case 'issue':
      action = translateVerb(activity.verb as string);
      return `<span>${action} задачу ${
        activity.old_value
          ? activity.project_detail?.identifier + '-' + activity.old_value
          : ''
      } ${workspaceSource}<span/>`;
    case 'label':
    case 'labels':
      action = translateAction('labels', Boolean(activity.new_value));
      value = setValue(activity);
      activity.new_value !== '' ? activity.new_value : activity.old_value;
      return `<span>${action} "${value}" в задаче
                  ${link} ${workspaceSource}
                <span/>`;

    case 'status':
      action = 'поменял(-а) статус на';
      value = activity.new_entity_detail.name
        ? addSpaceIfCamelCase(activity.new_value as string)
        : 'Не выбрано';
      return `<span>${action} "${value}" в задаче
                ${link} ${workspaceSource}
                <span/>`;
    case 'priority':
      action = translateAction('priority', Boolean(activity.new_value));
      const translate = translatePrioritets(activity.new_value as string);
      value = translate
        ? `"${
            translate.charAt(0).toUpperCase() + translate.slice(1).toLowerCase()
          }"`
        : '';
      return `<span>${action} ${value} в задаче
                ${link} ${workspaceSource}
                <span/>`;

    case 'blocking':
      action = translateAction('blocking', Boolean(activity.new_value));
      value = setValue(activity);
      return `<span>${action} ${link} блокирует ${value} ${workspaceSource}
                <span/>`;

    case 'blocks':
      action = translateAction('blocks', Boolean(activity.new_value));
      value = setValue(activity);

      return `<span>${action} ${value} для задачи ${link} ${workspaceSource}
                <span/>`;

    case 'sprint':
      action = translateAction('issues', Boolean(activity.new_value));
      value = setValue(activity);

      return `<span>${action} ${link} ${activity.verb === 'added' ? 'в спринт' : 'из спринта'} ${`<a target="_blank"
                    style="color: #3F76FF; text-decoration: none; font-weight: 600;"
                    href=${`/${activity.workspace_detail?.slug}/sprints/${entityDetail.id}`}>
                    "${entityDetail.name}"<a/>`}<span/>`;

      break;

    case 'target_date':
      if (activity.verb === 'updated') {
        const newDate = activity.new_value ?? '';
        const oldDate = activity.old_value
          ? activity.old_value.replace(/"/g, '')
          : '';
        const newValidDate = dayjs(newDate).isValid()
          ? formatDateTime(newDate)
          : newDate;
        const oldValidDate = dayjs(oldDate).isValid()
          ? formatDateTime(oldDate)
          : oldDate;

        if (activity.old_value === '<nil>' || !activity.old_value) {
          return `установил(-а) срок исполнения ${newValidDate} для задачи ${link} ${workspaceSource}`;
        } else if (activity.new_value === '' && oldValidDate) {
          return `убрал(-а) срок исполнения ${oldValidDate} из задачи ${link} ${workspaceSource}`;
        } else {
          return `изменил(-а) срок исполнения с ${oldValidDate} на ${newValidDate} в задаче ${link} ${workspaceSource}`;
        }
      }

    case 'parent':
      action = translateAction('parent', Boolean(activity.new_value));
      value = setValue(activity);
      return `<span>${action} ${value} для задачи ${link} ${workspaceSource}
                              <span/>`;

    case 'sub_issue':
      action = translateAction('sub_issue', Boolean(activity.new_value));
      value = setValue(activity);
      return `<span>${action} ${value} для задачи ${link} ${workspaceSource}
                              <span/>`;

    case 'linked':
      action = translateAction('linked', Boolean(activity.new_value));
      value = setValue(activity);
      return `<span>${action} ${value} для задачи ${link} ${workspaceSource}
                                          <span/>`;
    case 'watchers':
      action = translateAction('watchers', Boolean(activity.new_value));
      value = aiplan.UserName(entityDetail).join(' ');
      return `<span>${action} ${value} ${
        activity.new_value ? 'в задачу' : 'из задачи'
      } ${link} ${workspaceSource}
                <span/>`;

    case 'assignees':
      action = translateAction('assignees', Boolean(activity.new_value));
      value = aiplan.UserName(entityDetail).join(' ');
      return `<span>${action} ${value} ${
        activity.new_value ? 'в задачу' : 'из задачи'
      } ${link} ${workspaceSource}
                <span/>`;

    case 'description':
      return `<span>изменил(-а) описание в задаче ${link} ${workspaceSource}<span/>`;
    case 'name':
      return `<span>изменил(-а) название в задаче ${link} ${workspaceSource}<span/>`;
    case 'attachment':
      action = translateVerb(activity.verb as string);
      return `<span>${action} вложение "${
        activity.new_value || activity.old_value
      }" в ${
        activity.verb === 'deleted' ? ' задаче' : ' задачу'
      } ${link} ${workspaceSource}<span/>`;
    case 'link':
      action = translateVerb(activity.verb as string);
      return `<span>${action} ссылку в задачe ${link} ${workspaceSource}<span/>`;
    case 'comment':
      action = translateVerb(activity.verb as string);
      return `<span>${action} комментарий в задачe ${link} ${workspaceSource}<span/>`;
    case 'completed_at':
      return `завершил(-а) задачу ${link} ${workspaceSource}`;
    case 'start_date':
      return `начал(-а) выполнение задачи ${link} ${workspaceSource}`;
    case 'link_url':
      return `<span>изменил(-а) ссылку c"${activity.old_value}" на "${activity.new_value}" в задачe ${link} ${workspaceSource}<span>`;

    case 'link_title':
      return `<span>изменил(-а) название ссылки с "${activity.old_value}" на "${activity.new_value}" в задачe ${link} ${workspaceSource}<span>`;

    case 'label':
      action = translateVerb(activity.verb as string);
      return `<span>${action} тег в задачe ${link} ${workspaceSource}<span/>`;

    default:
      break;
  }

  if (activity.verb === 'created') {
    action = 'создал(-а) задачу';
    return `<span>${action} ${link} ${workspaceSource}<span/>`;
  }

  if (activity.verb === 'move') {
    const newProjectName = activity.project_detail?.name
      ? activity.project_detail.name
      : 'в скрытый/удаленный проект';
    const oldProjectName = activity.old_entity_detail.name
      ? activity.old_entity_detail.name
      : 'из скрытого/удаленного проекта';

    if (activity.project_detail?.identifier)
      return `${
        route.params.project === activity.project_detail?.identifier
          ? `перенес(-ла) задачу ${link} из "${oldProjectName}" ${workspaceSource}`
          : `перенес(-ла) задачу ${link} из "${oldProjectName}" в "${newProjectName}" ${workspaceSource}`
      }`;
  }
}
