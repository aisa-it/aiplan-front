import dayjs from 'dayjs';

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
