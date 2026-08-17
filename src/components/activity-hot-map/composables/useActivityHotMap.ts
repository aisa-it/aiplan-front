import { computed } from 'vue';

import {
  ACTIVITY_MONTHS,
  getActivityLevel,
} from '../ActivityHotMap.config';

import type { Ref } from 'vue';
import type { TypesActivityTable } from '@aisa-it/aiplan-api-ts/src/data-contracts';

type ActivitySquare = {
  count: number;
  date: string;
  level: number;
};

type MonthPosition = {
  name: string;
  span: number;
  start: number;
};

const formatDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return {
    key: `${day}${month}${year}`,
    label: `${day}.${month}.${year}`,
  };
};

export function useActivityHotMap(activities: Ref<TypesActivityTable>) {
  const heatmapData = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDate = new Date(today);
    firstDate.setFullYear(firstDate.getFullYear() - 1);

    const leadingEmptyDays = (firstDate.getDay() + 6) % 7;
    const squares: ActivitySquare[] = Array.from(
      { length: leadingEmptyDays },
      () => ({ count: -1, date: '', level: -1 }),
    );

    const monthPositions: MonthPosition[] = [];
    let previousMonth = firstDate.getMonth();
    let monthStart = Math.floor(squares.length / 7) + 2;
    const date = new Date(firstDate);

    while (date <= today) {
      const formattedDate = formatDate(date);
      const count = activities.value[formattedDate.key]?.count ?? 0;

      squares.push({
        count,
        date: formattedDate.label,
        level: getActivityLevel(count),
      });

      const currentMonth = date.getMonth();
      const isLastDate = date.getTime() === today.getTime();

      if (currentMonth !== previousMonth || isLastDate) {
        const monthEnd = Math.floor((squares.length - 1) / 7) + 2;
        monthPositions.push({
          name: ACTIVITY_MONTHS[previousMonth],
          start: monthStart,
          span: Math.max(1, monthEnd - monthStart),
        });
        previousMonth = currentMonth;
        monthStart = monthEnd;
      }

      date.setDate(date.getDate() + 1);
    }

    return { monthPositions, squares };
  });

  return {
    monthPositions: computed(() => heatmapData.value.monthPositions),
    squares: computed(() => heatmapData.value.squares),
  };
}
