<template>
  <div class="flex flex-col flex-1 gap-0.5 w-full">
    <UserInfoRow v-for="row in visibleRows" :key="row.key" :text="row.text">
      <UserStatusBadge v-if="row.showBadge" :member="user" />
    </UserInfoRow>
    <span v-if="!hideTime" class="w-full text-sm wrap-break-word">
      {{ formattedTime }}
      {{ timeCity }}
    </span>
  </div>
</template>

<script setup lang="ts">
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { formatTime, getCityFromTimezone } from '../../utils/time';
import { getUserName } from '../../utils/helpers.ts';

import UserInfoRow from './UserInfoRow.vue';
import UserStatusBadge from './UserStatusBadge.vue';
import { computed } from 'vue';
import {
  type DisplayOptions,
  DEFAULT_OPTIONS,
} from './UserInfoDetails.config.ts';

const props = withDefaults(
  defineProps<
    {
      user: DtoUser;
    } & DisplayOptions
  >(),
  DEFAULT_OPTIONS,
);

const fullName = computed(() => getUserName(props.user, props.hideBlockStatus));

const allRows = computed(() => [
  {
    key: 'fullName',
    text: fullName.value,
    visible: !props.hideFullName,
  },
  {
    key: 'userName',
    text: `@${props.user?.username || ''}`,
    visible: !props.hideUserName,
  },
  {
    key: 'email',
    text: `${props.user?.email || ''}`,
    visible: !props.hideEmail,
  },
]);

const visibleRows = computed(() => {
  const rows = allRows.value.filter((row) => row.visible);
  const showBadge = !props.hideStatus && rows.length > 0;
  return rows.map((row, index) => ({
    ...row,
    showBadge: showBadge && index === 0,
  }));
});

const formattedTime = computed(() =>
  formatTime(new Date(), props.user?.user_timezone),
);

const timeCity = computed(() => getCityFromTimezone(props.user?.user_timezone));
</script>
