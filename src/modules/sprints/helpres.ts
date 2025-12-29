const formatDate = (date: string) => {
  return `${date.slice(8, 10)}.${date.slice(5, 7)}`;
};

export const getSprintDates = (start_date: string, end_date: string) => {
  return `(${formatDate(start_date)} - ${formatDate(end_date)})`;
};

export const getFullSprintDates = (start_date: string, end_date: string) => {
  const formatFullDate = (date: string) => {
    return `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(0, 4)}`;
  };

  return `${formatFullDate(start_date)}-${formatFullDate(end_date)}`;
};
