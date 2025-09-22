export interface IDocNotificationsSettings {
  disable_doc_title?: boolean;
  disable_doc_desc?: boolean;
  disable_doc_role?: boolean;
  disable_doc_attachment?: boolean;
  disable_doc_comment?: boolean;
  disable_doc_watchers?: boolean;
  disable_doc_create?: boolean;
  disable_doc_delete?: boolean;
  disable_doc_move?: boolean;
}

export interface IWorkspaceNotificationSettings
  extends IDocNotificationsSettings {
  disable_workspace_project?: boolean;
  disable_workspace_form?: boolean;
  disable_workspace_doc?: boolean;
  disable_workspace_name?: boolean;
  disable_workspace_owner?: boolean;
  disable_workspace_desc?: boolean;
  disable_workspace_token?: boolean;
  disable_workspace_logo?: boolean;
  disable_workspace_member?: boolean;
  disable_workspace_role?: boolean;
  disable_workspace_integration?: boolean;
}

export interface AiplanWorkspaceNotificationRequest {
  notification_author_settings_app?: IWorkspaceNotificationSettings;
  notification_author_settings_email?: IWorkspaceNotificationSettings;
  notification_author_settings_tg?: IWorkspaceNotificationSettings;
  notification_settings_app?: IWorkspaceNotificationSettings;
  notification_settings_email?: IWorkspaceNotificationSettings;
  notification_settings_tg?: IWorkspaceNotificationSettings;
}
