import { IssuesImportImportStatus } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { QTableColumn } from 'quasar/dist/types/api/qtable';

export const columns: QTableColumn<IssuesImportImportStatus>[] = [
  {
    name: 'last_name',
    label: 'Фамилия Имя',
    align: 'left',
    sortable: false,
    field: (row: IssuesImportImportStatus) =>
      `${row.actor_details?.last_name} ${row.actor_details?.first_name}`,
  },
  {
    name: 'username',
    align: 'left',
    label: 'Юзернейм',
    sortable: false,
    field: (row: IssuesImportImportStatus) => row.actor_details?.username,
  },
  {
    name: 'email',
    align: 'left',
    label: 'Email',
    sortable: false,
    field: (row: IssuesImportImportStatus) => row.actor_details?.email,
  },
  {
    name: 'project_key',
    align: 'left',
    label: 'Название',
    sortable: false,
    field: 'project_key',
  },
  {
    name: 'progress',
    align: 'left',
    label: 'Прогресс',
    sortable: false,
    field: (row: IssuesImportImportStatus) => `${row.progress} %`,
  },
];
