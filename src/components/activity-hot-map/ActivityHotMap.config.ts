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

const LIGHT_ACTIVITY_LEVEL_CLASSES = [
  'bg-[#ececef]',
  'bg-[#d2dcff]',
  'bg-[#7992f5]',
  'bg-[#3f51ae]',
  'bg-[#2a2b59]',
] as const;

const DARK_ACTIVITY_LEVEL_CLASSES = [
  'bg-[#2e2e31]',
  'bg-[#242758]',
  'bg-[#39488e]',
  'bg-[#6c7cba]',
  'bg-[#d9dbe8]',
] as const;

export const getActivityLevelClass = (level: number, isDark: boolean) =>
  (isDark ? DARK_ACTIVITY_LEVEL_CLASSES : LIGHT_ACTIVITY_LEVEL_CLASSES)[
    level
  ] ?? '';

export const getActivityLevel = (count: number) => {
  if (count === 0) return 0;
  if (count <= 10) return 1;
  if (count <= 20) return 2;
  if (count <= 30) return 3;
  return 4;
};
