import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

import { TIMEZONES, type TimezoneKey } from '@/constants/timezones';

dayjs.locale('ru');
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);

export const formatTime = (date: string | Date, userTimezone?: string) => {
  return userTimezone
    ? dayjs(date).tz(userTimezone).format('HH:mm')
    : dayjs(date).format('HH:mm');
};

export const getTimezoneKey = (
  timezone: string | undefined,
): TimezoneKey | undefined => TIMEZONES.find((t) => t.value === timezone)?.key;

export const formatDateTime = (date: string | Date, userTimezone?: string) => {
  return userTimezone
    ? dayjs(date).tz(userTimezone).format('DD.MM.YYYY HH:mm')
    : dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const formatRelativeTime = (date: string | Date) =>
  dayjs(date).fromNow().toLowerCase();

export const isTodayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return isToday;
};

export const isCurrentDateInMonthRange = (
  month: number,
  fromDay: number,
  toDay: number,
): boolean => {
  const now = dayjs();

  const currentMonth = now.month() + 1;
  const currentDay = now.date();

  return currentMonth === month && currentDay >= fromDay && currentDay <= toDay;
};
