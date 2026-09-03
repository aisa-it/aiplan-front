import type { IssueColumnKey } from '../model/issue-list.types';

export interface IssueTableColumn {
  key: IssueColumnKey;
  title: string;
  width: number;
  align?: 'start' | 'center';
  fixed?: boolean;
  sortable?: boolean;
}

export const ISSUE_TABLE_COLUMNS: Record<IssueColumnKey, IssueTableColumn> = {
  sequence_id: {
    key: 'sequence_id',
    title: 'ID',
    width: 130,
    fixed: true,
    sortable: true,
  },
  name: {
    key: 'name',
    title: 'Название',
    width: 400,
    sortable: true,
  },
  priority: {
    key: 'priority',
    title: 'Приоритет',
    width: 200,
    sortable: true,
  },
  state: {
    key: 'state',
    title: 'Статус',
    width: 200,
    sortable: true,
  },
  target_date: {
    key: 'target_date',
    title: 'Срок исполнения',
    width: 230,
    sortable: true,
  },
  created_at: {
    key: 'created_at',
    title: 'Дата создания',
    width: 180,
    sortable: true,
  },
  updated_at: {
    key: 'updated_at',
    title: 'Последнее изменение',
    width: 200,
    sortable: true,
  },
  author: {
    key: 'author',
    title: 'Автор',
    width: 100,
    sortable: true,
  },
  assignees: {
    key: 'assignees',
    title: 'Исполнитель',
    width: 180,
    align: 'center',
    sortable: true,
  },
  labels: {
    key: 'labels',
    title: 'Теги',
    width: 400,
    sortable: true,
  },
  sub_issues_count: {
    key: 'sub_issues_count',
    title: 'Подзадачи',
    width: 95,
    align: 'center',
    sortable: true,
  },
  linked_issues_count: {
    key: 'linked_issues_count',
    title: 'Связи',
    width: 95,
    align: 'center',
    sortable: true,
  },
  link_count: {
    key: 'link_count',
    title: 'Ссылки',
    width: 95,
    align: 'center',
    sortable: true,
  },
  attachment_count: {
    key: 'attachment_count',
    title: 'Вложения',
    width: 95,
    align: 'center',
    sortable: true,
  },
  sprint: {
    key: 'sprint',
    title: 'Спринт',
    width: 200,
  },
};
