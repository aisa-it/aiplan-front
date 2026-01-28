import { MiniCalendarDay } from '../types/calendar';
import { getMonthStart } from './dateRange';

export function getMonthMatrix(
  baseDate: Date,
  highlightedWeek?: Date[],
): MiniCalendarDay[] {
  const result: MiniCalendarDay[] = [];

  const startDate = getMonthStart(baseDate);
  const month = baseDate.getMonth();
  const today = new Date();

  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    result.push({
      date,
      isCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
      isInHighlightedWeek: highlightedWeek
        ? highlightedWeek.some((d) => isSameDay(d, date))
        : false,
      isInHighlightedBorderStart: highlightedWeek
        ? isSameDay(highlightedWeek[0], date)
        : false,
      isInHighlightedBorderEnd: highlightedWeek
        ? isSameDay(highlightedWeek[highlightedWeek.length - 1], date)
        : false,
    });
  }

  return result;
}

export function isSameDay(a: Date, b: Date) {
  return isSameMonth(a, b) && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function formatDayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
