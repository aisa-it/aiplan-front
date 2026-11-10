import { i18n } from '@/i18n';
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
    data.verb === 'removed' ? data.old_entity_detail : data.new_entity_detail,
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
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.createdTheSprint',
            ),
          ),
          sprintReference,
        ];
      }
      if (data.verb === 'deleted') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.deletedTheSprint',
            ),
          ),
          sprintName
            ? sprintReference
            : textPart(getStringValue(data.old_value)),
        ];
      }
      break;
    case 'name':
    case 'sprint_name':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.updatedTheSprintTitle',
            ),
          ),
          sprintReference,
        ];
      }
      break;
    case 'description':
    case 'sprint_description':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.updatedTheSprintDescription',
            ),
          ),
          sprintReference,
        ];
      }
      break;
    case 'start_date':
    case 'sprint_start':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.changedTheSprintStartDate',
            ),
          ),
          sprintReference,
        ];
      }
      break;
    case 'end_date':
    case 'sprint_end':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.changedTheSprintEndDate',
            ),
          ),
          sprintReference,
        ];
      }
      break;
    case 'sprint_date':
      if (data.verb === 'updated') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.changedTheSprintDates',
            ),
          ),
          sprintReference,
        ];
      }
      break;
    case 'issue_list':
    case 'issues':
    case 'issue':
      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.addedToTheSprint',
            ),
          ),
          sprintReference,
          textPart(
            i18n.global.t('workspaceNotifications.renders.sprint.theIssue2'),
          ),
          issue,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.removedFromTheSprint',
            ),
          ),
          sprintReference,
          textPart(
            i18n.global.t('workspaceNotifications.renders.sprint.theIssue'),
          ),
          issue,
        ];
      }
      break;
    case 'watcher_list':
    case 'watchers':
      if (data.verb === 'added') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.addedWatcherToTheSprint',
              { p0: getFullName(data.new_entity_detail) },
            ),
          ),
          sprintReference,
        ];
      }
      if (data.verb === 'removed') {
        return [
          textPart(
            i18n.global.t(
              'workspaceNotifications.renders.sprint.removedWatcherFromTheSprint',
              { p0: getFullName(data.old_entity_detail) },
            ),
          ),
          sprintReference,
        ];
      }
      break;
  }

  return [];
};
