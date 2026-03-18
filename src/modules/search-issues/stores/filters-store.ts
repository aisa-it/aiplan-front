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
    filterIdFromRoute: null as string | null,
  }),
  actions: {
    setFilterId(filterId: string | null) {
      this.filterIdFromRoute = filterId;
    },
  },
});
