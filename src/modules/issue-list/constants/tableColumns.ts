import { formatDate, formatDateTime } from 'src/utils/time';

export const allColumns = [
  {
    name: 'sequence_id',
    label: 'ID',
    align: 'left',
    exclude: true,
    field: (row: any) => {
      return [row.project_detail.identifier, row.sequence_id];
    },
    sortable: true,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Название',
    field: (row: any) => {
      return `${row?.name}`;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'priority',
    align: 'left',
    label: 'Приоритет',
    field: (row: any) => {
      return row.priority || 'Нет';
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'state',
    align: 'left',
    label: 'Статус',
    field: (row: any) => {
      return row.state;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'target_date',
    align: 'left',
    label: 'Срок исполнения',
    field: (row: any) => {
      return row.target_date ? formatDate(row.target_date) : '-';
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'updated_at',
    align: 'left',
    label: 'Последнее изменение',
    field: (row: any) => {
      return formatDateTime(row.updated_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'author',
    align: 'left',
    label: 'Автор',
    field: (row: any) => {
      return row.author_detail;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'assignees',
    align: 'center',
    label: 'Исполнитель',
    field: (row: any) => {
      return row.assignee_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'labels',
    align: 'left',
    label: 'Теги',
    field: (row: any) => {
      return row.label_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'sub_issues_count',
    align: 'center',
    label: 'Подзадачи',
    field: (row: any) => {
      return row.sub_issues_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'linked_issues_count',
    align: 'center',
    label: 'Связи',
    field: (row: any) => {
      return row.linked_issues_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'link_count',
    align: 'center',
    label: 'Ссылки',
    field: (row: any) => {
      return row.link_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'attachment_count',
    align: 'center',
    label: 'Вложения',
    field: (row: any) => {
      return row.attachment_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'sprint',
    align: 'left',
    label: 'Спринт',
    field: (row: any) => {
      return row.sprints;
    },
    sortable: false,
  },
];
