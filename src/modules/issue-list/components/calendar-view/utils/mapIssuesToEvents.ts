import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { CALENDAR_EVENT_TYPES } from '../constants/event-types';
import { CalendarEvent } from '../types/calendar';

export function mapIssueToCalendarEvents(issue: DtoIssue): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  if (issue.created_at) {
    events.push(createEvent(issue, 'created', issue.created_at));
  }

  if (issue.target_date) {
    events.push(createEvent(issue, 'target', issue.target_date));
  }

  if (issue.completed_at) {
    events.push(createEvent(issue, 'completed', issue.completed_at));
  }

  // if (issue.canceled_at) {
  //   events.push(createEvent(issue, 'canceled', issue.canceled_at));
  // }

  return events;
}

function createEvent(
  issue: DtoIssue,
  type: keyof typeof CALENDAR_EVENT_TYPES,
  dateString: string,
): CalendarEvent {
  const config = CALENDAR_EVENT_TYPES[type];

  return {
    id: `${issue.id}:${type}`,
    issueId: issue.id ?? '',
    type,

    title: issue.name ?? '',
    date: new Date(dateString),

    color: config.color,
    isAllDay: true,

    issueUrl: issue.url,
  };
}
