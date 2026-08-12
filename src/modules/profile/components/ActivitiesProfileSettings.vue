<template>
  <div class="py-6">
    <ActivityHotMap
      v-if="Object.keys(userActivityMap).length || loadReq"
      :activities="userActivityMap"
      :load-req="loadReq"
    />
    <div v-else>У пользователя не было активности</div>

    <!-- TODO: перенести ActivitiesList -->
  </div>
</template>

<script setup lang="ts">
import ActivityHotMap from '@/components/activity-hot-map/ActivityHotMap.vue';

import { useActivities } from '../composables/activities-profile-settings/useActivities';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{
  user: DtoUser;
}>();

const { loadReq, userActivityMap } = useActivities();
</script>
