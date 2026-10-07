import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import relativeTime from 'dayjs/plugin/relativeTime';

import { formatDateTime, isTodayDate } from '@/utils/time';

dayjs.locale('ru');
dayjs.extend(relativeTime);

export const formatActivityDate = (date: string) =>
  isTodayDate(date)
    ? dayjs(date).fromNow().toLowerCase()
    : formatDateTime(date);
