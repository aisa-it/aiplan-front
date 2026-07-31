import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { TIMEZONES } from '@/constants/timezones';

dayjs.locale('ru');
dayjs.extend(utc);
dayjs.extend(timezone);

export const formatTime = (date: string | Date, userTimezone?: string) => {
  return userTimezone
    ? dayjs(date).tz(userTimezone).format('HH:mm')
    : dayjs(date).format('HH:mm');
};

export const getCityFromTimezone = (timezone: string | undefined) => {
  const tz = TIMEZONES.find((t) => t.value === timezone);
  if (!tz) return '';
  const labelParts = tz.label.split(' ');
  const cities = labelParts.slice(1).join('');
  return cities.split(',')[0];
};

export const formatDateTime = (date: string | Date, userTimezone?: string) => {
  return userTimezone
    ? dayjs(date).tz(userTimezone).format('DD.MM.YYYY HH:mm')
    : dayjs(date).format('DD.MM.YYYY HH:mm');
};

export const isTodayDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  return isToday;
};
