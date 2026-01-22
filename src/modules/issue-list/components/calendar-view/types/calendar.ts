export interface MiniCalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isInHighlightedWeek: boolean;
  isInHighlightedBorderStart: boolean;
  isInHighlightedBorderEnd: boolean;
}

export type CalendarEventType = 'created' | 'target' | 'completed' | 'canceled';

export interface CalendarEventFilter {
  type: CalendarEventType;
  label: string;
  color: string;
}

export interface CalendarEvent {
  id: string;
  issueId: string;
  type: CalendarEventType;

  title: string;
  date: Date;

  color: string;
  isAllDay: boolean;

  issueUrl?: string;
}
