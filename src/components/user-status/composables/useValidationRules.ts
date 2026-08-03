import type { UserStatusFormModel } from '../UserStatus.config';

export function useValidationRules(form: { value: UserStatusFormModel }) {
  const customStatusRules = [
    (value: string) =>
      form.value.status !== 'custom' ||
      !!value ||
      'Введите текст своего статуса',
  ];

  const durationRules = [
    (value: string) =>
      form.value.status === 'none' || !!value || 'Выберите длительность',
  ];

  const isValidDate = (value: string): boolean => {
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return false;
    const [d, m, y] = value.split('.').map(Number);
    const date = new Date(y, m - 1, d);
    return (
      date.getFullYear() === y &&
      date.getMonth() === m - 1 &&
      date.getDate() === d
    );
  };

  const customDateRules = [
    (value: string) => {
      if (form.value.selectEndDate !== 'custom') return true;
      if (!value) return 'Введите дату в формате ДД.ММ.ГГГГ';
      return isValidDate(value) || 'Некорректная дата';
    },
  ];

  const customTimeRules = [
    (value: string) => {
      if (form.value.selectEndDate !== 'custom') return true;
      if (!value) return 'Укажите время';
      const [h, m] = value.split(':').map(Number);
      if (h < 0 || h > 23 || m < 0 || m > 59) return 'Некорректное время';
      return true;
    },
  ];
  return { customStatusRules, durationRules, customDateRules, customTimeRules };
}
