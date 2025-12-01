const formatDate = (date: string) => {
  return `${date.slice(8, 10)}.${date.slice(5, 7)}`;
};

export const getSprintDates = (start_date: string, end_date: string) => {
  return `(${formatDate(start_date)} - ${formatDate(end_date)})`;
};
