<template>
  <div class="calendar">
    <div class="calendar__title"></div>
    <CalendarHeader class="header" />
    <CalendarSidebar class="sidebar" />
    <CalendarLayout class="layout" />
  </div>
</template>

<script setup lang="ts">
import CalendarHeader from './layout/CalendarHeader.vue';
import CalendarSidebar from './layout/CalendarSidebar.vue';
import CalendarLayout from './layout/CalendarLayout.vue';
import { useCalendarEventStore } from './store/calendar-event-store';
import { useCalendarStore } from './store/calendar-store';
import { useCalendarFiltersStore } from './store/filters-store';
import { watchEffect } from 'vue';

const calendarEventStore = useCalendarEventStore();
const calendarStore = useCalendarStore();
const calendarFilterStore = useCalendarFiltersStore();

watchEffect(async () => {
  await calendarEventStore.loadEvents(
    calendarStore.visibleRange,
    calendarFilterStore.enabledTypesArray,
    calendarFilterStore.filters,
  );
});
</script>

<style scoped lang="scss">
.calendar {
  display: grid;
  grid-template-columns: 336px 1fr;
  grid-template-rows: 64px minmax(0, calc(100vh - 136px));
  //grid-template-rows: 64px 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
  border-bottom: 1px solid var(--darkest-border-color) !important;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.calendar__title {
  grid-area: 1 / 1 / 2 / 2;
  border-bottom: 1px solid var(--darkest-border-color);
}

.header {
  grid-area: 1 / 2 / 2 / 3;
}
.sidebar {
  grid-area: 2 / 1 / 3 / 2;
  overflow-y: auto;
}
.layout {
  grid-area: 2 / 2 / 3 / 3;
  font-size: 16px;
  letter-spacing: 0.5px;
  min-height: 0;
  height: 100%;
  overflow: hidden;
}
</style>
