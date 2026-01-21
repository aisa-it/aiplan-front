<template>
  <div class="mini-calendar">
    <PeriodNav
      class="mini-calendar__header"
      :current-date="calendarStore.currentDate"
      view-mode="month"
      full-size
      @prev="prevMonth"
      @next="nextMonth"
    />

    <div class="mini-calendar__weekdays">
      <div v-for="d in weekdays" :key="d" class="weekday">
        {{ d }}
      </div>
    </div>

    <Transition :name="transitionName" mode="out-in">
      <div
        class="mini-calendar__grid"
        :key="
          calendarStore.currentDate.getFullYear() +
          '-' +
          calendarStore.currentDate.getMonth()
        "
      >
        <div
          v-for="day in days"
          :key="day.date.toISOString()"
          class="mini-calendar__day"
          :class="dayClasses(day)"
        >
          {{ day.date.getDate() }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { getMonthMatrix } from '../../utils/calendarDates';
import { MiniCalendarDay } from '../../types/calendar';
import PeriodNav from '../../ui/PeriodNav.vue';
import { useCalendarStore } from '../../store/calendar-store';

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

const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const transitionName = ref<'slide-left' | 'slide-right'>('slide-left');

function prevMonth() {
  transitionName.value = 'slide-right';
  calendarStore.prev('month');
}

function nextMonth() {
  transitionName.value = 'slide-left';
  calendarStore.next('month');
}

function dayClasses(day: MiniCalendarDay) {
  return {
    'is-outside': !day.isCurrentMonth,
    'is-today': day.isToday,
    'is-highlighted-week': day.isInHighlightedWeek,
    'is-highlighted-border':
      day.isInHighlightedBorderStart || day.isInHighlightedBorderEnd,
    'is-highlighted-border-start': day.isInHighlightedBorderStart,
    'is-highlighted-border-end': day.isInHighlightedBorderEnd,
  };
}
</script>

<style scoped lang="scss">
.mini-calendar {
  color: var(--q-text-color);
  padding: 4px 16px;
}

.mini-calendar__header {
  margin-bottom: 8px;
}

.mini-calendar__month {
  font-weight: 600;
  text-transform: capitalize;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.mini-calendar__weekdays,
.mini-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
  column-gap: 0;
}

:deep(.q-btn--dense) {
  padding: 0;
  height: 40px;
  width: 40px;
}

.weekday {
  height: 40px;
  width: 40px;
  text-align: center;
  line-height: 40px;
  font-size: 16px;
  letter-spacing: 0.5px;
}

.mini-calendar__day {
  height: 40px;
  font-size: 16px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  position: relative;
}

.mini-calendar__day.is-outside {
  color: var(--sub-text-color);
}

.mini-calendar__day.is-today {
  border-radius: 16px;
  border: 2px solid var(--q-primary);
  color: var(--q-primary);
}

.mini-calendar__day.is-highlighted-week::before {
  content: '';
  height: 40px;
  width: 43.42px;
  position: absolute;
  top: 0;

  background: rgba(63, 118, 255, 0.3);
}
.mini-calendar__day.is-today.is-highlighted-week::before {
  top: -1px;
}

.mini-calendar__day.is-highlighted-border {
  background-color: var(--q-primary);
  border-radius: 16px;
  color: white;
}

.mini-calendar__day.is-highlighted-border.is-highlighted-border-start::before {
  width: 30px;
  left: 13.42px;
}

.mini-calendar__day.is-highlighted-border.is-highlighted-border-end::before {
  width: 30px;
  right: 13.42px;
}

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
