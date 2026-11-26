export type CalendarPeriod = 'week' | 'month' | 'year';

export function addDays(date: Date, count: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + count);
  return result;
}

export function weekStart(date: Date) {
  const start = addDays(date, 1 - (date.getDay() || 7));
  start.setHours(0, 0, 0, 0);
  return start;
}

export function monthGrid(date: Date) {
  const start = weekStart(new Date(date.getFullYear(), date.getMonth(), 1));
  return Array.from({ length: 42 }, (_, day) => addDays(start, day));
}

export function shiftPeriod(date: Date, period: CalendarPeriod, direction: -1 | 1) {
  if (period === 'week') return addDays(date, direction * 7);
  const month = period === 'month' ? date.getMonth() + direction : date.getMonth();
  const year = period === 'year' ? date.getFullYear() + direction : date.getFullYear();
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(date.getDate(), lastDay));
}

export function dayKey(date: Date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function getCalendarRange(date: Date, period: CalendarPeriod) {
  if (period === 'year') {
    const year = date.getFullYear();
    return {
      start: new Date(year, 0, 1),
      end: new Date(year + 1, 0, 1),
    };
  }
  const start = period === 'week' ? weekStart(date) : monthGrid(date)[0];
  return { start, end: addDays(start, period === 'week' ? 7 : 42) };
}
