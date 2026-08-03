import { reactive } from 'vue';
import {
  USER_STATUS,
  USER_STATUS_DURATION,
  type UserStatusFormModel,
} from '../UserStatus.config';
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export function useUserStatusForm() {
  const form = reactive<UserStatusFormModel>({
    status: USER_STATUS.none.value,
    statusEmoji: '',

    selectEndDate: '',

    customStatusText: '',

    customDate: '',
    customTime: '',
  });

  const getStatusKey = (status: string | null | undefined): string => {
    if (!status) {
      return USER_STATUS.none.value;
    }

    const found = Object.values(USER_STATUS).find(
      (item) => item.label === status,
    );

    return found?.value ?? USER_STATUS.custom.value;
  };

  const setUser = (user: DtoUser) => {
    const { status, status_emoji } = user;
    reset();
    form.status = getStatusKey(status);
    form.statusEmoji = status_emoji ?? '';

    if (form.status === USER_STATUS.custom.value) {
      form.customStatusText = user.status ?? '';
    }
  };

  const reset = () => {
    form.selectEndDate = '';

    form.customStatusText = '';

    form.customDate = '';
    form.customTime = '';
  };

  const resolveStatus = () => {
    if (form.status === USER_STATUS.none.value) {
      return {
        status: '',
        emoji: '',
      };
    }

    const statusData = USER_STATUS[form.status as keyof typeof USER_STATUS];

    if (!statusData) {
      return {
        status: form.status,
        emoji: USER_STATUS.custom.emoji,
      };
    }

    return {
      status:
        statusData.value === USER_STATUS.custom.value
          ? form.customStatusText
          : statusData.label,

      emoji: statusData.emoji,
    };
  };

  const resolveEndDate = (): string | null => {
    if (form.selectEndDate === USER_STATUS_DURATION.custom.value) {
      const [day, month, year] = form.customDate.split('.');
      const [hours, minutes] = form.customTime.split(':');

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hours),
        Number(minutes),
      ).toISOString();
    }

    switch (form.selectEndDate) {
      case USER_STATUS_DURATION.forever.value:
        return null;

      case USER_STATUS_DURATION.halfHour.value:
        return new Date(Date.now() + 30 * 60 * 1000).toISOString();

      case USER_STATUS_DURATION.oneHour.value:
        return new Date(Date.now() + 60 * 60 * 1000).toISOString();

      case USER_STATUS_DURATION.today.value: {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        return today.toISOString();
      }

      case USER_STATUS_DURATION.week.value: {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        nextWeek.setHours(23, 59, 59, 999);
        return nextWeek.toISOString();
      }

      default:
        return null;
    }
  };

  const buildPayload = () => {
    const status = resolveStatus();

    return {
      status: status.status,
      status_emoji: status.emoji,
      status_end_date: resolveEndDate(),
    };
  };

  return {
    form,
    reset,
    buildPayload,
    resolveStatus,
    setUser,
  };
}
