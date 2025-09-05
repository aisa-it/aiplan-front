import { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { QTableColumn } from 'quasar/dist/types/api/qtable';

export const columns: QTableColumn<DtoProjectLight>[] = [
  {
    name: 'name',
    label: 'Название',
    align: 'left',
    sortable: false,
    classes: 'full-width',
    field: (row) => row.name,
  },
  {
    name: 'role',
    label: 'Роль',
    align: 'left',
    sortable: false,
    field: (row) => row,
  },
  {
    name: 'isMember',
    label: '',
    align: 'left',
    sortable: false,
    field: (row) => row,
  },
];
