import type ru from './ru';

export default {
  select: 'Set status',
  until: '(until {date})',
  statuses: {
    none: 'No status',
    dnd: 'Do not disturb',
    lunch: 'Lunch',
    call: 'On a call',
    vacation: 'Vacation',
    sick: 'Sick leave',
    custom: 'Other',
  },
  durations: {
    forever: 'No time limit',
    halfHour: '30 minutes',
    oneHour: '1 hour',
    today: 'Today',
    week: 'This week',
    custom: 'Choose date and time',
  },
  form: {
    title: 'Set status',
    customText: 'Status text',
    resetAfter: 'Reset status after',
    datePlaceholder: 'DD.MM.YYYY',
  },
  validation: {
    customTextRequired: 'Enter your status text',
    durationRequired: 'Select a duration',
    dateInPast: 'Date cannot be in the past',
    dateRequired: 'Enter a date in DD.MM.YYYY format',
    dateInvalid: 'Invalid date',
    timeRequired: 'Enter a time',
    timeInvalid: 'Invalid time',
  },
} satisfies typeof ru;
