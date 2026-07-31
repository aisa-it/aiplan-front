export const USER_STATUS = {
  none: { label: 'Без статуса', value: 'none', emoji: '' },
  dnd: { label: 'Не беспокоить', value: 'dnd', emoji: '🔕' },
  lunch: { label: 'Обед', value: 'lunch', emoji: '🍽️' },
  call: { label: 'На звонке', value: 'call', emoji: '🎧' },
  vacation: { label: 'Отпуск', value: 'vacation', emoji: '🏖️' },
  sick: { label: 'Больничный', value: 'sick', emoji: '🤒' },
  custom: { label: 'Другое', value: 'custom', emoji: '💬' },
} as const;

export const STATUS_OPTIONS = Object.values(USER_STATUS);

export const USER_STATUS_DURATION = {
  forever: { label: 'Без срока', value: 'forever' },
  halfHour: { label: '30 минут', value: 'halfHour' },
  oneHour: { label: '1 час', value: 'oneHour' },
  today: { label: 'Сегодня', value: 'today' },
  week: { label: 'Эта неделя', value: 'week' },
  custom: { label: 'Выбрать дату и время', value: 'custom' },
} as const;

export const DURATION_OPTIONS = Object.values(USER_STATUS_DURATION);

export interface UserStatusFormModel {
  status: string;
  statusEmoji: string;

  selectEndDate: string;

  customStatusText: string;

  customDate: string;
  customTime: string;
}
