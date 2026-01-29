<template>
  <div class="mini-calendar__grid">
    <div
      v-for="day in days"
      :key="day.date.toISOString()"
      class="mini-calendar__day"
      :class="dayClasses(day)"
    >
      {{ day.date.getDate() }}

      <slot name="day-extra" :day="day" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { MiniCalendarDay } from '../../types/calendar';

const props = defineProps<{
  days: MiniCalendarDay[];
  offHighlightToDayInOtherMonth?: boolean;
}>();

function dayClasses(day: MiniCalendarDay) {
  return {
    'is-outside': !day.isCurrentMonth,
    'is-today':
      day.isToday &&
      (day.isCurrentMonth || !props.offHighlightToDayInOtherMonth),
    'is-highlighted-week': day.isInHighlightedWeek,
    'is-highlighted-border':
      day.isInHighlightedBorderStart || day.isInHighlightedBorderEnd,
    'is-highlighted-border-start': day.isInHighlightedBorderStart,
    'is-highlighted-border-end': day.isInHighlightedBorderEnd,
  };
}
</script>

<style lang="scss" scoped>
.mini-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  row-gap: 4px;
  column-gap: 0;
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
  width: 100%;
  position: absolute;
  top: 0;

  background: rgba(63, 118, 255, 0.3);
}
.mini-calendar__day.is-today.is-highlighted-week::before {
  width: calc(100% + 4px);
  top: -2px;
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

.mini-calendar__day.is-today.is-highlighted-border.is-highlighted-border-start::before,
.mini-calendar__day.is-today.is-highlighted-border.is-highlighted-border-end::before {
  width: 28px;
}
</style>
