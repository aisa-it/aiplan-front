import { QTableColumn } from 'quasar/dist/types/api/qtable';
import { IActivity } from './interfaces/type';

//TODO обновить тип, когда появится контракт
export const columns: QTableColumn<IActivity>[] = [
  {
    name: 'activity',
    label: '',
    align: 'left',
    field: (row: any) => row,
  },
];
