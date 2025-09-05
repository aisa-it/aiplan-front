export interface IImportJiraLinkType {
  id: string;
  name: string;
  self: string;
  inward: string;
  outward: string;
}

export interface IImportJiraPrioritiesItem {
  id: string;
  name: string;
  self: string;
  iconUrl: string;
  description: string;
  statusColor: string;
}

export interface IImportJiraAvatarUrls {
  '16x16': string;
  '24x24': string;
  '32x32': string;
  '48x48': string;
}

export interface IImportJiraIssueType {
  id: string;
  name: string;
  self: string;
  iconUrl: string;
  subtask: boolean;
  avatarId: number;
  description: string;
}

export interface IImportJiraProjectCategory {
  id: string;
  name: string;
  self: string;
  description: string;
}

export interface IImportJiraProject {
  id: string;
  key: string;
  name: string;
  self: string;
  expand: string;
  projectTypeKey: string;
  avatarUrls: IImportJiraAvatarUrls;
  issueTypes: Array<IImportJiraIssueType>;
  projectCategory: IImportJiraProjectCategory;
}

export interface IImportJiraUserInfo {
  jira_url: string;
  username: string;
  token: string;
}

export interface IImportJiraPrioritiesMapping {
  high_id: string;
  low_id: string;
  medium_id: string;
  urgent_id: string;
  null_id: string;
}

export interface IImportJiraRequest extends IImportJiraUserInfo {
  priorities_mapping: IImportJiraPrioritiesMapping;
  target_workspace_id: string;
  block_link_id: string;
}

export interface IImportJiraInfo {
  link_types: Array<IImportJiraLinkType>;
  priorities: Array<IImportJiraPrioritiesItem>;
  projects: Array<IImportJiraProject>;
}

export interface IImportJiraStatusFailedAttachment {
  id: string;
  key: string;
  name: string;
  attachment_id: string;
}

export interface IImportJiraStatus {
  id: string;
  error: string;
  stage: string;
  end_at: string;
  finished: false;
  progress: number;
  global_progress: number;
  start_at: string;
  done_issues: number;
  project_key: string;
  total_issues: number;
  total_attachments: number;
  failed_attachments: Array<IImportJiraStatusFailedAttachment>;
  target_workspace_id: string;
  imported_attachments: number;
}
