import {
  formatDateTime,
  formatRelativeTime,
  isTodayDate,
} from '@/utils/time';

export const formatActivityDate = (date: string) =>
  isTodayDate(date)
    ? formatRelativeTime(date)
    : formatDateTime(date);
