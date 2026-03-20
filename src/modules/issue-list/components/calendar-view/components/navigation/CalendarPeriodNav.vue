<template>
  <PeriodNav
    :current-date="calendarStore.currentDate"
    :view-mode="calendarStore.viewMode"
    @prev="calendarStore.prev()"
    @next="calendarStore.next()"
  />
</template>

<script setup lang="ts">
import PeriodNav from './PeriodNav.vue';
import { useCalendarStore } from '../../store/calendar-store';

const calendarStore = useCalendarStore();
</script>

<style scoped lang="scss">
:deep(.calendar-period-nav__label) {
  font-weight: 500;
  font-size: 20px;
  letter-spacing: 0.15px;
}
</style>
