import type {
  NotificationActivityData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import {
  getEntity,
  getFullName,
  getIssueHref,
  getSprintHref,
  getStringValue,
  linkPart,
  textPart,
} from './notification-render.helpers';

export const renderSprintNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;
  const sprintDetail = notification.detail.sprint;
  const sprintName = sprintDetail?.name ?? '';
  const sprintHref = getSprintHref(
    notification.detail.workspace?.slug,
    sprintDetail?.sequence_id ?? sprintDetail?.id,
  );
  const sprintReference = sprintHref
    ? linkPart(sprintName, sprintHref)
    : textPart(sprintName ? `"${sprintName}"` : '');
  const issueEntity = getEntity(
    data.verb === 'removed'
      ? data.old_entity_detail
      : data.new_entity_detail,
  );
  const issueKey = getStringValue(
    data.verb === 'removed' ? data.old_value : data.new_value,
  );
  const [projectIdentifier, sequenceId] = issueKey.split('-');
  const linkedIssueText = `${issueKey ? `${issueKey} ` : ''}"${issueEntity.name ?? ''}"`;
  const unlinkedIssueText = issueKey
    ? `"${issueKey}"`
    : issueEntity.name
      ? `"${issueEntity.name}"`
      : '';
  const issue = linkPart(
    issueEntity.url ? linkedIssueText : unlinkedIssueText,
    issueEntity.url
      ? getIssueHref(
          notification.detail.workspace?.slug,
          projectIdentifier,
          sequenceId,
        )
      : undefined,
  );

  switch (data.field) {
    case 'sprint':
      if (data.verb === 'created') {
        return [textPart('создал(-а) спринт '), sprintReference];
      }
      if (data.verb === 'deleted') {
        return [
          textPart('удалил(-а) спринт '),
          sprintName
            ? sprintReference
            : textPart(getStringValue(data.old_value)),
        ];
      }
      break;
    case 'name':
    case 'sprint_name':
      if (data.verb === 'updated') {
        return [textPart('обновил(-а) название спринта '), sprintReference];
      }
      break;
    case 'description':
    case 'sprint_description':
      if (data.verb === 'updated') {
        return [textPart('обновил(-а) описание спринта '), sprintReference];
      }
      break;
    case 'start_date':
    case 'sprint_start':
      if (data.verb === 'updated') {
        return [textPart('изменил(-а) дату начала спринта '), sprintReference];
      }
      break;
    case 'end_date':
    case 'sprint_end':
      if (data.verb === 'updated') {
        return [textPart('изменил(-а) дату конца спринта '), sprintReference];
      }
      break;
    case 'sprint_date':
      if (data.verb === 'updated') {
        return [textPart('изменил(-а) даты спринта '), sprintReference];
      }
      break;
    case 'issue_list':
    case 'issues':
    case 'issue':
      if (data.verb === 'added') {
        return [
          textPart('добавил(-а) в спринт '),
          sprintReference,
          textPart(' задачу '),
          issue,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart('убрал(-а) из спринта '),
          sprintReference,
          textPart(' задачу '),
          issue,
        ];
      }
      break;
    case 'watcher_list':
    case 'watchers':
      if (data.verb === 'added') {
        return [
          textPart(
            `добавил(-а) наблюдателя ${getFullName(data.new_entity_detail)} в спринт `,
          ),
          sprintReference,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            `убрал(-а) наблюдателя ${getFullName(data.old_entity_detail)} из спринта `,
          ),
          sprintReference,
        ];
      }
      break;
  }

  return [];
};
