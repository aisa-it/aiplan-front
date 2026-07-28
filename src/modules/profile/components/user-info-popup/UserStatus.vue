<template>
  <v-tooltip v-if="status" location="top">
    <template #activator="{ props: tooltipProps }">
      <div
        v-bind="tooltipProps"
        class="flex items-center justify-center gap-2 text-center"
      >
        <v-btn
          v-if="!icon"
          variant="text"
          density="compact"
          rounded="xl"
          :size="size ?? 18"
          class="min-w-0 p-0"
        >
          {{ statusEmoji || '➕' }}
        </v-btn>

        <span v-else-if="statusEmoji" class="text-base leading-none">
          {{ statusEmoji }}
        </span>
      </div>
    </template>

    <div class="text-center">
      <span class="text-sm font-medium">
        {{ status }}

        <span v-if="formattedStatusEndTime" class="text-xs">
          (до {{ formattedStatusEndTime }})
        </span>
      </span>
    </div>
  </v-tooltip>

  <div v-else class="flex items-center justify-center gap-2 text-center">
    <v-btn
      v-if="!icon"
      variant="text"
      density="compact"
      rounded="xl"
      :size="size ?? 18"
      class="min-w-0 p-0"
    >
      {{ statusEmoji || '➕' }}
    </v-btn>

    <span v-else-if="statusEmoji" class="text-base leading-none">
      {{ statusEmoji }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { formatDateTime, formatTime, isTodayDate } from '../../utils/time';

interface Props {
  status: string;
  statusEmoji?: string | null;
  statusEndTime?: string | null;
  size?: number | string;
  icon?: boolean;
}

const props = defineProps<Props>();

const formattedStatusEndTime = computed(() => {
  if (!props.statusEndTime) {
    return null;
  }

  return isTodayDate(props.statusEndTime)
    ? formatTime(props.statusEndTime)
    : formatDateTime(props.statusEndTime);
});
</script>
