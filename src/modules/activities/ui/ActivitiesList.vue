<template>
  <section class="my-4">
    <div class="flex items-center justify-between gap-4 px-4">
      <h4 class="text-2xl font-medium">
        Активность {{ currentDay ? `${currentDay} г.` : '' }}
      </h4>

      <v-btn
        v-if="currentDay"
        icon="mdi-close"
        size="x-small"
        variant="text"
        aria-label="Закрыть активности за выбранный день"
        @click="closeCurrentDay"
      />
    </div>

    <div v-if="loading" class="flex min-h-32 items-center justify-center">
      <DefaultLoader />
    </div>

    <ul v-else-if="renderedActivities.length" class="m-0 px-4 py-2">
      <ActivityItem
        v-for="item in renderedActivities"
        :key="item.activity.id ?? item.index"
        :activity="item.activity"
        :message="item.message"
      />
    </ul>

    <div v-else class="flex min-h-24 items-center px-4">Нет данных</div>

    <!-- TODO: перенести пагинацию -->
    <div
      v-if="!loading && rowsCount > 0"
      class="flex flex-wrap items-center justify-end gap-3 px-4"
    >
      <v-select
        v-model="rowsPerPage"
        :items="ROWS_PER_PAGE_OPTIONS"
        density="compact"
        hide-details
        variant="outlined"
        class="max-w-24"
        aria-label="Строк на странице"
        @update:model-value="changeRowsPerPage"
      />

      <v-pagination
        v-model="page"
        :length="pagesCount"
        :total-visible="6"
        density="compact"
        @update:model-value="requestActivities"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import DefaultLoader from '@/components/loaders/DefaultLoader.vue';

import ActivityItem from './ActivityItem.vue';
import { renderActivity } from '../rendering/renderActivity';

import type {
  ActivitiesListRequest,
  ActivityRenderContext,
} from '../model/activity.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const ROWS_PER_PAGE_OPTIONS = [10, 25, 100] as const;

const props = withDefaults(
  defineProps<{
    rows: DtoActivityEventFull[];
    rowsCount: number;
    loading?: boolean;
    currentDay?: string;
    context?: ActivityRenderContext;
  }>(),
  {
    loading: false,
    currentDay: '',
    context: () => ({ placement: 'aggregate' }),
  },
);

const emit = defineEmits<{
  request: [options: ActivitiesListRequest];
  closeCurrentDay: [];
}>();

const page = ref(1);
const rowsPerPage = ref<(typeof ROWS_PER_PAGE_OPTIONS)[number]>(10);

const renderedActivities = computed(() =>
  props.rows.flatMap((activity, index) => {
    const message = renderActivity(activity, props.context);

    return message ? [{ activity, index, message }] : [];
  }),
);

const pagesCount = computed(() =>
  Math.max(1, Math.ceil(props.rowsCount / rowsPerPage.value)),
);

const requestActivities = () => {
  emit('request', {
    page: page.value,
    rowsPerPage: rowsPerPage.value,
  });
};

const changeRowsPerPage = () => {
  page.value = 1;
  requestActivities();
};

const closeCurrentDay = () => {
  page.value = 1;
  emit('closeCurrentDay');
  requestActivities();
};

watch(pagesCount, (count) => {
  if (page.value <= count) return;

  page.value = count;
  requestActivities();
});

onMounted(requestActivities);
</script>
