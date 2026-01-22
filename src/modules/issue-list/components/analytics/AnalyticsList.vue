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
import { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useIssuesStore } from 'src/stores/issues-store';
import { ScrollManager } from 'src/utils/scrollBtnManager';
import { mouseWheelScrollHandler } from 'src/utils/mouseWheelScrollHandler';
import AnalyticsCard from './AnalyticsCard.vue';
import ArrowUp from 'src/components/icons/ArrowUp.vue';

const route = useRoute();
const issuesStore = useIssuesStore();

const analyticsOptions = [
  {
    value: 'common',
    label: 'Общий счётчик задач',
  },
  {
    value: 'status',
    label: 'По статусу',
  },
  {
    value: 'priority',
    label: 'По приоритету',
  },
  {
    value: 'group_status',
    label: 'По группам статусов',
  },
  {
    value: 'expired',
    label: 'Просроченные задачи',
  },
  {
    value: 'assigness',
    label: 'По исполнителям',
  },
  {
    value: 'tags',
    label: 'По тегам',
  },
  {
    value: 'sprints',
    label: 'По спринтам',
  },
  {
    value: 'periods',
    label: 'За период',
  },
];

const isExpanded = ref(false);

const mode = ref('common');

const issues = ref<DtoIssueWithCount[]>([]);

const scrollManager = ref<ScrollManager | null>(null);
const scrollContainer = ref();

const analyticsList = computed<IAnalyticsCard[]>(() => {
  switch (mode.value) {
    case 'common': {
      const total = issues.value.length;
      const cancelled = issues.value.filter(
        (item) => item.state_detail?.group === 'cancelled',
      ).length;
      const completed = issues.value.filter(
        (item) => item.state_detail?.group === 'completed',
      ).length;
      const active = total - cancelled - completed;

      return [
        {
          data: [{ label: 'Всего', count: total }],
        },
        {
          data: [{ label: 'Активные', count: active }],
        },
        {
          data: [{ label: 'Завершённые', count: completed }],
        },
        {
          data: [{ label: 'Отменённые', count: cancelled }],
        },
      ];
    }
    default: {
      return [];
    }
  }
});

const scroll = (direction: number): void => {
  scrollManager.value?.scroll(direction);
};

const loadSprintIssues = async () => {
  const allIssues: DtoIssueWithCount[] = [];
  let offset = 0;
  let totalCount = 0;
  const ISSUES_LIMIT = 100;

  while (true) {
    const response = await issuesStore.getIssuesTable(
      route.params.workspace as string,
      route.params.project as string,
      {},
      { limit: ISSUES_LIMIT, offset },
    );

    const loadedIssues = response?.data.issues ?? [];

    allIssues.push(...loadedIssues);

    if (offset === 0) totalCount = response?.data.count ?? 0;

    const hasMoreData =
      loadedIssues.length === ISSUES_LIMIT && allIssues.length < totalCount;

    if (!hasMoreData) {
      break;
    }

    offset += ISSUES_LIMIT;
  }
  return allIssues;
};

onMounted(async () => {
  issues.value = await loadSprintIssues();
  scrollManager.value = new ScrollManager(scrollContainer.value, false);
  scrollManager.value?.setResize();
  if (
    scrollManager.value?.scrollState.showLeftArrow ||
    scrollManager.value?.scrollState.showRightArrow
  ) {
    mouseWheelScrollHandler(scrollContainer.value, false);
  }
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
