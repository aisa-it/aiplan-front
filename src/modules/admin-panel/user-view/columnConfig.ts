import { QTableColumn } from 'quasar/dist/types/api/qtable';
import { formatDateTime } from 'src/utils/time';
import { activeStatus } from '../utils/active';
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const columns: QTableColumn<DtoUserLight>[] = [
  {
    name: 'last_name',
    label: 'Фамилия Имя',
    align: 'left',
    sortable: true,
    field: (row) => `${row?.last_name} ${row?.first_name}`,
  },
  {
    name: 'username',
    align: 'left',
    label: 'Юзернейм',
    sortable: true,
    field: (row) => row?.username,
  },
  {
    name: 'email',
    align: 'left',
    label: 'Email',
    sortable: true,
    field: (row) => row?.email,
  },
  {
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    sortable: true,
    field: (row) => (row.created_at ? formatDateTime(row.created_at) : ''),
  },
  {
    name: 'last_active',
    label: 'Последняя активность',
    align: 'left',
    sortable: true,
    field: (row) => (row?.last_active ? formatDateTime(row.last_active) : ''),
  },
  {
    name: 'is_superuser',
    align: 'left',
    label: 'Суперпользователь',
    sortable: true,
    field: (row) => [row.is_superuser, row.id],
  },
  {
    name: 'is_active',
    align: 'left',
    label: 'Статус',
    sortable: true,
    style: 'min-width: 90px',
    field: (row) => activeStatus(row),
  },
  {
    name: 'block',
    align: 'center',
    label: '',
    field: (row) => row,
  },
  {
    name: 'delete',
    align: 'center',
    label: '',
    field: (row) => row,
  },
];
