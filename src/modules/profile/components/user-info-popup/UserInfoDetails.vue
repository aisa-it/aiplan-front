<template>
  <div
    class="flex flex-col flex-1 gap-0.5"
    :class="showAvatar ? 'w-[90%]' : 'w-full'"
  >
    <UserInfoRow v-if="tooltip" :text="tooltip" :center="isTextCenter">
      <UserStatusBadge :member="member" />
    </UserInfoRow>

    <UserInfoRow
      :text="`@${member?.username || ''}`"
      :center="isTextCenter"
      :show-status="!tooltip"
    >
      <UserStatusBadge v-if="!tooltip" :member="member" />
    </UserInfoRow>

    <span
      class="w-full text-sm wrap-break-word"
      :class="{
        'text-center': isTextCenter,
      }"
    >
      {{ member?.email }}
    </span>

    <span
      class="w-full text-sm wrap-break-word"
      :class="{
        'text-center': isTextCenter,
      }"
    >
      {{ formatTime(new Date(), member?.user_timezone) }}
      {{ getCityFromTimezone(member?.user_timezone) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { formatTime, getCityFromTimezone } from '../../utils/time';

import UserInfoRow from './UserInfoRow.vue';
import UserStatusBadge from './UserStatusBadge.vue';

defineProps<{
  member?: DtoUser;
  tooltip?: string;
  showAvatar: boolean;
  isTextCenter: boolean;
}>();
</script>
