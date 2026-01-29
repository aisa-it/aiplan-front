import { defineStore } from 'pinia';
import { CalendarEvent, CalendarEventType } from '../types/calendar';
import { formatDayKey } from '../utils/calendarDates';

export const useCalendarEventStore = defineStore('calendar-events', {
  state: () => ({
    events: [] as CalendarEvent[],
    isLoading: false,
  }),
  getters: {
    eventsByDay: (state) => {
      const map = new Map<string, CalendarEvent[]>();

      for (const event of state.events) {
        const key = formatDayKey(event.date);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(event);
      }

      return map;
    },

    eventsForYear: (state) => {
      const map = new Map<string, Set<CalendarEventType>>();

      for (const event of state.events) {
        const key = formatDayKey(event.date);
        if (!map.has(key)) map.set(key, new Set<CalendarEventType>());
        map.get(key)!.add(event.type);
      }

      return map;
    },

    eventsByIssueId: (state) => {
      const map = new Map<string, CalendarEvent[]>();

      for (const event of state.events) {
        if (!map.has(event.issueId)) {
          map.set(event.issueId, []);
        }
        map.get(event.issueId)!.push(event);
      }

      return map;
    },
  },
  actions: {
    setEvents(events: CalendarEvent[]) {
      this.events = events;
    },

    clear() {
      this.events = [];
    },
  },
});
