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
  'labels',
  'sub_issues_count',
  'linked_issues_count',
  'link_count',
  'attachment_count',
  'sprint',
] as const;

export type IssueColumnKey = (typeof ISSUE_COLUMN_KEYS)[number];

export type EditableIssueField = 'priority' | 'state' | 'target_date';
export type IssueFieldPatch = Partial<
  Pick<DtoIssueWithCount, EditableIssueField>
>;

export interface IssueListActions {
  canEdit(issue: DtoIssueWithCount, field: EditableIssueField): boolean;
  update(issue: DtoIssueWithCount, patch: IssueFieldPatch): Promise<DtoIssue>;
  getAvailableStates(issue: DtoIssueWithCount): Promise<DtoStateLight[]>;
}

export interface ProjectIssueListScope {
  type: 'project';
  workspaceSlug: string;
  projectId: string;
  projectIdentifier: string;
}

export type IssueListScope = ProjectIssueListScope;

export interface IssueListQuery {
  page: number;
  rowsPerPage: number;
  sortBy: IssueColumnKey;
  descending: boolean;
  hideSubIssues: boolean;
  onlyActive: boolean;
}

export interface IssueListResult {
  items: DtoIssueWithCount[];
  total: number;
}

export interface IssueListSource {
  readonly scope: IssueListScope;
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
