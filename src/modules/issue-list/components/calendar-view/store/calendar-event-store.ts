import { defineStore } from 'pinia';
import { CalendarEvent, CalendarEventType } from '../types/calendar';
import { formatDayKey } from '../utils/calendarDates';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { api } from '../services/api';
import { mapIssueToCalendarEvents } from '../utils/mapIssuesToEvents';

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
        if (!map.has(event.issueData.id)) {
          map.set(event.issueData.id, []);
        }
        map.get(event.issueData.id)!.push(event);
      }

      return map;
    },
  },
  actions: {
    setEvents(events: CalendarEvent[]) {
      this.events = events;
    },

    async loadEvents(
      visibleRange: { from: Date; to: Date },
      enabledTypesArray: CalendarEventType[],
      filters: TypesIssuesListFilters,
    ) {
      const { from, to } = visibleRange;

      let issuesCreated: CalendarEvent[] = [];
      let issuesTarget: CalendarEvent[] = [];
      let issuesCompleted: CalendarEvent[] = [];

      if (enabledTypesArray.includes('created')) {
        issuesCreated = await getIssuesMappedIssues(
          {
            created_at_from: dateToSec(from),
            created_at_to: dateToSec(to),
          },
          'created',
          filters,
        );
      }

      if (enabledTypesArray.includes('target')) {
        issuesTarget = await getIssuesMappedIssues(
          {
            target_date_from: dateToSec(from),
            target_date_to: dateToSec(to),
          },
          'target',
          filters,
        );
      }

      if (enabledTypesArray.includes('completed')) {
        issuesCompleted = await getIssuesMappedIssues(
          {
            completed_at_from: dateToSec(from),
            completed_at_to: dateToSec(to),
          },
          'completed',
          filters,
        );
      }

      this.setEvents([...issuesCreated, ...issuesTarget, ...issuesCompleted]);
    },

    clear() {
      this.events = [];
    },
  },
});

async function getIssuesMappedIssues(
  fromToDates: any,
  type: CalendarEventType,
  filters: TypesIssuesListFilters,
): Promise<CalendarEvent[]> {
  const issues = await api.getIssues(
    {
      ...fromToDates,
      ...filters,
    },
    { limit: -1 },
  );
  return issues.map((issue) => mapIssueToCalendarEvents(issue, type));
}

const dateToSec = (date: Date) => {
  return date.getTime() / 1000;
};
