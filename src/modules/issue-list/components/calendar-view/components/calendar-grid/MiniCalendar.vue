<template>
  <BaseMiniCalendar
    :current-date="calendarStore.currentDate"
    @next-month="nextMonth"
    @prev-month="prevMonth"
  >
    <Transition :name="transitionName" mode="out-in">
      <MiniCalendarGrid
        :key="
          calendarStore.currentDate.getFullYear() +
          '-' +
          calendarStore.currentDate.getMonth()
        "
        :days="days"
      />
    </Transition>
  </BaseMiniCalendar>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getMonthMatrix } from '../../utils/calendarDates';
import { useCalendarStore } from '../../store/calendar-store';

import BaseMiniCalendar from './BaseMiniCalendar.vue';
import MiniCalendarGrid from './MiniCalendarGrid.vue';

const calendarStore = useCalendarStore();

const highlightedWeek = computed(() => {
  if (calendarStore.viewMode !== 'week') return [];
  return calendarStore.visibleDates;
});

const days = computed(() =>
  getMonthMatrix(
    calendarStore.currentDate,
    calendarStore.viewMode === 'week' ? highlightedWeek.value : undefined,
  ),
);

const transitionName = ref<'slide-left' | 'slide-right'>('slide-left');

function prevMonth() {
  transitionName.value = 'slide-right';
  calendarStore.prev('month');
}

function nextMonth() {
  transitionName.value = 'slide-left';
  calendarStore.next('month');
}
</script>

<style scoped lang="scss">
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
