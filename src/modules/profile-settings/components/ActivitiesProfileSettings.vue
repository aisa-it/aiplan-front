<template>
  <ActivityHotMap
    v-if="Object.keys(userActivityMap).length"
    :activities="userActivityMap"
    :loadReq="loadReq || loadList"
  />
  <ActivitiesList :rows="rows" :rows-count="rowsCount" @update="onRequest" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user-store';

import ActivitiesList from 'src/components/activity/ActivitiesList.vue';
import ActivityHotMap from 'src/components/activity/ActivityHotMap.vue';

import { useActivities } from '../composables/activities-profile-settings/useActivities';
import { onBeforeMount, onUnmounted } from 'vue';

const userStore = useUserStore();
const { userActivityMap } = storeToRefs(userStore);

onBeforeMount(() => {
  userStore.clearUserActivityMap();
})

onUnmounted(() => {
  userStore.clearUserActivityMap();
})

const { loadReq, loadList, rows, rowsCount, onRequest } =
  useActivities();
</script>
