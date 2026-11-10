import { onBeforeUnmount, onMounted, ref } from 'vue';

import { ProfileService } from '../../api/profile.service';

import type { ActivitiesListRequest } from '@/modules/activities';
import type {
  DtoActivityEventFull,
  TypesActivityTable,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const formatRequestDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}${month}${year}`;
};

export function useActivities() {
  let listRequestId = 0;

  const loadReq = ref(true);
  const loadList = ref(true);
  const userActivityMap = ref<TypesActivityTable>({});
  const activities = ref<DtoActivityEventFull[]>([]);
  const activitiesCount = ref(0);

  const clearUserActivityMap = () => {
    userActivityMap.value = {};
  };

  const clearActivities = () => {
    activities.value = [];
    activitiesCount.value = 0;
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
      userActivityMap.value =
        await ProfileService.getActivitiesTable(requestParams);
    } catch {
      clearUserActivityMap();
    } finally {
      loadReq.value = false;
    }
  };

  const loadActivitiesList = async (
    { page, rowsPerPage }: ActivitiesListRequest,
    day?: string,
  ) => {
    const requestId = ++listRequestId;
    loadList.value = true;

    try {
      const response = await ProfileService.getActivitiesList({
        day: day ? day.replaceAll('.', '') : undefined,
        offset: (page - 1) * rowsPerPage,
        limit: rowsPerPage,
      });

      if (requestId !== listRequestId) return;

      activities.value = response.result ?? [];
      activitiesCount.value = response.count ?? 0;
    } catch {
      if (requestId !== listRequestId) return;

      clearActivities();
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      if (requestId === listRequestId) {
        loadList.value = false;
      }
    }
  };

  onMounted(loadActivities);
  onBeforeUnmount(() => {
    listRequestId += 1;
    clearUserActivityMap();
    clearActivities();
  });

  return {
    activities,
    activitiesCount,
    loadActivities,
    loadActivitiesList,
    loadList,
    loadReq,
    userActivityMap,
  };
}
