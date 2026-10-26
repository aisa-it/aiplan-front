// storedLabel — канонический текст, который сохраняется на бэкенде в user.status. Не переводить и не менять: по нему статус распознают другие клиенты.
export const USER_STATUS = {
  none: { storedLabel: 'Без статуса', value: 'none', emoji: '' },
  dnd: { storedLabel: 'Не беспокоить', value: 'dnd', emoji: '🔕' },
  lunch: { storedLabel: 'Обед', value: 'lunch', emoji: '🍽️' },
  call: { storedLabel: 'На звонке', value: 'call', emoji: '🎧' },
  vacation: { storedLabel: 'Отпуск', value: 'vacation', emoji: '🏖️' },
  sick: { storedLabel: 'Больничный', value: 'sick', emoji: '🤒' },
  custom: { storedLabel: 'Другое', value: 'custom', emoji: '💬' },
} as const;

export const STATUS_OPTIONS = Object.values(USER_STATUS);

export type UserStatusKey = keyof typeof USER_STATUS;

export const getStatusKeyByText = (
  text: string | null | undefined,
): UserStatusKey | undefined =>
  Object.values(USER_STATUS).find((item) => item.storedLabel === text)?.value;

export const USER_STATUS_DURATION = {
  forever: { value: 'forever' },
  halfHour: { value: 'halfHour' },
  oneHour: { value: 'oneHour' },
  today: { value: 'today' },
  week: { value: 'week' },
  custom: { value: 'custom' },
} as const;

export type UserStatusDurationKey = keyof typeof USER_STATUS_DURATION;

export const DURATION_OPTIONS = Object.values(USER_STATUS_DURATION);

export interface UserStatusFormModel {
  status: string;
  statusEmoji: string;

  selectEndDate: string;

  customStatusText: string;

  customDate: string;
  customTime: string;
}
