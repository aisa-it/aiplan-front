import type { DtoIssueWithCount, TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Issues } from '@aisa-it/aiplan-api-ts/src/Issues';
import { withInterceptors } from '@/utils/interceptorsWithInstanceClass';
import { dayKey } from './calendar-dates';

export const EVENT_TYPES = {
  created: { field: 'created_at', color: '#3F76FF' },
  target: { field: 'target_date', color: '#05BD8D' },
  completed: { field: 'completed_at', color: '#F2994A' },
} as const;

export type EventType = keyof typeof EVENT_TYPES;
export const eventTypes = Object.keys(EVENT_TYPES) as EventType[];

export interface CalendarEvent {
  id: string;
  type: EventType;
  day: string;
  issueId: string;
}

export interface CalendarFilters {
  authors: string[];
  assignees: string[];
  watchers: string[];
  labels: string[];
  states: string[];
  priorities: string[];
  onlyActive: boolean;
}

export const createCalendarFilters = (): CalendarFilters => ({
  authors: [],
  assignees: [],
  watchers: [],
  labels: [],
  states: [],
  priorities: [],
  onlyActive: false,
});

const issuesApi = new (withInterceptors(Issues))();

export interface CalendarRequest {
  types: EventType[];
  range: { start: Date; end: Date };
  filters: CalendarFilters;
  projectId: string;
  workspaceId?: string;
}

export async function loadCalendarEvents(
  { types, range, filters, projectId, workspaceId }: CalendarRequest,
  signal: AbortSignal,
) {
  const { onlyActive, ...searchFilters } = filters;
  const { start, end } = range;
  const results = await Promise.all(types.map(async (type) => {
    const { field } = EVENT_TYPES[type];
    const query = {
      ...searchFilters,
      projects: [projectId],
      ...(workspaceId ? { workspaces: [workspaceId] } : {}),
      [`${field}_from`]: start.getTime() / 1000,
      // The API compares inclusive whole seconds. Trim midnight locally.
      [`${field}_to`]: end.getTime() / 1000,
    };
    const { data } = await issuesApi.getIssueList(
      // The generated type describes FilterUUIDs as an object, but the API accepts arrays.
      query as unknown as TypesIssuesListFilters,
      { limit: -1, only_active: onlyActive },
      { signal },
    );
    return { type, issues: data.issues ?? [] };
  }));

  const issues = new Map<string, DtoIssueWithCount>();
  const byDay = new Map<string, CalendarEvent[]>();
  for (const result of results) {
    for (const issue of result.issues) {
      const field = EVENT_TYPES[result.type].field;
      const date = new Date(issue[field] ?? '');
      if (!issue.id || !(date >= start && date < end)) continue;
      issues.set(issue.id, issue);

      const day = dayKey(date);
      const event = { id: `${issue.id}:${result.type}`, type: result.type, day, issueId: issue.id };
      const events = byDay.get(day);
      if (events) events.push(event);
      else byDay.set(day, [event]);
    }
  }
  return { issues, byDay };
}
