const formatDate = (date: string) => {
  return `${date.slice(8, 10)}.${date.slice(5, 7)}`;
};

export const getSprintDates = (
  start_date: string | undefined,
  end_date: string | undefined,
) => {
  if (!start_date || !end_date) return '';
  return `(${formatDate(start_date)} - ${formatDate(end_date)})`;
};

export const getFullSprintDates = (
  start_date?: string | null,
  end_date?: string | null,
) => {
  const formatFullDate = (date?: string | null) => {
    if (!date) return '';
    return `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}`;
  };

  const start = formatFullDate(start_date);
  const end = formatFullDate(end_date);

  if (!start || !end) return '';
  return `${start}-${end}`;
};
