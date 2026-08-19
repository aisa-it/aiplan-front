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
    } catch (error) {
      void error;
      clearUserActivityMap();
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      loadReq.value = false;
    }
  };

  const loadActivitiesList = async ({
    page,
    rowsPerPage,
  }: ActivitiesListRequest) => {
    loadList.value = true;

    try {
      const response = await ProfileService.getActivitiesList({
        offset: (page - 1) * rowsPerPage,
        limit: rowsPerPage,
      });

      activities.value = response.result ?? [];
      activitiesCount.value = response.count ?? 0;
    } catch (error) {
      void error;
      clearActivities();
      // TODO: показать уведомление об ошибке после переноса системы уведомлений.
    } finally {
      loadList.value = false;
    }
  };

  onMounted(loadActivities);
  onBeforeUnmount(() => {
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
