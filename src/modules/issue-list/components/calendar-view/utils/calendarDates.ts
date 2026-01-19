import { MiniCalendarDay } from '../types/calendar';

export function getMonthMatrix(
  baseDate: Date,
  highlightedWeek?: Date[],
): MiniCalendarDay[] {
  const result: MiniCalendarDay[] = [];

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);

  const dayOfWeek = firstOfMonth.getDay() || 7;
  const startDate = new Date(firstOfMonth);
  startDate.setDate(firstOfMonth.getDate() - (dayOfWeek - 1));

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

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
