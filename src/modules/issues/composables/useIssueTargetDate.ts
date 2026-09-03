import { computed, ref, watch } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import dayjs from 'dayjs';
import {
  getMinimumTargetDate,
  getTargetDateValue,
  isValidTargetDate,
} from '../utils/issue-date.helpers';

export const useIssueTargetDate = (initialDate?: string | null) => {
  const now = ref(new Date());
  const minimum = computed(() => getMinimumTargetDate(now.value));
  const initial = initialDate ? dayjs(initialDate) : minimum.value;
  const start =
    initial.isValid() && !initial.isBefore(minimum.value)
      ? initial
      : minimum.value;
  const date = ref<Date | null>(start.toDate());
  const time = ref<string | null>(start.format('HH:mm'));
  const minDate = computed(() => minimum.value.format('YYYY-MM-DD'));
  const maxDate = computed(() =>
    dayjs(now.value).add(10, 'year').endOf('year').format('YYYY-MM-DD'),
  );
  const minTime = computed(() =>
    dayjs(date.value).isSame(minimum.value, 'day')
      ? minimum.value.format('HH:mm')
      : undefined,
  );
  const isValid = computed(() =>
    isValidTargetDate(date.value, time.value, now.value),
  );

  // Этот таймер существует только у открытого календаря, а не у каждой строки.
  useIntervalFn(() => {
    now.value = new Date();
  }, 60_000);
  watch([date, minimum], () => {
    const value = getTargetDateValue(date.value, time.value);
    if (value && value.isBefore(minimum.value)) {
      date.value = minimum.value.toDate();
      time.value = minimum.value.format('HH:mm');
    }
  });

  const getValue = () => {
    now.value = new Date();
    if (!isValidTargetDate(date.value, time.value, now.value)) return null;
    return getTargetDateValue(date.value, time.value)?.toISOString() ?? null;
  };

  return { date, time, minDate, maxDate, minTime, isValid, getValue };
};
