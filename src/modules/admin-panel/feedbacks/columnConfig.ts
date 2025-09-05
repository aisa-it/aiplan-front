import { DtoUserFeedback } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { QTableColumn } from 'quasar/dist/types/api/qtable';

export const columns: QTableColumn<DtoUserFeedback>[] = [
  {
    name: 'last_name',
    label: 'Пользователь',
    align: 'left',
    sortable: true,
    field: (row: DtoUserFeedback) =>
      `${row.user_detail?.last_name} ${row.user_detail?.first_name}`,
  },
  {
    name: 'email',
    align: 'left',
    label: 'Email',
    sortable: true,
    field: (row: DtoUserFeedback) => row.user_detail?.email,
  },
  {
    name: 'stars',
    align: 'left',
    label: 'Рейтинг',
    sortable: true,
    field: (row: DtoUserFeedback) => row.stars,
  },
  {
    name: 'feedback',
    label: 'Описание',
    align: 'left',
    sortable: true,
    style:
      'max-width: 100px; text-overflow: ellipsis; white-space: nowrap;overflow: hidden;',
    field: (row: DtoUserFeedback) => row.feedback,
  },
];
