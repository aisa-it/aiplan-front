import { IPagination } from 'src/stores/issues-store';
import { IProject } from './projects';

export interface IIssueLabel {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
  color: string;
  created_by: string;
  updated_by: string;
  project: string;
  project_detail: any;
  workspace: string;
  workspace_detail: any;
  parent: string | null;
}

export interface IIssueFilters {
  authors?: string[];
  assignees?: string[];
  watchers?: string[];

  states?: string[];
  priorities?: string[];
  labels?: string[];
  workspaces?: string[];
  workspace_slugs?: string[];
  projects?: string[];

  assigned_to_me?: boolean;
  authored_by_me?: boolean;
  watched_by_me?: boolean;
  only_active?: boolean;

  search_query?: string;
}

export interface IIssueTransfer {
  target_project: string | IProject;
  linked_issues: boolean;
  delete_src: boolean;
}

export interface IIssueTransferParams {
  priority?: string | null;
  target_date?: string | null;
  assigner_ids?: string[] | null;
  watcher_ids?: string[] | null;
  state_id?: string;
}

export interface IIssueTransferById extends IIssueTransfer {
  src_issue?: string;
}

export interface IIssueTransferByLabel extends IIssueTransfer {
  src_label?: string;
}

export interface IQuasarPagination {
  pagination: IQuasarPaginationValues;
}

export interface IQuasarPaginationValues {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber: number;
}

export interface IIssueData {
  name?: string;
  description_html?: string;
  description_stripped?: string;
  description_type?: number;
  state?: string;
  assignees_list?: string[];
  watchers_list?: string[];
}

export interface IIssueCommentUpdate {
  content: string;
  text: string;
}

export interface IIssueSelectRequest extends IPagination {
  show_sub_issues: boolean;
  only_count: boolean;
  search_query: string;
}

export interface IIssueResponseData {
  count: number;
  limit: number;
  result: IIssueLabel[];
}
