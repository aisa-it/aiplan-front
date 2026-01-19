import { defineStore } from 'pinia';
import { CalendarEventType } from '../types/calendar';

export const useCalendarFiltersStore = defineStore('calendar-filters', {
  state: () => ({
    enabledTypes: new Set<CalendarEventType>([
      'created',
      'target',
      'completed',
      'canceled',
    ]),
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
