<template>
  <section class="issues-analytics">
    <div
      class="flex gap-x-4 cursor-pointer select-none"
      @click="isExpanded = !isExpanded"
    >
      <ArrowUp class="arrow-up" :class="{ 'rotate-180': isExpanded }" />
      <h6 class="body-1-medium" style="margin: 0 !important">Аналитика</h6>
    </div>
    <div v-show="isExpanded">
      <q-select
        v-model="mode"
        class="select adaptive-select"
        borderless
        emit-value
        map-options
        :options="analyticsOptions"
      />
      <div
        ref="scrollContainer"
        class="issues-analytics__list row scroll-attachments scrollable-content"
        @scroll="scrollManager?.updateBtnVisible()"
      >
        <div class="container-btn-scroll">
          <q-btn
            padding="5px 5px"
            class="btn-scroll-attachments"
            @click="scroll(-300)"
            :style="
              !scrollManager?.scrollState.showLeftArrow
                ? `visibility: hidden;`
                : ``
            "
          >
            <template v-slot:default>
              <q-icon size="25px" name="chevron_left" />
            </template>
          </q-btn>
          <q-btn
            padding="5px 5px"
            class="btn-scroll-attachments"
            @click="scroll(300)"
            :style="
              !scrollManager?.scrollState.showRightArrow
                ? `visibility: hidden;`
                : ``
            "
          >
            <template v-slot:default>
              <q-icon size="25px" name="chevron_right" />
            </template>
          </q-btn>
        </div>

        <AnalyticsCard v-for="card in analyticsList" :card="card" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { DtoProjectStats } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useProjectStore } from 'src/stores/project-store';
import { ScrollManager } from 'src/utils/scrollBtnManager';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';
import AnalyticsCard from './AnalyticsCard.vue';
import ArrowUp from 'src/components/icons/ArrowUp.vue';
import { getStringMonthYear } from 'src/utils/time';

const route = useRoute();
const projectStore = useProjectStore();

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

const isExpanded = ref(false);

const mode = ref('issues');
const stats = ref<DtoProjectStats | null>(null);

const scrollManager = ref<ScrollManager | null>(null);
const scrollContainer = ref();

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

const analyticsList = computed<IAnalyticsCard[]>(() => {
  if (!stats.value) return [];

  switch (mode.value) {
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
});

const scroll = (direction: number): void => {
  scrollManager.value?.scroll(direction);
};

const refreshStats = async () => {
  stats.value = await projectStore.getProjectStats(
    route.params.workspace as string,
    route.params.project as string,
  );
};

onMounted(() => {
  scrollManager.value = new ScrollManager(scrollContainer.value, false);
  scrollManager.value?.setResize();
  if (
    scrollManager.value?.scrollState.showLeftArrow ||
    scrollManager.value?.scrollState.showRightArrow
  ) {
    mouseWheelScrollHandler(scrollContainer.value, false);
  }
  refreshStats();
});

watch(
  () => analyticsList.value.length,
  () =>
    nextTick(() => {
      scrollManager.value?.updateBtnVisible();
      if (
        scrollManager.value?.scrollState.showLeftArrow ||
        scrollManager.value?.scrollState.showRightArrow
      ) {
        mouseWheelScrollHandler(scrollContainer.value, false);
      } else {
        scrollContainer.value.onwheel = null;
      }
    }),
);
</script>

<style scoped lang="scss">
.issues-analytics {
  &__list {
    display: flex;
    flex-wrap: nowrap;
    gap: 16px;
  }
}

:deep(.q-field__native) {
  color: $text-color;
}
.scroll-attachments {
  display: flex;
  overflow-x: auto;
  flex-wrap: nowrap;
  align-items: center;
  padding: 0 2px;
}

.container-btn-scroll {
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  visibility: hidden;
  justify-content: space-between;

  .btn-scroll-attachments {
    margin: 0 8px;
  }
}
</style>
