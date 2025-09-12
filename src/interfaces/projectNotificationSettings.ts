export interface IProjectNotificationSettings {
  disable_name: boolean;
  disable_desc: boolean;
  disable_state: boolean;
  disable_assignees: boolean;
  disable_watchers: boolean;
  disable_priority: boolean;
  disable_parent: boolean;
  disable_blocks: boolean;
  disable_blockedBy: boolean;
  disable_targetDate: boolean;
  disable_labels: boolean;
  disable_links: boolean;
  disable_comments: boolean;
  disable_attachments: boolean;
  disable_deadline: boolean;
  disable_issue_transfer: boolean;
  disable_linked: boolean;
  disable_sub_issue: boolean;
  disable_issue_new: false;
  notify_before_deadline: null | Date;
}
