import { defineStore } from 'pinia';
import { CalendarEvent } from '../types/calendar';

function formatDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
