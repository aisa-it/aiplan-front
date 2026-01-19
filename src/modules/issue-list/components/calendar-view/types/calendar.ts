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
