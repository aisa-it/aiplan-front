import type {
  UserStatusDurationKey,
  UserStatusKey,
} from '../UserStatus.config';

export default {
  select: 'Выбрать статус',
  until: '(до {date})',
  statuses: {
    none: 'Без статуса',
    dnd: 'Не беспокоить',
    lunch: 'Обед',
    call: 'На звонке',
    vacation: 'Отпуск',
    sick: 'Больничный',
    custom: 'Другое',
  } satisfies Record<UserStatusKey, string>,
  durations: {
    forever: 'Без срока',
    halfHour: '30 минут',
    oneHour: '1 час',
    today: 'Сегодня',
    week: 'Эта неделя',
    custom: 'Выбрать дату и время',
  } satisfies Record<UserStatusDurationKey, string>,
  form: {
    title: 'Выбрать статус',
    customText: 'Текст статуса',
    resetAfter: 'Сбросить статус через',
    datePlaceholder: 'ДД.ММ.ГГГГ',
  },
  validation: {
    customTextRequired: 'Введите текст своего статуса',
    durationRequired: 'Выберите длительность',
    dateInPast: 'Дата не может быть в прошлом',
    dateRequired: 'Введите дату в формате ДД.ММ.ГГГГ',
    dateInvalid: 'Некорректная дата',
    timeRequired: 'Укажите время',
    timeInvalid: 'Некорректное время',
  },
};
