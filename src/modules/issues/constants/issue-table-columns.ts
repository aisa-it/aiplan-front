import type { IssueColumnKey } from '../model/issue-list.types';

export type IssueTableColumnWidth = number | string;

export interface IssueTableColumn {
  key: IssueColumnKey;
  title: string;
  width: IssueTableColumnWidth;
  minWidth: IssueTableColumnWidth;
  maxWidth: IssueTableColumnWidth;
  align?: 'start' | 'center';
  fixed?: boolean;
  sortable?: boolean;
  headerProps?: { class: string };
}

export const ISSUE_COUNT_COLUMN_KEYS = [
  'sub_issues_count',
  'linked_issues_count',
  'link_count',
  'attachment_count',
] as const satisfies readonly IssueColumnKey[];

export type IssueCountColumnKey = (typeof ISSUE_COUNT_COLUMN_KEYS)[number];

const fixedWidth = (width: IssueTableColumnWidth) => ({
  width,
  minWidth: width,
  maxWidth: width,
});

const countColumn = (
  key: IssueCountColumnKey,
  title: string,
): IssueTableColumn => ({
  key,
  title,
  ...fixedWidth(95),
  align: 'center',
  sortable: true,
  headerProps: { class: 'issue-count-header' },
});

export const ISSUE_TABLE_COLUMNS: Record<IssueColumnKey, IssueTableColumn> = {
  sequence_id: {
    key: 'sequence_id',
    title: 'ID',
    ...fixedWidth('var(--issue-table-id-column-width)'),
    fixed: true,
    sortable: true,
  },
  name: {
    key: 'name',
    title: 'Название',
    ...fixedWidth('var(--issue-table-wide-column-width)'),
    sortable: true,
  },
  priority: {
    key: 'priority',
    title: 'Приоритет',
    ...fixedWidth(200),
    sortable: true,
  },
  state: {
    key: 'state',
    title: 'Статус',
    ...fixedWidth(200),
    sortable: true,
  },
  target_date: {
    key: 'target_date',
    title: 'Срок исполнения',
    ...fixedWidth(230),
    sortable: true,
  },
  created_at: {
    key: 'created_at',
    title: 'Дата создания',
    ...fixedWidth(180),
    sortable: true,
  },
  updated_at: {
    key: 'updated_at',
    title: 'Последнее изменение',
    ...fixedWidth(200),
    sortable: true,
  },
  author: {
    key: 'author',
    title: 'Автор',
    ...fixedWidth(100),
    sortable: true,
  },
  assignees: {
    key: 'assignees',
    title: 'Исполнитель',
    ...fixedWidth(180),
    align: 'center',
    sortable: true,
  },
  labels: {
    key: 'labels',
    title: 'Теги',
    ...fixedWidth('var(--issue-table-wide-column-width)'),
    sortable: true,
  },
  sub_issues_count: countColumn('sub_issues_count', 'Подзадачи'),
  linked_issues_count: countColumn('linked_issues_count', 'Связи'),
  link_count: countColumn('link_count', 'Ссылки'),
  attachment_count: countColumn('attachment_count', 'Вложения'),
  sprint: {
    key: 'sprint',
    title: 'Спринт',
    ...fixedWidth(200),
  },
};
