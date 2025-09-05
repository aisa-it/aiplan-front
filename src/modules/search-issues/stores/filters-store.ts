import {
  DtoSearchFilterFull,
  DtoSearchFilterLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { defineStore } from 'pinia';

export const useFiltersStore = defineStore('filters-store', {
  state: () => ({
    myFilterList: [] as DtoSearchFilterFull[],
    filterList: [] as DtoSearchFilterLight[],
    columnsToShow: {
      sequence_id: true,
      name: true,
      priority: true,
      state: true,
      target_date: true,
      created_at: true,
      updated_at: true,
      author: true,
      assignees: true,
      labels: true,
    },
  }),
  actions: {
    resetColumns() {
      return (this.columnsToShow = {
        sequence_id: true,
        name: true,
        priority: true,
        state: true,
        target_date: true,
        created_at: true,
        updated_at: true,
        author: true,
        assignees: true,
        labels: true,
      });
    },
  },
});
