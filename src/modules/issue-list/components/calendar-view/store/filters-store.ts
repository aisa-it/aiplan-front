import { defineStore } from 'pinia';
import { CalendarEventType } from '../types/calendar';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const useCalendarFiltersStore = defineStore('calendar-filters', {
  state: () => ({
    enabledTypes: new Set<CalendarEventType>([
      'created',
      'target',
      'completed',
      'canceled',
    ]),
    filters: {} as TypesIssuesListFilters,
  }),

  getters: {
    isEnabled: (state) => (type: CalendarEventType) =>
      state.enabledTypes.has(type),

    enabledTypesArray: (state) => Array.from(state.enabledTypes),
  },

  actions: {
    toggle(type: CalendarEventType) {
      if (this.enabledTypes.has(type)) {
        this.enabledTypes.delete(type);
      } else {
        this.enabledTypes.add(type);
      }
    },
  },
});
