export const ACTIVITY_MONTHS = [
  'Янв',
  'Фев',
  'Мар',
  'Апр',
  'Май',
  'Июн',
  'Июл',
  'Авг',
  'Сен',
  'Окт',
  'Ноя',
  'Дек',
] as const;

export const ACTIVITY_WEEKDAYS = [
  'Пн',
  'Вт',
  'Ср',
  'Чт',
  'Пт',
  'Сб',
  'Вс',
] as const;

export const ACTIVITY_LEVEL_LABELS = [
  '0 активностей',
  '1-10 активностей',
  '11-20 активностей',
  '21-30 активностей',
  '31+ активностей',
] as const;

export const getActivityLevel = (count: number) => {
  if (count === 0) return 0;
  if (count <= 10) return 1;
  if (count <= 20) return 2;
  if (count <= 30) return 3;
  return 4;
};
