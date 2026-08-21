<template>
  <li class="flex items-center gap-2 py-2">
    <UserAvatar
      v-if="activity.actor_detail"
      :user="activity.actor_detail"
      no-hat
    />

    <div class="min-w-0 flex-1 wrap-break-word">
      <span class="font-semibold">{{ actorName }}{{ ' ' }}</span>
      <ActivityMessage :message="message" />

      <div v-if="activityDate" class="mt-0.5 text-xs whitespace-nowrap">
        {{ activityDate }}
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import UserAvatar from '@/components/user-avatar/UserAvatar.vue';

import ActivityMessage from './ActivityMessage.vue';
import { formatActivityDate } from '../utils/formatActivityDate';

import type { ActivityMessage as ActivityMessageModel } from '../renders/activity-renderer.types';
import type { DtoActivityEventFull } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  activity: DtoActivityEventFull;
  message: ActivityMessageModel;
}>();

const actorName = computed(() => {
  const actor = props.activity.actor_detail;

  return actor?.is_bot
    ? [actor.last_name, 'Бот'].filter(Boolean).join(' ')
    : [actor?.last_name, actor?.first_name].filter(Boolean).join(' ');
});

const activityDate = computed(() =>
  props.activity.created_at
    ? formatActivityDate(props.activity.created_at)
    : '',
);
</script>
