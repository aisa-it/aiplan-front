import { onBeforeUnmount, onMounted, ref } from 'vue';

import { createMockActivityMap } from '../../configs/activities-settings.config';

import type { TypesActivityTable } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const formatRequestDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export function useActivities() {
  const loadReq = ref(true);
  const userActivityMap = ref<TypesActivityTable>({});

  const clearUserActivityMap = () => {
    userActivityMap.value = {};
  };

  const loadActivities = async () => {
    loadReq.value = true;

    const to = new Date();
    const from = new Date(to);
    from.setFullYear(from.getFullYear() - 1);

    const requestParams = {
      from: formatRequestDate(from),
      to: formatRequestDate(to),
    };

    try {
      // userActivityMap.value = await ProfileService.getActivitiesTable(requestParams); // TODO: подключить после настройки авторизации
      userActivityMap.value = createMockActivityMap(
        requestParams.from,
        requestParams.to,
      );
    } finally {
      loadReq.value = false;
    }
  };

  onMounted(loadActivities);
  onBeforeUnmount(clearUserActivityMap);

  return {
    loadActivities,
    loadReq,
    userActivityMap,
  };
}
