import type { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type {
  IssueColumnKey,
  IssueListInitialState,
  IssueListViewSettings,
} from './issue-list.types';
import { ISSUE_COLUMN_KEYS } from './issue-list.types';

export const DEFAULT_VISIBLE_ISSUE_COLUMNS = ISSUE_COLUMN_KEYS.filter(
  (column) => column !== 'sequence_id' && column !== 'project',
);

export const DEFAULT_PROJECT_ISSUE_VIEW_SETTINGS: TypesViewProps = {
  showEmptyGroups: false,
  hideSubIssues: false,
  showOnlyActive: false,
  autoSave: false,
  issueView: 'list',
  filters: {
    order_by: 'sequence_id',
    group_by: 'none',
    orderDesc: true,
    states: [],
    workspaces: [],
    projects: [],
    assignedToMe: false,
    watchedToMe: false,
    authoredToMe: false,
  },
  group_tables_hide: {},
  columns_to_show: [...DEFAULT_VISIBLE_ISSUE_COLUMNS],
  page_size: 25,
  draft: true,
};

const isIssueColumnKey = (value: string): value is IssueColumnKey =>
  ISSUE_COLUMN_KEYS.includes(value as (typeof ISSUE_COLUMN_KEYS)[number]) ||
  value.startsWith('property:');

export const createIssueListInitialState = (
  settings: IssueListViewSettings,
): IssueListInitialState => {
  const selectedColumns = settings?.columns_to_show?.filter(isIssueColumnKey);
  const sortBy = settings?.filters?.order_by;
  const visibleColumns: readonly IssueColumnKey[] = selectedColumns
    ? selectedColumns
    : DEFAULT_VISIBLE_ISSUE_COLUMNS;
  const columns: IssueColumnKey[] = ['sequence_id', ...visibleColumns];

  return {
    query: {
      page: 1,
      rowsPerPage:
        settings?.page_size && settings.page_size > 0
          ? settings.page_size
          : 25,
      sortBy:
        sortBy && sortBy !== 'project' &&
          ISSUE_COLUMN_KEYS.includes(sortBy as (typeof ISSUE_COLUMN_KEYS)[number])
          ? (sortBy as IssueColumnKey)
          : 'sequence_id',
      descending: settings?.filters?.orderDesc ?? true,
      hideSubIssues: settings?.hideSubIssues ?? false,
      onlyActive: settings?.showOnlyActive ?? false,
      draft: settings?.draft ?? true,
      includeProperties: columns.some((column) => column.startsWith('property:')),
    },
    filters: {
      assigned_to_me: settings?.filters?.assignedToMe,
      authored_by_me: settings?.filters?.authoredToMe,
      watched_by_me: settings?.filters?.watchedToMe,
      states: settings?.filters?.states,
    },
    columns: [...new Set(columns)],
  };
};
