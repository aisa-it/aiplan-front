import { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export interface MiniCalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isInHighlightedWeek?: boolean;
  isInHighlightedBorderStart?: boolean;
  isInHighlightedBorderEnd?: boolean;
}

export type CalendarEventType = 'created' | 'target' | 'completed' | 'canceled';

export type CalendarTransitionDirection = 'forward' | 'backward';

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

  issueData: {
    id: string;
    title: string;
    indentifier: string;
    sequence_id: number;
    issueUrl?: string;
    state_detail: DtoStateLight;
    completed_at: string | null;
    created_at: string;
    target_date: string | null;
  };
}
