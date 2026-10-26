import type {
  NotificationActivityData,
  NotificationMessageData,
  NotificationMessagePart,
  NotificationPresentation,
  WorkspaceNotification,
} from '../models';
import { renderDocNotification } from './doc-notification';
import { renderIssueNotification } from './issue-notification';
import { renderMessageNotification } from './message-notification';
import {
  getFullName,
  getStringValue,
  linkPart,
  textPart,
} from './notification-render.helpers';
import { renderProjectNotification } from './project-notification';
import { renderSprintNotification } from './sprint-notification';
import { renderWorkspaceNotification } from './workspace-notification';

const getTitle = (notification: WorkspaceNotification) => {
  const data = notification.data as NotificationActivityData &
    NotificationMessageData;

  if (
    notification.type === 'message' ||
    notification.type === 'service_message'
  ) {
    return typeof data.title === 'string' ? data.title : '';
  }

  if (data.entity_type === 'doc' || data.field === 'doc') return 'АИДок';
  if (data.entity_type === 'workspace') return 'Настройки пространства';
  if (data.entity_type === 'sprint') {
    return notification.detail.sprint?.name ?? '';
  }

  return notification.detail.project?.name ?? '';
};

const renderActivityNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationActivityData;

  if (data.field === 'completed_at') {
    return [textPart('завершил(-а) задачу')];
  }

  if (data.field === 'form_answers') {
    const form = notification.detail.form;
    return [
      textPart('прошёл(-ла) форму '),
      linkPart(`"${form?.title ?? ''}"`, form?.url),
    ];
  }

  if (data.entity_type === 'issue' || notification.type === 'comment') {
    return renderIssueNotification(notification);
  }
  if (data.entity_type === 'sprint') {
    return renderSprintNotification(notification);
  }
  if (data.entity_type === 'workspace') {
    return renderWorkspaceNotification(notification);
  }
  if (data.entity_type === 'project') {
    return renderProjectNotification(notification);
  }
  if (data.entity_type === 'doc') {
    return renderDocNotification(notification);
  }

  return [];
};

export const getNotificationPresentation = (
  notification: WorkspaceNotification,
): NotificationPresentation => {
  const data = notification.data as NotificationActivityData;
  const isActivity =
    notification.type === 'activity' || notification.type === 'comment';
  const workspaceName =
    data.entity_type === 'workspace' && data.field === 'name'
      ? getStringValue(data.old_value)
      : notification.detail.workspace?.name;

  return {
    actorName: notification.detail.user
      ? getFullName(notification.detail.user, data.entity_type)
      : undefined,
    parts:
      notification.type === 'message' ||
      notification.type === 'service_message'
        ? renderMessageNotification(notification)
        : isActivity
          ? renderActivityNotification(notification)
          : [],
    title: getTitle(notification),
    workspaceName,
  };
};
