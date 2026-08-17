import type { TypesActivityTable } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const formatActivityKey = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${day}${month}${date.getFullYear()}`;
};

export const createMockActivityMap = (
  from: string,
  to: string,
): TypesActivityTable => {
  const activities: TypesActivityTable = {};
  const firstDate = new Date(`${from}T00:00:00`);
  const lastDate = new Date(`${to}T00:00:00`);
  const date = new Date(lastDate);
  let daysAgo = 0;

  while (date >= firstDate) {
    if (daysAgo % 5 === 0 || daysAgo % 13 === 0) {
      activities[formatActivityKey(date)] = {
        count: ((daysAgo * 7) % 38) + 1,
      };
    }

    date.setDate(date.getDate() - 1);
    daysAgo += 1;
  }

  return activities;
};
