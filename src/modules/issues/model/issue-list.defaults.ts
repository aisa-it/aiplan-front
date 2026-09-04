import type {
  IssueColumnKey,
  IssueListInitialState,
  IssueListViewSettings,
} from './issue-list.types';
import { ISSUE_COLUMN_KEYS } from './issue-list.types';

export const DEFAULT_VISIBLE_ISSUE_COLUMNS = ISSUE_COLUMN_KEYS.filter(
  (column) => column !== 'sequence_id',
);

const isIssueColumnKey = (value: string): value is IssueColumnKey =>
  ISSUE_COLUMN_KEYS.includes(value as IssueColumnKey);

export const createIssueListInitialState = (
  settings: IssueListViewSettings,
): IssueListInitialState => {
  const selectedColumns = settings?.columns_to_show?.filter(isIssueColumnKey);
  const sortBy = settings?.filters?.order_by;
  const visibleColumns: readonly IssueColumnKey[] = selectedColumns?.length
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
      sortBy: sortBy && isIssueColumnKey(sortBy) ? sortBy : 'sequence_id',
      descending: settings?.filters?.orderDesc ?? true,
      hideSubIssues: settings?.hideSubIssues ?? false,
      onlyActive: settings?.showOnlyActive ?? false,
      draft: settings?.draft ?? true,
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
