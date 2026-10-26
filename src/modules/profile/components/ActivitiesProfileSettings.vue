<template>
  <div class="py-6">
    <ActivityHotMap
      v-if="Object.keys(userActivityMap).length || loadReq"
      v-model:selected-day="currentDay"
      :activities="userActivityMap"
      :load-req="loadReq"
    />
    <div v-else>
      {{
        activities.length
          ? 'Недостаточно данных для отображения активности по дням'
          : 'У пользователя не было активности'
      }}
    </div>

    <ActivitiesList
      :rows="activities"
      :rows-count="activitiesCount"
      :loading="loadList"
      :current-day="currentDay"
      :context="PROFILE_ACTIVITY_CONTEXT"
      @request="requestActivities"
      @close-current-day="currentDay = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import ActivityHotMap from '@/components/activity-hot-map/ActivityHotMap.vue';
import {
  ActivitiesList,
  type ActivitiesListRequest,
  type ActivityRenderContext,
} from '@/modules/activities';

import { useActivities } from '../composables/activities-profile-settings/useActivities';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const PROFILE_ACTIVITY_CONTEXT = {
  scope: 'overview',
} satisfies ActivityRenderContext;

const currentDay = ref('');

defineProps<{
  user: DtoUser;
}>();

const {
  activities,
  activitiesCount,
  loadActivitiesList,
  loadList,
  loadReq,
  userActivityMap,
} = useActivities();

const requestActivities = (options: ActivitiesListRequest) =>
  loadActivitiesList(options, currentDay.value);
</script>
