import type { WorkspaceNotification } from './notification.types';

export type NotificationTab = 'read' | 'unread';

export interface NotificationsPageParams {
  limit: number;
  offset: number;
}

export interface NotificationsPaginationState {
  hasMoreRead: boolean;
  hasMoreUnread: boolean;
  offset: number;
}

export interface NotificationsListState {
  activeTab: NotificationTab;
  hasNewNotifications: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isOpen: boolean;
  notifications: WorkspaceNotification[];
  pagination: NotificationsPaginationState;
  unreadCount: number;
}

export interface NotificationDateRow {
  date: string;
  key: string;
  label: string;
  type: 'date';
}

export interface NotificationItemRow {
  key: string;
  notification: WorkspaceNotification;
  type: 'notification';
}

export type NotificationListRow = NotificationDateRow | NotificationItemRow;
