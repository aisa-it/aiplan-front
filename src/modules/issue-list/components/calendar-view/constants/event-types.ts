import { CalendarEventFilter, CalendarEventType } from '../types/calendar';

export const CALENDAR_EVENT_TYPES: Record<
  CalendarEventType,
  CalendarEventFilter
> = {
  created: {
    type: 'created',
    label: 'Дата создания',
    color: '#26B5CE',
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
  canceled: {
    type: 'canceled',
    label: 'Дата отмены',
    color: '#DC3E3E',
  },
};
