<template>
  <section>
    <div v-for="option in analyticsOptions">
      <h6
        v-if="!loading && analyticsList(option.value)?.length"
        class="text-md"
        style="margin: 16px 0 8px !important"
      >
        {{ option.label }}
      </h6>
      <h6 v-if="loading" style="margin: 16px 0 8px !important">
        <q-skeleton height="22px" width="180px" />
      </h6>
      <div
        v-if="!loading && analyticsList(option.value)?.length"
        class="issues-analytics"
      >
        <AnalyticsCard
          v-for="card in analyticsList(option.value)"
          :card="card"
        />
      </div>
      <div v-if="loading" class="issues-analytics q-my-md">
        <q-skeleton v-for="i in getSkeletonRandom()" :key="i" height="46px" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onActivated, ref } from 'vue';
import { DtoProjectStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useProjectStore } from 'src/stores/project-store';
import AnalyticsCard from './AnalyticsCard.vue';
import { getStringMonthYear } from 'src/utils/time';
import { storeToRefs } from 'pinia';
import { useWorkspaceStore } from 'src/stores/workspace-store';

export interface IAnalyticsCard {
  title?: string;
  data: {
    label: string;
    count: number;
  }[];
}

const props = defineProps<{
  projectId: string;
}>();

const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const analyticsOptions = [
  {
    value: 'issues',
    label: 'Общий счётчик задач',
  },
  {
    value: 'by_state',
    label: 'По статусу',
  },
  {
    value: 'by_priority',
    label: 'По приоритету',
  },
  {
    value: 'by_state_group',
    label: 'По группам статусов',
  },
  {
    value: 'overdue',
    label: 'Просроченные задачи',
  },
  {
    value: 'assignee_stats',
    label: 'По исполнителям',
  },
  {
    value: 'label_stats',
    label: 'По тегам',
  },
  {
    value: 'sprint_stats',
    label: 'По спринтам',
  },
  {
    value: 'timeline',
    label: 'За период',
  },
];

const loading = ref(false);
const stats = ref<DtoProjectStats | null>(null);

const cards = (rows: [label: string, count: number][]): IAnalyticsCard[] =>
  rows.map(([label, count]) => ({
    data: [{ label, count }],
  }));

const formCard = (
  rows: [label: string, count: number][],
  title?: string,
): IAnalyticsCard => ({
  ...(title ? { title } : {}),
  data: rows.map(([label, count]) => ({ label, count })),
});

const analyticsList = (mode: string): IAnalyticsCard[] => {
  if (!stats.value) return [];

  switch (mode) {
    case 'issues':
      return cards([
        ['Всего', stats.value.issues?.total ?? 0],
        ['Активные', stats.value.issues?.active ?? 0],
        ['Завершённые', stats.value.issues?.completed ?? 0],
        ['Отменённые', stats.value.issues?.cancelled ?? 0],
      ]);

    case 'by_priority':
      return cards([
        ['Низкий', stats.value.by_priority?.low ?? 0],
        ['Средний', stats.value.by_priority?.medium ?? 0],
        ['Высокий', stats.value.by_priority?.high ?? 0],
        ['Критический', stats.value.by_priority?.urgent ?? 0],
        ['Не выбран', stats.value.by_priority?.none ?? 0],
      ]);

    case 'by_state_group':
      return cards([
        ['Создано', stats.value.by_state_group?.backlog ?? 0],
        ['Не начато', stats.value.by_state_group?.unstarted ?? 0],
        ['Начато', stats.value.by_state_group?.started ?? 0],
        ['Завершено', stats.value.by_state_group?.completed ?? 0],
        ['Отменено', stats.value.by_state_group?.cancelled ?? 0],
      ]);

    case 'overdue':
      return cards([['Просрочено', stats.value.overdue?.count ?? 0]]);

    case 'by_state':
      return (stats.value.by_state ?? []).map(({ name, count }) =>
        formCard([[name ?? '', count ?? 0]]),
      );

    case 'label_stats':
      return (stats.value.label_stats ?? []).map(({ name, count }) =>
        formCard([[name ?? '', count ?? 0]]),
      );

    case 'sprint_stats':
      return (stats.value.sprint_stats ?? []).map(
        ({ total, completed, name }) =>
          formCard(
            [
              ['Создано', total ?? 0],
              ['Завершено', completed ?? 0],
            ],
            name,
          ),
      );

    case 'assignee_stats':
      return (stats.value.assignee_stats ?? []).map(
        ({ active, completed, display_name }) =>
          formCard(
            [
              ['Активные', active ?? 0],
              ['Завершённые', completed ?? 0],
            ],
            display_name,
          ),
      );

    case 'timeline': {
      const created = (stats.value.timeline?.created_by_month ?? [])
        .slice()
        .reverse();
      const completedMap = new Map(
        (stats.value.timeline?.completed_by_month ?? []).map(
          ({ month, count }) => [month, count ?? 0],
        ),
      );

      return created.map(({ count, month }) =>
        formCard(
          [
            ['Создано', count ?? 0],
            ['Завершено', completedMap.get(month) ?? 0],
          ],
          getStringMonthYear(month!),
        ),
      );
    }

    default:
      return [];
  }
};

const getSkeletonRandom = () => {
  return Math.floor(Math.random() * (12 - 4)) + 4;
};

const refreshStats = async () => {
  if (!currentWorkspaceSlug.value) return;
  loading.value = true;
  stats.value = await projectStore.getProjectStats(
    currentWorkspaceSlug.value,
    props.projectId,
  );
  loading.value = false;
};

onActivated(() => {
  refreshStats();
});
</script>

<style scoped lang="scss">
.issues-analytics {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  > * {
    width: 260px;
    max-height: 72px;
    height: 100%;
    padding: 12px;
    border-radius: 16px;
  }
}

:deep(.q-field__native) {
  color: $text-color;
}
</style>
