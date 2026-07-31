<template>
  <v-tooltip location="bottom">
    <template #activator="{ props: tooltipProps }">
      <div
        v-bind="tooltipProps"
        class="flex items-center justify-center gap-2 text-center"
      >
        <v-btn
          variant="text"
          density="compact"
          rounded
          :size="size ?? 18"
          class="min-w-0 p-6"
          :class="{ 'p-0!': onlyShow }"
        >
          {{ status_emoji || '➕' }}
        </v-btn>
      </div>
    </template>

    <div class="text-center">
      <span class="text-sm font-medium">
        {{ status || 'Выбрать статус' }}

        <span v-if="formattedStatusEndDate" class="text-xs">
          (до {{ formattedStatusEndDate }})
        </span>
      </span>
    </div>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';

import { formatDateTime, formatTime, isTodayDate } from '../../utils/time';
import type { DtoUser } from '@aisa-it/aiplan-api-ts/src/data-contracts';

interface Props {
  user: DtoUser;
  size?: number | string;
  onlyShow?: boolean;
}

const props = defineProps<Props>();

const { status, status_emoji, status_end_date } = toRefs(props.user);

const formattedStatusEndDate = computed(() => {
  if (!status_end_date || !status_end_date.value) {
    return null;
  }

  return isTodayDate(status_end_date.value)
    ? formatTime(status_end_date.value)
    : formatDateTime(status_end_date.value);
});
</script>
