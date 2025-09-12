import { IProjectNotificationSettings } from 'src/interfaces/projectNotificationSettings';

export const INITIAL_PROJECT_NOTIFICATION_SETTINGS: IProjectNotificationSettings =
  {
    disable_name: false,
    disable_desc: false,
    disable_state: false,
    disable_assignees: false,
    disable_watchers: false,
    disable_priority: false,
    disable_parent: false,
    disable_blocks: false,
    disable_blockedBy: false,
    disable_targetDate: false,
    disable_labels: false,
    disable_links: false,
    disable_comments: false,
    disable_attachments: false,
    disable_deadline: false,
    disable_issue_transfer: false,
    disable_linked: false,
    disable_sub_issue: false,
    disable_issue_new: false,
    notify_before_deadline: null,
  };
