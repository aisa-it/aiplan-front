export function getWeekStart(date: Date) {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - (day - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getMonthStart(baseDate: Date) {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstOfMonth.getDay() || 7;

  const startDate = new Date(firstOfMonth);
  startDate.setDate(firstOfMonth.getDate() - (dayOfWeek - 1));

  return startDate;
}

export function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function buildDateRange(from: Date, to: Date): Date[] {
  const result: Date[] = [];
  const current = new Date(from);

  current.setHours(0, 0, 0, 0);
  to = new Date(to);
  to.setHours(0, 0, 0, 0);

  while (current <= to) {
    result.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return result;
}
