<template>
  <div class="calendar">
    <CalendarHeader class="header" />
    <CalendarSidebar class="sidebar" />
    <CalendarLayout class="layout" />
  </div>
</template>

<script setup lang="ts">
import CalendarHeader from './layout/CalendarHeader.vue';
import CalendarSidebar from './layout/CalendarSidebar.vue';
import CalendarLayout from './layout/CalendarLayout.vue';
import { mockCalendarEvents } from './mockData/mockCalendarEvents';
import { useCalendarEventStore } from './store/calendar-event-store';

const calendarEventStore = useCalendarEventStore();

calendarEventStore.setEvents(mockCalendarEvents);

// watch(
//   () => [
//     calendarStore.visibleRange,
//     filtersStore.activeFilters,
//   ],
//   async () => {
//     const { from, to } = calendarStore.visibleRange;

//     const issues = await api.loadIssues({
//       from,
//       to,
//       filters: filtersStore.apiFilters,
//     });

//     eventsStore.setEvents(
//       mapIssuesToCalendarEvents(issues),
//     );
//   },
//   { immediate: true },
// );
</script>

<style scoped lang="scss">
.calendar {
  display: grid;
  grid-template-columns: 336px 1fr;
  grid-template-rows: 64px 1fr;
  grid-column-gap: 0px;
  grid-row-gap: 0px;
}

.header {
  grid-area: 1 / 2 / 2 / 3;
}
.sidebar {
  grid-area: 2 / 1 / 3 / 2;
}
.layout {
  grid-area: 2 / 2 / 3 / 3;
}
</style>
