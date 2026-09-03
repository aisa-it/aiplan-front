import dayjs from 'dayjs';

export const getMinimumTargetDate = (now = new Date()) =>
  dayjs(now).add(15, 'minute').startOf('minute');

export const getTargetDateValue = (date: Date | null, time: string | null) => {
  if (!date || !time || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hour, minute] = time.split(':').map(Number);
  if (hour === undefined || minute === undefined || hour > 23 || minute > 59)
    return null;
  const value = dayjs(date).hour(hour).minute(minute).second(0).millisecond(0);
  return value.isValid() ? value : null;
};

export const isValidTargetDate = (
  date: Date | null,
  time: string | null,
  now = new Date(),
) => {
  const value = getTargetDateValue(date, time);
  return (
    !!value &&
    !value.isBefore(getMinimumTargetDate(now)) &&
    !value.isAfter(dayjs(now).add(10, 'year').endOf('year'))
  );
};
