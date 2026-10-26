import { useI18n } from 'vue-i18n';

import type { UserStatusFormModel } from '../UserStatus.config';

export function useValidationRules(form: { value: UserStatusFormModel }) {
  const { t } = useI18n();

  const customStatusRules = [
    (value: string) =>
      form.value.status !== 'custom' ||
      !!value ||
      t('userStatus.validation.customTextRequired'),
  ];

  const durationRules = [
    (value: string) =>
      form.value.status === 'none' ||
      !!value ||
      t('userStatus.validation.durationRequired'),
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

  const isValidTime = (value: string): boolean => {
    if (!/^\d{2}:\d{2}$/.test(value)) return false;

    const [hours, minutes] = value.split(':').map(Number);
    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
  };

  const validateFutureDateTime = () => {
    if (
      !isValidDate(form.value.customDate) ||
      !isValidTime(form.value.customTime)
    ) {
      return true;
    }

    const [day, month, year] = form.value.customDate.split('.').map(Number);
    const [hours, minutes] = form.value.customTime.split(':').map(Number);
    const statusEndDate = new Date(year, month - 1, day, hours, minutes);

    return (
      statusEndDate.getTime() > Date.now() ||
      t('userStatus.validation.dateInPast')
    );
  };

  const customDateRules = [
    (value: string) => {
      if (form.value.selectEndDate !== 'custom') return true;
      if (!value) return t('userStatus.validation.dateRequired');
      if (!isValidDate(value)) return t('userStatus.validation.dateInvalid');
      return validateFutureDateTime();
    },
  ];

  const customTimeRules = [
    (value: string) => {
      if (form.value.selectEndDate !== 'custom') return true;
      if (!value) return t('userStatus.validation.timeRequired');
      return isValidTime(value) || t('userStatus.validation.timeInvalid');
    },
  ];
  return { customStatusRules, durationRules, customDateRules, customTimeRules };
}
