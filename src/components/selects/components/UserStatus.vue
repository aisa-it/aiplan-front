<template>
  <div class="flex flex-center gap-2 items-center text-center">
    <q-btn
      v-if="!icon"
      flat
      round
      :icon="statusEmoji || `➕`"
      :size="size || '18px'"
      dense
    />
    <q-icon v-if="statusEmoji && icon" :name="statusEmoji" class="text-16" />
    <HintTooltip v-if="status">
      <p class="flex justify-center items-center q-mb-none">
        <span class="text-subtitle2">
          {{ status }}
          <span class="text-caption" v-if="statusEndTime">
            (до {{ formatStatusEndTime() }})
          </span>
        </span>
      </p>
    </HintTooltip>
  </div>
</template>

<script setup lang="ts">
//utils
import {
  formatDateTime,
  formatTime,
  isTodayDate,
} from 'src/utils/time';

const props = defineProps<{
  status: string;
  statusEmoji?: string | null | undefined;
  statusEndTime?: string | null | undefined;
  size?: string;
  icon?: boolean;
}>();

const formatStatusEndTime = () => {
  if (!props.statusEndTime) return;

  const isToday = isTodayDate(props.statusEndTime);

  return isToday
    ? formatTime(props.statusEndTime)
    : formatDateTime(props.statusEndTime);
};
</script>
