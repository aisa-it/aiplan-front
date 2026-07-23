import { CalendarEventFilter, CalendarEventType } from '../types/calendar';

export const CALENDAR_EVENT_TYPES: Record<
  CalendarEventType,
  CalendarEventFilter
> = {
  created: {
    type: 'created',
    label: 'Дата создания',
    color: '#3F76FF',
  },
  target: {
    type: 'target',
    label: 'Срок исполнения',
    color: '#05BD8D',
  },
  completed: {
    type: 'completed',
    label: 'Дата завершения',
    color: '#F2994A',
  },
};
