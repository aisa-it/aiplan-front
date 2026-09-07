import { formatDate, formatDateTime } from 'src/utils/time';
import { DtoProjectPropertyTemplate } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// имя колонки дополнительного параметра: property:<uuid шаблона>
// (тот же формат, что у group_by по параметру)
export const PROPERTY_COLUMN_PREFIX = 'property:';

export const isPropertyColumn = (name?: string) =>
  !!name?.startsWith(PROPERTY_COLUMN_PREFIX);

// выбрана ли хоть одна колонка дополнительного параметра — тогда список
// задач запрашивается с include_properties=true
export const hasPropertyColumns = (columnsToShow?: (string | any)[]) =>
  !!columnsToShow?.some((c) => isPropertyColumn(c?.name ?? c));

export interface PropertyColumn {
  name: string;
  label: string;
  align: 'left';
  sortable: false;
  // шаблон, по которому ячейка находит значение в row.properties
  property: DtoProjectPropertyTemplate;
  field: (row: any) => any;
}

// колонки дополнительных параметров по шаблонам проекта; значение берётся из
// row.properties (приходит с бэка по include_properties=true)
export const buildPropertyColumns = (
  templates: DtoProjectPropertyTemplate[],
): PropertyColumn[] =>
  (templates ?? [])
    .filter((t) => t?.id && t?.name)
    .slice()
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
    .map((t) => ({
      name: `${PROPERTY_COLUMN_PREFIX}${t.id}`,
      label: t.name as string,
      align: 'left',
      sortable: false,
      property: t,
      field: (row: any) =>
        row?.properties?.find((p: any) => p.template_id === t.id)?.value ??
        null,
    }));

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
    name: 'priority',
    align: 'left',
    label: 'Приоритет',
    field: (row: any) => {
      return row.priority || 'Нет';
    },
    sortable: true,
  },
  {
    name: 'state',
    align: 'left',
    label: 'Статус',
    field: (row: any) => {
      return row.state;
    },
    sortable: true,
  },
  {
    name: 'target_date',
    align: 'left',
    label: 'Срок исполнения',
    field: (row: any) => {
      return row.target_date ? formatDate(row.target_date) : '-';
    },
    sortable: true,
  },
  {
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    sortable: true,
  },
  {
    name: 'updated_at',
    align: 'left',
    label: 'Последнее изменение',
    field: (row: any) => {
      return formatDateTime(row.updated_at);
    },
    sortable: true,
  },
  {
    name: 'author',
    align: 'left',
    label: 'Автор',
    field: (row: any) => {
      return row.author_detail;
    },
    sortable: true,
  },
  {
    name: 'assignees',
    align: 'center',
    label: 'Исполнитель',
    field: (row: any) => {
      return row.assignee_details;
    },
    sortable: true,
  },
  {
    name: 'labels',
    align: 'left',
    label: 'Теги',
    field: (row: any) => {
      return row.label_details;
    },
    sortable: true,
  },
  {
    name: 'sub_issues_count',
    align: 'center',
    label: 'Подзадачи',
    field: (row: any) => {
      return row.sub_issues_count;
    },
    sortable: true,
  },
  {
    name: 'linked_issues_count',
    align: 'center',
    label: 'Связи',
    field: (row: any) => {
      return row.linked_issues_count;
    },
    sortable: true,
  },
  {
    name: 'link_count',
    align: 'center',
    label: 'Ссылки',
    field: (row: any) => {
      return row.link_count;
    },
    sortable: true,
  },
  {
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
