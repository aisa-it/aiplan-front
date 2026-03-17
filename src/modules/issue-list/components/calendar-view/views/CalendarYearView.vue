<template>
  <div class="calendar-year">
    <div
      v-for="m in months"
      :key="m.date.getMonth()"
      class="calendar-yer__item"
    >
      <BaseMiniCalendar
        :current-date="m.date"
        off-navigation
        class="calendar-yer__minicalendar"
      >
        <MiniCalendarGrid :days="m.days" off-highlight-to-day-in-other-month>
          <template #day-extra="{ day }">
            <EventDots
              v-if="props.eventsByDate.has(formatDayKey(day.date))"
              :types="props.eventsByDate.get(formatDayKey(day.date))!"
            />
          </template>
        </MiniCalendarGrid>
      </BaseMiniCalendar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarEventType } from '../types/calendar';
import BaseMiniCalendar from '../components/calendar-grid/BaseMiniCalendar.vue';
import MiniCalendarGrid from '../components/calendar-grid/MiniCalendarGrid.vue';
import { computed } from 'vue';
import { getMonthMatrix } from '../utils/calendarDates';
import EventDots from '../components/event/EventDots.vue';
import { formatDayKey } from '../utils/calendarDates';

const props = defineProps<{
  eventsByDate: Map<string, Set<CalendarEventType>>;
  range: Date[];
}>();

const months = computed(() =>
  props.range.map((date) => ({
    date,
    days: getMonthMatrix(date),
  })),
);
</script>

<style lang="scss" scoped>
.calendar-year {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  overflow-y: auto;
}

.calendar-yer__item {
  border: 1px solid var(--darkest-border-color);
  padding: 4px 0 16px 0;
  display: flex;
  justify-content: center;
}
</style>
