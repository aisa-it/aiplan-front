import { DtoReleaseNoteLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { QTableColumn } from 'quasar/dist/types/api/qtable';
import { formatDateTime } from 'src/utils/time';

export const columns: QTableColumn<DtoReleaseNoteLight>[] = [
  {
    name: 'tag_name',
    label: 'Версия',
    align: 'left',
    sortable: false,
    field: (row) => row.tag_name,
  },
  {
    name: 'published_at',
    label: 'Дата публикации',
    align: 'left',
    sortable: false,
    field: (row) => formatDateTime(row.published_at || ''),
  },
  {
    name: 'body',
    label: 'Описание',
    align: 'left',
    sortable: false,
    field: (row) => row,
  },
  {
    name: 'settings',
    label: '',
    align: 'center',
    sortable: false,
    field: (row) => row,
  },
];
