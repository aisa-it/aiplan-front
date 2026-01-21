<template>
  <div class="calendar__sidebar">
    <MiniCalendar />
    <CalendarEventTypeFilter />
    <CalendarViewSettings />
  </div>
</template>

<script setup lang="ts">
import MiniCalendar from '../components/sidebar/MiniCalendar.vue';
import CalendarEventTypeFilter from '../components/sidebar/CalendarEventTypeFilter.vue';
import CalendarViewSettings from '../components/sidebar/CalendarViewSettings.vue';
</script>

<style lang="scss" scoped>
.calendar__sidebar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
