<template>
  <div class="py-6">
    <ActivityHotMap
      v-if="Object.keys(userActivityMap).length || loadReq"
      :activities="userActivityMap"
      :load-req="loadReq"
    />
    <div v-else>{{ t('profile.activities.empty') }}</div>

    <!-- TODO: перенести ActivitiesList -->
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import ActivityHotMap from '@/components/activity-hot-map/ActivityHotMap.vue';

import { useActivities } from '../composables/activities-profile-settings/useActivities';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{
  user: DtoUser;
}>();

const { t } = useI18n();

const { loadReq, userActivityMap } = useActivities();
</script>
