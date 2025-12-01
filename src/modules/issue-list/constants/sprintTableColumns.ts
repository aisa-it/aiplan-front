import { allColumns } from './tableColumns';

export const allSprintColumns = [
  ...allColumns,
  {
    name: 'project',
    label: 'Проект',
    align: 'left',
    field: (row: any) => {
      return row.project_detail.name;
    },
    sortable: true,
  },
];
