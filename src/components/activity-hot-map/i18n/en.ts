import type ru from './ru';

export default {
  months: {
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    may: 'May',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Aug',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
  },
  weekdays: {
    mon: 'Mon',
    tue: 'Tue',
    wed: 'Wed',
    thu: 'Thu',
    fri: 'Fri',
    sat: 'Sat',
    sun: 'Sun',
  },
  levels: {
    none: '0 activities',
    low: '1-10 activities',
    medium: '11-20 activities',
    high: '21-30 activities',
    max: '31+ activities',
  },
  tooltip: 'Date: {date} Activity: {count}',
} satisfies typeof ru;
