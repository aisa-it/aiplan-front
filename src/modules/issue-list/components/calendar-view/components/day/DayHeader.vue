<template>
  <div>
    <div
      v-if="!weekdayNone"
      class="day-header__weekday"
      :class="{ border: !borderNone }"
    >
      {{ formatWeekDay(day) }}
    </div>
    <div class="day-header__number">
      <span :class="{ today: isSameDay(day, today) }">
        {{ formatDayNumber(day) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isSameDay } from '../../utils/calendarDates';

defineProps<{ day: Date; borderNone?: boolean; weekdayNone?: boolean }>();

const today = new Date();

const weekdayFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
});

const dayFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
});

function formatWeekDay(day: Date) {
  return weekdayFormatter.format(day);
}

function formatDayNumber(day: Date) {
  return dayFormatter.format(day);
}
</script>

<style lang="scss" scoped>
.border {
  border-bottom: 1px solid var(--darkest-border-color);
}
.day-header__weekday {
  padding: 13px 0;
  text-align: center;
  text-transform: capitalize;
}

.day-header__number {
  padding: 4px 0;
  text-align: center;
}

.today {
  color: $primary;
  border: 2px solid $primary;
  border-radius: 16px;
  padding: 2px 8px;
}
</style>
