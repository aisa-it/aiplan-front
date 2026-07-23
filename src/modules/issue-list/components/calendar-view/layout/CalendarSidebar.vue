<template>
  <div class="calendar__sidebar">
    <MiniCalendar />
    <CalendarEventTypeFilter />
    <CalendarViewSettings />
  </div>
</template>

<script setup lang="ts">
import MiniCalendar from '../components/calendar-grid/MiniCalendar.vue';
import CalendarEventTypeFilter from '../components/controls/CalendarEventTypeFilter.vue';
import CalendarViewSettings from '../components/controls/CalendarViewSettings.vue';
</script>

<style lang="scss" scoped>
.calendar__sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
