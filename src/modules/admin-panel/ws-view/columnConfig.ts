import { DtoWorkspaceWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { QTableColumn } from 'quasar/dist/types/api/qtable';
import { formatDateTime } from 'src/utils/time';

export const columns: QTableColumn<DtoWorkspaceWithCount>[] = [
  {
    name: 'avatar',
    label: 'Аватар',
    align: 'center',
    field: (row) => [row.logo, row.name],
  },
  {
    name: 'name',
    align: 'left',
    label: 'Имя',
    sortable: true,
    field: (row) => row.name_highlighted,
  },
  {
    name: 'total_projects',
    align: 'left',
    label: 'Кол-во проектов',
    sortable: true,
    field: (row) => row.total_projects,
  },
  {
    name: 'total_members',
    align: 'left',
    label: 'Кол-во участников',
    sortable: true,
    field: (row) => row.total_members,
  },
  {
    name: 'owner_id',
    align: 'left',
    label: 'Владелец',
    sortable: true,
    field: (row) =>
      `${row.owner?.last_name} ${row.owner?.first_name} ${row.owner?.email}`,
  },
  {
    name: 'created_at',
    label: 'Дата создания',
    align: 'left',
    sortable: true,
    field: (row) => formatDateTime(row.created_at ?? ''),
  },
  {
    name: 'updated_at',
    align: 'left',
    label: 'Дата посл. обновления',
    sortable: true,
    field: (row) => formatDateTime(row.updated_at ?? ''),
  },
  {
    name: 'settings',
    align: 'center',
    label: '',
    field: (row) => `${row.slug}/workspace-settings`,
  },
];
