import type {
  NotificationMessageData,
  NotificationMessagePart,
  WorkspaceNotification,
} from '../models';
import { linkPart, textPart } from './notification-render.helpers';

export const renderMessageNotification = (
  notification: WorkspaceNotification,
): NotificationMessagePart[] => {
  const data = notification.data as NotificationMessageData;
  const message = typeof data.msg === 'string' ? data.msg : '';
  const identifier = notification.detail.project?.identifier;
  const sequenceId = notification.detail.issue?.sequence_id;
  const issueHref = notification.detail.issue?.url;

  if (!identifier || sequenceId === undefined || !issueHref) {
    return [textPart(message)];
  }

  const issueKey = `${identifier}-${sequenceId}`;
  const issueIndex = message.indexOf(issueKey);

  if (issueIndex === -1) return [textPart(message)];

  return [
    textPart(message.slice(0, issueIndex)),
    linkPart(issueKey, issueHref),
    textPart(message.slice(issueIndex + issueKey.length)),
  ];
};
