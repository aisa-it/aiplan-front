import { QTableColumn } from 'quasar/dist/types/api/qtable';
import { formatDate } from 'src/utils/time';
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const columns: QTableColumn<DtoProject>[] = [
  {
    name: 'identifier',
    label: 'Идентификатор проекта',
    align: 'left',
    sortable: true,
    field: (row) => row.identifier,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Имя',
    sortable: true,
    field: (row) => row.name_highlighted,
  },
  {
    name: 'total_members',
    align: 'left',
    label: 'Кол-во участников',
    sortable: true,
    field: (row) => row.total_members,
  },
  {
    name: 'project_lead',
    align: 'left',
    label: 'Лидер проекта',
    sortable: true,
    field: (row) =>
      `${row.project_lead_detail?.last_name} ${row.project_lead_detail?.first_name} ${row.project_lead_detail?.email}`,
  },
  {
    name: 'created_at',
    label: 'Дата создания',
    align: 'left',
    sortable: true,
    field: (row) => formatDate(row.created_at || ''),
  },
  {
    name: 'updated_at',
    label: 'Дата посл. обновления',
    align: 'left',
    sortable: true,
    field: (row) => formatDate(row.updated_at || ''),
  },
  {
    name: 'settings',
    align: 'center',
    label: '',
    field: (row) => [row.workspace_detail?.slug, row.id],
  },
];
