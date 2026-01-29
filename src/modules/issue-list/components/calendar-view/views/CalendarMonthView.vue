<template>
  <div class="month-grid">
    <div v-for="d in weekdays" :key="'h-' + d" class="month-grid__header">
      {{ d }}
    </div>

    <div
      v-for="day in range"
      :key="day.toISOString()"
      class="month-grid__cell"
      :class="{ 'is-outside': !isSameMonth(day, currentDate) }"
    >
      <DayHeader :day="day" weekday-none />
      <DayEvents
        :events="eventsByDate.get(formatDayKey(day)) ?? []"
        :day="day"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useCalendarStore } from '../store/calendar-store';
import { formatDayKey, isSameMonth } from '../utils/calendarDates';
import { CalendarEvent } from '../types/calendar';
import DayHeader from '../components/day/DayHeader.vue';
import DayEvents from '../components/day/DayEvents.vue';

defineProps<{
  eventsByDate: Map<string, CalendarEvent[]>;
  range: Date[];
}>();

const { currentDate } = storeToRefs(useCalendarStore());

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
</script>

<style lang="scss" scoped>
.month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: 48px repeat(6, minmax(120px, 1fr));
  height: 100%;
}

.month-grid__header {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  border: 1px solid var(--darkest-border-color);
}

.month-grid__cell {
  padding: 4px;
  overflow: hidden;
  border: 1px solid var(--darkest-border-color);
}

.month-grid__cell :deep(.week-grid__events) {
  height: calc(100% - 32px);
}

.month-grid__cell :deep(.week-grid__event) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
}

.month-grid__cell.is-outside :deep(.day-header__number) {
  opacity: 0.4;
}
</style>
