<template>
  <ActivityHotMap
    v-if="Object.keys(userActivityMap).length"
    :activities="userActivityMap"
    :loadReq="loadReq || loadList"
    @on-cell-click="onUpdateActivity"
  />
  <div v-else>
    {{
      rows.length
        ? 'Недостаточно данных для отображения активности по дням'
        : 'У пользователя не было активности'
    }}
  </div>
  <ActivitiesList
    :rows="rows"
    :current-day="currentDay"
    :rows-count="rowsCount"
    @update="onRequest"
    @on-close-click="closeCurrentActivity"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user-store';

import ActivitiesList from 'src/components/activity/ActivitiesList.vue';
import ActivityHotMap from 'src/components/activity/ActivityHotMap.vue';

import { useActivities } from '../composables/activities-profile-settings/useActivities';
import { onBeforeMount, onUnmounted, ref } from 'vue';

const userStore = useUserStore();
const { userActivityMap } = storeToRefs(userStore);

const currentDay = ref<string>('');
const pagination = {
  orderBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
}

const onUpdateActivity = async (day: string) => {
  currentDay.value = day;
  await onRequest({ pagination }, currentDay.value);
};

const closeCurrentActivity = async () => {
  currentDay.value = '';
  await onRequest({ pagination }, currentDay.value);
};

onBeforeMount(() => {
  userStore.clearUserActivityMap();
})

onUnmounted(() => {
  userStore.clearUserActivityMap();
})

const { loadReq, loadList, rows, rowsCount, onRequest } =
  useActivities();
</script>
