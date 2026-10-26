import type { NotificationsNotificationDetailResponse } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export type KnownNotificationType =
  | 'activity'
  | 'comment'
  | 'message'
  | 'service_message';

export type NotificationType =
  | KnownNotificationType
  | (string & Record<never, never>);

export interface NotificationMessageData {
  msg?: string;
  title?: string;
  [key: string]: unknown;
}

export interface NotificationActivityData {
  comment_stripped?: string;
  entity_type?: string;
  field?: string;
  new_entity_detail?: unknown;
  new_identifier?: string;
  new_value?: unknown;
  old_entity_detail?: unknown;
  old_value?: unknown;
  verb?: string;
  [key: string]: unknown;
}

export type NotificationData =
  | NotificationActivityData
  | NotificationMessageData
  | Record<string, unknown>;

export interface WorkspaceNotification {
  created_at?: string;
  data: NotificationData;
  detail: NotificationsNotificationDetailResponse;
  id: string;
  type: NotificationType;
  viewed: boolean;
}

export interface NotificationTextPart {
  text: string;
  type: 'text';
}

export interface NotificationLinkPart {
  href: string;
  text: string;
  type: 'link';
}

export type NotificationMessagePart =
  | NotificationLinkPart
  | NotificationTextPart;

export interface NotificationPresentation {
  actorName?: string;
  parts: NotificationMessagePart[];
  title: string;
  workspaceName?: string;
}
