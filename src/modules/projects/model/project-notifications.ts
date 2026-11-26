import type {
  AiplanProjectNotificationRequest,
  DtoProjectMemberWithLead,
  TypesProjectMemberNS,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export type ProjectNotificationTarget = {
  workspaceSlug: string;
  projectId: string;
  projectName: string;
  kind: 'task' | 'project';
};

export const notificationChannels = ['email', 'tg', 'app'] as const;
export type NotificationChannel = (typeof notificationChannels)[number];

export const notificationMuteKeys = {
  email: 'email_notification_mute',
  tg: 'telegram_notification_mute',
  app: 'app_notification_mute',
} as const;

export const notificationFields = {
  task: [
    'disable_name',
    'disable_desc',
    'disable_state',
    'disable_assignees',
    'disable_watchers',
    'disable_priority',
    'disable_issue_new',
    'disable_parent',
    'disable_blocks',
    'disable_blockedBy',
    'disable_targetDate',
    'disable_labels',
    'disable_links',
    'disable_comments',
    'disable_attachments',
    'disable_issue_transfer',
    'disable_sub_issue',
    'disable_linked',
    'disable_deadline',
  ],
  project: [
    'disable_project_name',
    'disable_project_logo',
    'disable_project_identifier',
    'disable_project_public',
    'disable_project_owner',
    'disable_project_default_assignee',
    'disable_project_default_watcher',
    'disable_project_member',
    'disable_project_role',
    'disable_project_status',
    'disable_project_label',
  ],
} as const satisfies Record<ProjectNotificationTarget['kind'], readonly (keyof TypesProjectMemberNS)[]>;

export type NotificationField =
  (typeof notificationFields)[ProjectNotificationTarget['kind']][number];
export type NotificationSettingsKey = keyof AiplanProjectNotificationRequest;

export function copyNotificationSettings(membership: DtoProjectMemberWithLead) {
  const draft: Partial<Record<NotificationSettingsKey, TypesProjectMemberNS>> = {};
  for (const channel of notificationChannels) {
    const member = `notification_settings_${channel}` as const;
    const author = `notification_author_settings_${channel}` as const;
    if (membership[member]) draft[member] = { ...membership[member] };
    if (membership[author]) draft[author] = { ...membership[author] };
  }
  return draft;
}
