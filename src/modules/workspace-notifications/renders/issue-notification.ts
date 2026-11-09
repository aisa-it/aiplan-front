import dayjs from 'dayjs';

import { formatDateTime } from '@/utils/time';

import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  addSpaceIfCamelCase,
  getEntity,
  getEntityByChange,
  getIssueHref,
  getPriorityText,
  getProjectHref,
  getSprintHref,
  getStringValue,
  getUserDisplayName,
  getVerbText,
  linkPart,
  textPart,
} from './notification-render.helpers';

const getIssueReference = (
  notification: WorkspaceNotification,
): NotificationMessagePart => {
  const { issue, project, workspace } = notification.detail;
  const issueKey =
    project?.identifier && issue?.sequence_id !== undefined
      ? `${project.identifier}-${issue.sequence_id}`
      : '';
  const text = `${issueKey}${issue?.name ? ` "${issue.name}"` : ''}`;

  return linkPart(
    text,
    getIssueHref(workspace?.slug, project?.identifier, issue?.sequence_id),
  );
};

export const renderIssueNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const issue = getIssueReference(notification);
  const newValue = getStringValue(data.new_value);
  const oldValue = getStringValue(data.old_value);
  const changedValue = newValue || oldValue;

  switch (data.field) {
    case 'issue':
      return [
        textPart(
          `${getVerbText(data.verb)} задачу ${oldValue ? `"${notification.detail.project?.identifier}-${oldValue}"` : ''}`,
        ),
      ];
    case 'labels':
      return [
        textPart(
          `${newValue ? 'добавил(-а) новый тег' : 'убрал(-а) тег'} "${changedValue}" в задаче `,
        ),
        issue,
      ];
    case 'status':
      return [
        textPart(
          `поменял(-а) статус на "${newValue ? addSpaceIfCamelCase(newValue) : 'Не выбрано'}" в задаче `,
        ),
        issue,
      ];
    case 'priority': {
      const action = newValue
        ? oldValue && oldValue !== '<nil>'
          ? 'изменил(-а) приоритет на'
          : 'установил(-а) приоритет'
        : 'убрал(-а) приоритет';
      const priority = getPriorityText(data.new_value);
      const priorityText = priority
        ? ` "${priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}"`
        : '';
      return [
        textPart(`${action}${priorityText} в задаче `),
        issue,
      ];
    }
    case 'blocking':
      return [
        textPart(
          newValue
            ? 'установил(-а), что задача '
            : 'убрал(-а), что задача ',
        ),
        issue,
        textPart(` блокирует ${changedValue}`),
      ];
    case 'blocks':
      return [
        textPart(
          `${newValue ? 'установил(-а) блокировщик' : 'убрал(-а) блокировщик'} ${changedValue} для задачи `,
        ),
        issue,
      ];
    case 'target_date': {
      const value = newValue || oldValue.replace(/"/g, '');
      const date = dayjs(value).isValid() ? formatDateTime(value) : value;
      return [
        textPart(
          `${newValue ? 'установил(-а) срок исполнения' : 'убрал(-а) срок исполнения'} ${date} для задачи `,
        ),
        issue,
      ];
    }
    case 'parent':
      return [
        textPart(
          `${newValue ? 'добавил(-а) родительскую задачу ' : 'убрал(-а) родителя'} ${changedValue} для задачи `,
        ),
        issue,
      ];
    case 'sub_issue':
      return [
        textPart(
          `${newValue ? 'добавил(-а) подзадачу ' : 'убрал(-а) подзадачу'} ${changedValue} для задачи `,
        ),
        issue,
      ];
    case 'linked':
      return [
        textPart(
          `${newValue ? 'добавил(-а) связанную задачу ' : 'убрал(-а) связанную задачу '} ${changedValue} для задачи `,
        ),
        issue,
      ];
    case 'watchers':
    case 'assignees': {
      const entity = getEntityByChange(data);
      const action = newValue ? 'добавил(-а)' : 'убрал(-а)';
      const role = data.field === 'watchers' ? 'наблюдателя' : 'исполнителя';
      return [
        textPart(
          `${action} ${role} ${getUserDisplayName(entity)} ${newValue ? 'в задачу' : 'из задачи'} `,
        ),
        issue,
      ];
    }
    case 'description':
      return [textPart('обновил(-а) описание в задаче '), issue];
    case 'name':
      return [textPart('обновил(-а) название в задаче '), issue];
    case 'attachment':
      return [
        textPart(`${getVerbText(data.verb)} вложение в задачу `),
        issue,
      ];
    case 'link':
    case 'link_url':
      return [
        textPart(`${getVerbText(data.verb)} ссылку в задачe `),
        issue,
      ];
    case 'link_title':
      return [
        textPart(`${getVerbText(data.verb)} название ссылки в задачe `),
        issue,
      ];
    case 'comment':
      return [
        textPart(`${getVerbText(data.verb)} комментарий в задачe `),
        issue,
      ];
    case 'label':
      return [
        textPart(`${getVerbText(data.verb)} тег в задачe `),
        issue,
      ];
    case 'project': {
      const newProject = getEntity(data.new_entity_detail);
      const oldProject = getEntity(data.old_entity_detail);
      const workspaceSlug = notification.detail.workspace?.slug;

      if (data.verb === 'move') {
        return [
          textPart('перенес(-ла) задачу '),
          issue,
          textPart(' '),
          ...(oldValue
            ? [
                textPart('из проекта '),
                linkPart(
                  oldProject.name ?? '',
                  getProjectHref(
                    workspaceSlug,
                    oldProject.identifier ?? oldProject.id,
                  ),
                ),
              ]
            : [textPart('из скрытого/удаленного проекта')]),
          textPart(' '),
          ...(newValue
            ? [
                textPart('в проект '),
                linkPart(
                  newProject.name ?? '',
                  getProjectHref(
                    workspaceSlug,
                    newProject.identifier ?? newProject.id,
                  ),
                ),
              ]
            : [textPart('в скрытый/удаленный проект')]),
        ];
      }
      break;
    }
    case 'issue_transfer': {
      const action =
        data.verb === 'copied' ? 'скопировал(-а)' : 'перенес(-ла)';
      const oldProject = oldValue
        ? `из проекта "${oldValue}"`
        : 'из скрытого/удаленного проекта';
      const newProject = newValue
        ? `в проект "${newValue}"`
        : 'в скрытый/удаленный проект';
      return [
        textPart(`${action} задачу `),
        issue,
        textPart(` ${oldProject} ${newProject}`),
      ];
    }
    case 'sprint': {
      const sprintEntity = getEntity(
        data.verb === 'removed'
          ? data.old_entity_detail
          : data.new_entity_detail,
      );
      const sprintName = sprintEntity.name || newValue || oldValue;
      const sprint = linkPart(
        sprintName || '',
        getSprintHref(
          notification.detail.workspace?.slug,
          sprintEntity.sequence_id ?? sprintEntity.id,
        ),
      );

      if (data.verb === 'added') {
        return [textPart('добавил(-а) задачу '), issue, textPart(' в спринт '), sprint];
      }
      if (data.verb === 'removed') {
        return [textPart('убрал(-а) задачу '), issue, textPart(' из спринта '), sprint];
      }
      if (data.verb === 'updated') {
        return [textPart('изменил(-а) спринт на '), sprint, textPart(' в задаче '), issue];
      }
      break;
    }
  }

  if (data.verb === 'created') {
    return [textPart('создал(-а) задачу '), issue];
  }

  if (data.comment_stripped) {
    return [textPart('добавил(-а) комментарий в задачe '), issue];
  }

  return [];
};
