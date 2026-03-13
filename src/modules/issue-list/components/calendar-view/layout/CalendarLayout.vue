<template>
  <Transition :name="transitionName" mode="out-in">
    <component
      :is="currentView"
      :key="viewKey"
      :events-by-date="eventsForCurrentView as any"
      :range="rangeForView"
    />
  </Transition>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useCalendarStore } from '../store/calendar-store';
import { useCalendarEventStore } from '../store/calendar-event-store';
import { storeToRefs } from 'pinia';

const calendarEventStore = useCalendarEventStore();

const {
  viewMode,
  visibleDates,
  visibleMonths,
  currentDate,
  transitionDirection,
} = storeToRefs(useCalendarStore());

const eventsForCurrentView = computed(() => {
  if (viewMode.value === 'year') return calendarEventStore.eventsForYear;
  return calendarEventStore.eventsByDay;
});

const rangeForView = computed(() => {
  if (viewMode.value === 'year') return visibleMonths.value;
  return visibleDates.value;
});

const views = {
  week: defineAsyncComponent(() => import('../views/CalendarWeekView.vue')),
  month: defineAsyncComponent(() => import('../views/CalendarMonthView.vue')),
  year: defineAsyncComponent(() => import('../views/CalendarYearView.vue')),
};

const currentView = computed(() => views[viewMode.value] ?? views.week);

const transitionName = computed(() =>
  transitionDirection.value === 'forward' ? 'slide-left' : 'slide-right',
);

const viewKey = computed(() => {
  if (viewMode.value === 'week') {
    return `week-${currentDate.value.toISOString()}`;
  }
  if (viewMode.value === 'month') {
    return `month-${currentDate.value.getFullYear()}-${currentDate.value.getMonth()}`;
  }
  return `year-${currentDate.value.getFullYear()}`;
});
</script>

<style lang="scss" scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.2s ease;
}

.slide-left-enter-from {
  transform: translateX(12px);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-12px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-12px);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(12px);
  opacity: 0;
}
</style>
