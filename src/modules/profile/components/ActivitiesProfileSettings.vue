<template>
  <div class="py-6">
    <ActivityHotMap
      v-if="Object.keys(userActivityMap).length || loadReq"
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
      :context="PROFILE_ACTIVITY_CONTEXT"
      @request="loadActivitiesList"
    />
  </div>
</template>

<script setup lang="ts">
import ActivityHotMap from '@/components/activity-hot-map/ActivityHotMap.vue';
import {
  ActivitiesList,
  type ActivityRenderContext,
} from '@/modules/activities';

import { useActivities } from '../composables/activities-profile-settings/useActivities';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const PROFILE_ACTIVITY_CONTEXT = {
  scope: 'overview',
} satisfies ActivityRenderContext;

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
</script>
