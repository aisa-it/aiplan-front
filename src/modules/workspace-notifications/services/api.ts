import {
  AiplanNotificationViewRequest,
  AiplanRequestMessage,
  DaoPaginationResponse,
  NotificationsNotificationResponse,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Notifications } from '@aisa-it/aiplan-api-ts/src/Notifications';
import { Workspace } from '@aisa-it/aiplan-api-ts/src/Workspace';
import { withInterceptors } from 'src/utils/interceptorsWithInstanceClass';

const notificationsApi = new (withInterceptors(Notifications))();
const workspaceApi = new (withInterceptors(Workspace))();
const getUserNotifications = async (data?: {
  offset?: number;
  limit?: number;
}): Promise<
  DaoPaginationResponse & {
    result?: NotificationsNotificationResponse[];
  }
> => {
  return notificationsApi.getMyNotificationList(data).then((res) => res.data);
};

const checkedUserNotifications = async (
  data: AiplanNotificationViewRequest,
): Promise<number> => {
  return notificationsApi
    .updateToReadMyNotifications(data)
    .then((res) => res.data.count || 0);
};

const sendWorkspaceNotification = async (
  workspaceSlug: string,
  data: AiplanRequestMessage,
): Promise<void> => {
  await workspaceApi.createMessageForWorkspaceMember(workspaceSlug, data);
};

export { getUserNotifications, checkedUserNotifications, sendWorkspaceNotification };
