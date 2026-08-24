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
        class="mb-3"
        :key="item.activity.id ?? item.index"
        :activity="item.activity"
        :message="item.message"
      />
    </ul>

    <div v-else class="flex min-h-24 items-center px-4">Нет данных</div>

    <PaginationDefault
      v-if="!loading && rowsCount > 0"
      v-model:selected-page="page"
      class="justify-end px-4"
      :rows-number="rowsCount"
      :rows-per-page="rowsPerPage"
      @request="requestActivities"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';

import DefaultLoader from '@/components/loaders/DefaultLoader.vue';
import PaginationDefault from '@/components/pagination/PaginationDefault.vue';

import ActivityItem from './ActivityItem.vue';
import { renderActivity } from '../renders/renderActivity';

import type {
  ActivitiesListRequest,
  ActivityRenderContext,
} from '../model/activity.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

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
    context: () => ({ scope: 'overview' }),
  },
);

const emit = defineEmits<{
  request: [options: ActivitiesListRequest];
  closeCurrentDay: [];
}>();

const page = ref(1);
const rowsPerPage = ref(10);

const renderedActivities = computed(() =>
  props.rows.flatMap((activity, index) => {
    const message = renderActivity(activity, props.context);

    return message ? [{ activity, index, message }] : [];
  }),
);

const pagesCount = computed(() =>
  Math.max(1, Math.ceil(props.rowsCount / rowsPerPage.value)),
);

const requestActivities = (options?: Partial<ActivitiesListRequest>) => {
  rowsPerPage.value = options?.rowsPerPage ?? rowsPerPage.value;
  emit('request', {
    page: options?.page ?? page.value,
    rowsPerPage: rowsPerPage.value,
  });
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
