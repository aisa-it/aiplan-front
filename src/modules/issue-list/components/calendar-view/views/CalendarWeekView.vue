<template>
  <div class="week-grid">
    <div v-for="day in range" :key="day.toISOString()" class="week-grid__day">
      <DayHeader class="week-grid__day-header" :day="day" />

      <DayEvents
        :events="eventsByDate.get(formatDayKey(day)) ?? []"
        :day="day"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DayHeader from '../components/day/DayHeader.vue';
import DayEvents from '../components/day/DayEvents.vue';

import { formatDayKey } from '../utils/calendarDates';

import { CalendarEvent } from '../types/calendar';

const props = defineProps<{
  eventsByDate: Map<string, CalendarEvent[]>;
  range: Date[];
}>();
</script>

<style lang="scss" scoped>
.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.week-grid__day {
  min-height: 0;
  display: grid;
  grid-template-rows: auto 1fr;
  border-right: 1px solid var(--darkest-border-color);
}

.week-grid__day-header {
  margin-bottom: 8px;
  flex-shrink: 0;
}
</style>
