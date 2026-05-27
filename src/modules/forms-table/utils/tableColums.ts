import { QTableColumn } from 'quasar';
import { IForms } from 'src/interfaces/forms';
import { formatDate } from 'src/utils/time';

export const formsTableColumns: QTableColumn<IForms>[] = [
  {
    name: 'title',
    align: 'left',
    label: 'Название',
    sortable: true,
    field: (row) => row.title ?? '-',
  },
  {
    name: 'slug',
    align: 'left',
    label: 'Идентификатор',
    sortable: true,
    field: (row) => row.slug ?? '-',
  },
  {
    name: 'end_date',
    align: 'left',
    label: 'Дата окончания',
    sortable: true,
    field: (row) => row.end_date ?? '',
    format: (val) => (val ? formatDate(val) : '-'),
  },
  {
    name: 'fields_count',
    align: 'center',
    label: 'Кол-во вопросов',
    sortable: true,
    field: (row) => row.fields?.length ?? 0,
  },
  {
    name: 'copy_link',
    align: 'center',
    label: 'Ссылка',
    field: (row) => row,
  },
];