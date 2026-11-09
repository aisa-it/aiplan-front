import type { NotificationsNotificationResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import type { WorkspaceNotification } from '../models';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const mapNotification = (
  notification: NotificationsNotificationResponse,
): WorkspaceNotification | undefined => {
  if (!notification.id) return;

  return {
    created_at: notification.created_at,
    data: isRecord(notification.data) ? notification.data : {},
    detail: notification.detail ?? {},
    id: notification.id,
    type: notification.type ?? '',
    viewed: notification.viewed ?? false,
  };
};
