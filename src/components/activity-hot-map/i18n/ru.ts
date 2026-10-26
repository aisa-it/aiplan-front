import type {
  ACTIVITY_LEVEL_KEYS,
  ACTIVITY_MONTH_KEYS,
  ACTIVITY_WEEKDAY_KEYS,
} from '../ActivityHotMap.config';

export default {
  months: {
    jan: 'Янв',
    feb: 'Фев',
    mar: 'Мар',
    apr: 'Апр',
    may: 'Май',
    jun: 'Июн',
    jul: 'Июл',
    aug: 'Авг',
    sep: 'Сен',
    oct: 'Окт',
    nov: 'Ноя',
    dec: 'Дек',
  } satisfies Record<(typeof ACTIVITY_MONTH_KEYS)[number], string>,
  weekdays: {
    mon: 'Пн',
    tue: 'Вт',
    wed: 'Ср',
    thu: 'Чт',
    fri: 'Пт',
    sat: 'Сб',
    sun: 'Вс',
  } satisfies Record<(typeof ACTIVITY_WEEKDAY_KEYS)[number], string>,
  levels: {
    none: '0 активностей',
    low: '1-10 активностей',
    medium: '11-20 активностей',
    high: '21-30 активностей',
    max: '31+ активностей',
  } satisfies Record<(typeof ACTIVITY_LEVEL_KEYS)[number], string>,
  tooltip: 'Дата: {date} Активность: {count}',
};
