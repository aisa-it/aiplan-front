import { IProjectView } from './projects';

export interface IUser {
  readonly id: string;
  readonly last_login: Date;
  telegram_id: number | null;
  avatar: string;
  avatar_id: string;
  username: string;
  mobile_number: string;
  email: string;
  first_name: string;
  last_name: string;
  readonly date_joined: Date;
  readonly created_at: Date;
  readonly updated_at: Date;
  readonly last_location: string;
  readonly created_location: string;
  last_workspace_slug?: string;
  fallback_workspace_slug?: string;
  is_email_verified: boolean;
  is_onboarded: boolean;
  is_active: boolean;
  is_superuser: boolean;
  is_staff: boolean;
  token: string;
  role: number;
  theme: {
    contrast: boolean;
    dark: boolean;
    open_in_new: boolean;
  };
  view_props: IProjectView;
  my_issues_prop?: {
    properties?: unknown;
    groupBy: unknown | null;
  };
  user_timezone?: string;
  status: string;
  status_emoji: string;
  status_end_date: string;
}

export interface IUserLite {
  readonly id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar: string;
  created_at: Date;
  is_bot: boolean;
}

export interface IUserDetailedActivity {
  actor: string;
  actor_detail: IUserLite;
  attachments: unknown[];
  comment: string;
  created_at: string;
  created_by: string | null;
  field: string;
  id: string;
  issue: string;
  issue_comment: string | null;
  new_identifier: string | null;
  new_value: string | null;
  old_identifier: string | null;
  old_value: string | null;
  project: string;
  updated_at: string;
  updated_by: string | null;
  verb: string;
  workspace: string;
}

export interface IUserActivityResponse {
  count: number;
  extra_stats: null;
  next_cursor: string;
  next_page_results: boolean;
  prev_cursor: string;
  prev_page_results: boolean;
  results: IUserDetailedActivity[];
  total_pages: number;
}

export interface IPassword {
  new_password: string;
  confirm_password: string;
}
