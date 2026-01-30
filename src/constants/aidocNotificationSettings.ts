import {
  IDocNotificationsSettings,
  IWorkspaceNotificationSettings,
} from 'src/interfaces/aidocNotificationSettings';

export const INITIAL_AIDOC_NOTIFICATION_SETTINGS: IDocNotificationsSettings = {
  disable_doc_title: false,
  disable_doc_desc: false,
  disable_doc_role: false,
  disable_doc_attachment: false,
  disable_doc_comment: false,
  disable_doc_watchers: false,
  disable_doc_create: false,
  disable_doc_delete: false,
  disable_doc_move: false,
};

export const INITIAL_WORKSPACE_NOTIFICATION_SETTINGS: IWorkspaceNotificationSettings =
  {
    ...INITIAL_AIDOC_NOTIFICATION_SETTINGS,
    disable_workspace_project: false,
    disable_workspace_form: false,
    disable_workspace_doc: false,
    disable_workspace_name: false,
    disable_workspace_owner: false,
    disable_workspace_desc: false,
    disable_workspace_token: false,
    disable_workspace_logo: false,
    disable_workspace_member: false,
    disable_workspace_role: false,
    disable_workspace_integration: false,
  };
