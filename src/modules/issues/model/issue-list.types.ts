import type {
  DtoIssueWithCount,
  DtoIssue,
  DtoStateLight,
  TypesIssuesListFilters,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const ISSUE_COLUMN_KEYS = [
  'sequence_id',
  'name',
  'priority',
  'state',
  'target_date',
  'created_at',
  'updated_at',
  'author',
  'assignees',
  'watchers',
  'labels',
  'sub_issues_count',
  'linked_issues_count',
  'link_count',
  'attachment_count',
  'sprint',
] as const;

export type StandardIssueColumnKey = (typeof ISSUE_COLUMN_KEYS)[number];
export type IssueColumnKey = StandardIssueColumnKey | `property:${string}`;

export type EditableIssueField = 'name' | 'priority' | 'state' | 'target_date';
export type IssuePermissionField = EditableIssueField | 'sprints';
export type IssueFieldPatch = Partial<
  Pick<DtoIssueWithCount, EditableIssueField>
>;

export interface IssueListActions {
  canEdit(issue: DtoIssueWithCount, field: IssuePermissionField): boolean;
  update(issue: DtoIssueWithCount, patch: IssueFieldPatch): Promise<DtoIssue>;
  getAvailableStates(issue: DtoIssueWithCount): Promise<DtoStateLight[]>;
  updateViewSettings(
    settings: TypesViewProps,
    options?: { optimistic?: boolean },
  ): Promise<void>;
}

export interface ProjectIssueListScope {
  type: 'project';
  workspaceSlug: string;
  projectId: string;
}

export interface IssueListQuery {
  page: number;
  rowsPerPage: number;
  sortBy: IssueColumnKey;
  descending: boolean;
  hideSubIssues: boolean;
  onlyActive: boolean;
  draft: boolean;
  includeProperties: boolean;
}

export interface IssueListResult {
  items: DtoIssueWithCount[];
  total: number;
}

export interface IssueListSource {
  load(
    filters: TypesIssuesListFilters,
    query: IssueListQuery,
    signal?: AbortSignal,
  ): Promise<IssueListResult>;
}

export interface IssueListInitialState {
  query: IssueListQuery;
  filters: TypesIssuesListFilters;
  columns: IssueColumnKey[];
}

export type IssueListViewSettings = TypesViewProps | undefined;
