import { Notifications } from '@aisa-it/aiplan-api-ts/src/Notifications';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import type {
  AiplanRequestMessage,
  NotificationsNotificationResponse,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import type { NotificationsPageParams } from '../models';
import { mapNotification } from './notification.mapper';

const notificationsApi = new (withInterceptors(Notifications))();
const workspaceApi = new (withInterceptors(Workspace))();

export const NotificationsService = {
  async getNotifications(params?: NotificationsPageParams) {
    const response = await notificationsApi.getMyNotificationList(params);
    const notifications = (response.data.result ??
      []) as NotificationsNotificationResponse[];

    return notifications
      .map(mapNotification)
      .filter((notification) => notification !== undefined);
  },

  async markAsRead(ids: string[]) {
    const response = await notificationsApi.updateToReadMyNotifications({
      ids,
      viewed_all: false,
    });

    return response.data.count ?? 0;
  },

  async markAllAsRead() {
    const response = await notificationsApi.updateToReadMyNotifications({
      viewed_all: true,
    });

    return response.data.count ?? 0;
  },

  async sendWorkspaceNotification(
    workspaceSlug: string,
    data: AiplanRequestMessage,
  ) {
    await workspaceApi.createMessageForWorkspaceMember(workspaceSlug, data);
  },
};
