<template>
  <div class="mini-month">
    <div class="mini-month-heading">
      <v-btn v-if="navigation" icon variant="text" color="icon" size="40"
        :aria-label="t('issues.calendar.previous')" @click="emit('shift', -1)">
        <v-icon icon="mdi-chevron-left" size="18" />
      </v-btn>
      <span>{{ monthName }}</span>
      <v-btn v-if="navigation" icon variant="text" color="icon" size="40"
        :aria-label="t('issues.calendar.next')" @click="emit('shift', 1)">
        <v-icon icon="mdi-chevron-right" size="18" />
      </v-btn>
    </div>
    <div class="mini-month-grid">
      <span v-for="name in weekdays" :key="name" class="mini-month-weekday">{{ name }}</span>
      <div v-for="day in days" :key="day.key" class="mini-month-day" :class="day.classes">
        <span class="mini-month-day-number">{{ day.date.getDate() }}</span>
        <div v-if="day.types.size" class="mini-month-dots">
          <span
            v-for="type in day.types"
            :key="type"
            :aria-label="t(`issues.calendar.${type}`)"
            :style="{ backgroundColor: EVENT_TYPES[type].color }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { dayKey, monthGrid } from '../utils/calendar-dates';
import { EVENT_TYPES, type CalendarEvent } from '../utils/calendar-events';

const props = defineProps<{
  date: Date;
  navigation?: boolean;
  highlightedWeek?: readonly [string, string];
  eventsByDay?: Map<string, CalendarEvent[]>;
}>();
const emit = defineEmits<{ shift: [direction: -1 | 1] }>();
const { t, locale } = useI18n();
const monthName = computed(() => props.date.toLocaleDateString(locale.value, { month: 'long' }));
const dates = computed(() => monthGrid(props.date));
const weekdays = computed(() => {
  const formatter = new Intl.DateTimeFormat(locale.value, { weekday: 'short' });
  return dates.value.slice(0, 7).map((date) => formatter.format(date));
});
const days = computed(() => {
  const today = dayKey(new Date());
  const week = props.highlightedWeek;
  return dates.value.map((date) => {
    const key = dayKey(date);
    const outside = date.getMonth() !== props.date.getMonth();
    return {
      date, key,
      types: new Set(props.eventsByDay?.get(key)?.map((event) => event.type)),
      classes: {
        outside,
        today: key === today && (!outside || props.navigation),
        highlighted: week && key >= week[0] && key <= week[1],
        'week-start': key === week?.[0],
        'week-end': key === week?.[1],
      },
    };
  });
});
</script>

<style scoped>
.mini-month { width: min(100%, 336px); padding: 4px 16px; }
.mini-month-heading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: capitalize;
}
.mini-month-heading:has(button) { justify-content: space-between; }
.mini-month-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  row-gap: 4px;
  font-size: 16px;
  letter-spacing: 0.5px;
}
.mini-month-weekday, .mini-month-day { display: grid; min-height: 40px; place-content: center; }
.mini-month-weekday { text-transform: capitalize; }
.mini-month-day { position: relative; }
.mini-month-day-number {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  border-radius: 16px;
}
.mini-month-day.outside { color: var(--calendar-muted-date); }
.mini-month-day.today .mini-month-day-number {
  color: var(--calendar-date-accent);
  box-shadow: inset 0 0 0 2px var(--calendar-date-accent);
}
.mini-month-day.highlighted::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(63, 118, 255, 0.3);
}
.mini-month-day.week-start::before { inset-inline-start: 50%; }
.mini-month-day.week-end::before { inset-inline-end: 50%; }
.mini-month-day.week-start .mini-month-day-number,
.mini-month-day.week-end .mini-month-day-number {
  color: white;
  background: var(--calendar-date-accent);
}
.mini-month-dots { position: absolute; bottom: 2px; left: 50%; display: flex; gap: 2px; transform: translateX(-50%); }
.mini-month-dots span { width: 4px; height: 4px; border-radius: 50%; }
</style>
