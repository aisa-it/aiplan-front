export const toInputDate = (value: unknown) => {
  if (typeof value !== 'string') return '';
  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return '';
  const [, day, month, year] = match;
  const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  return toEditorDate(result) ? result : '';
};

export const toEditorDate = (value: string) => {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return '';
  const [, year, month, day] = match;
  const date = new Date(0);
  date.setUTCFullYear(Number(year), Number(month) - 1, Number(day));
  if (Number(year) < 1 || date.getUTCFullYear() !== Number(year) ||
      date.getUTCMonth() !== Number(month) - 1 || date.getUTCDate() !== Number(day)) {
    return '';
  }
  return `${day}.${month}.${year}`;
};
