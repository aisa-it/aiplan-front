<template>
  <v-tooltip location="bottom">
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        variant="text"
        density="compact"
        rounded
        class="min-w-0 p-6 text-lg"
        size="18"
        :class="{ 'p-0!': onlyShow }"
      >
        {{ statusEmoji || '➕' }}
      </v-btn>
    </template>

    <div class="text-center">
      <span class="text-sm font-medium">
        {{ status || t('userStatus.select') }}

        <span v-if="formattedStatusEndDate" class="text-xs">
          {{ t('userStatus.until', { date: formattedStatusEndDate }) }}
        </span>
      </span>
    </div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { formatDateTime, formatTime, isTodayDate } from '@/utils/time';

import { getStatusKeyByText } from '../UserStatus.config';

import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

interface Props {
  user: DtoUser;
  onlyShow?: boolean;
}

const props = defineProps<Props>();

const { t } = useI18n();

const status = computed(() => {
  const key = getStatusKeyByText(props.user.status);
  return key ? t(`userStatus.statuses.${key}`) : props.user.status;
});

const statusEmoji = computed(() => props.user.status_emoji);
const statusEndDate = computed(() => props.user.status_end_date);

const formattedStatusEndDate = computed(() => {
  if (!statusEndDate.value) {
    return null;
  }

  return isTodayDate(statusEndDate.value)
    ? formatTime(statusEndDate.value)
    : formatDateTime(statusEndDate.value);
});
</script>
