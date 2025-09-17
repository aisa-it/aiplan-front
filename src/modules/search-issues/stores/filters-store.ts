import {
  DtoSearchFilterFull,
  DtoSearchFilterLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { defineStore } from 'pinia';
import { getFilterById } from '../services/api';

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
    filterIdFromRoute: null as string | null,
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
    setFilterId(filterId: string | null) {
      this.filterIdFromRoute = filterId;
    },
  },
});
