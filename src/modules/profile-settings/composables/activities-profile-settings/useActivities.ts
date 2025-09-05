import { onMounted, ref } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { DtoEntityActivityFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

export const useActivities = () => {
  // Подключение информации об активностях
  const userStore = useUserStore();

  const loadReq = ref<boolean>(true);
  const loadList = ref<boolean>(true);
  const rows = ref<DtoEntityActivityFull[]>([]);
  const rowsCount = ref<number>(0);

  async function onRequest(p: any): Promise<void> {
    const { page, rowsPerPage, rowsNumber } = p.pagination;

    await userStore
      .getUserActivities({
        offset: (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage),
        limit: rowsPerPage == 0 ? rowsNumber || 10 : rowsPerPage,
      })
      .then((res) => {
        rowsCount.value = res.count || 0;
        rows.value = res.result;
      })
      .finally(() => (loadList.value = false));
  }

  onMounted(async () => {
    const today: Date = new Date();
    const todayString: string = today.toISOString().split('T')[0];

    const dates: string[] = todayString.split('-').reverse();
    const from = `${dates[0]}${dates[1]}${String(Number(dates[2]) - 1).padStart(
      2,
      '0',
    )}`;
    const to = `${dates[0]}${dates[1]}${dates[2]}`;

    await userStore
      .getActivityDate({ from: from, to: to })
      .finally(() => (loadReq.value = false));
  });

  return { loadReq, loadList, rows, rowsCount, onRequest };
};
