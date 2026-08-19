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
      @request="loadActivitiesList"
    />
  </div>
</template>

<script setup lang="ts">
import ActivityHotMap from '@/components/activity-hot-map/ActivityHotMap.vue';
import { ActivitiesList } from '@/modules/activities';

import { useActivities } from '../composables/activities-profile-settings/useActivities';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

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
