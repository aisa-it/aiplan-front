<template>
  <div class="calendar-grid" :class="`calendar-grid-${period}`">
    <div v-if="period === 'month'" v-for="name in weekdays" :key="name" class="calendar-weekday">
      {{ name }}
    </div>
    <div
      v-for="date in days"
      :key="dayKey(date)"
      class="calendar-day"
      :class="{ 'calendar-month-cell': period === 'month', 'calendar-outside-month': date.getMonth() !== currentDate.getMonth() }"
    >
      <div v-if="period === 'week'" class="calendar-weekday">{{ weekdayFormatter.format(date) }}</div>
      <div class="calendar-day-number">
        <span :class="{ 'calendar-today': dayKey(date) === today }">{{ date.getDate() }}</span>
      </div>
      <CalendarDayEvents
        :day="date"
        :events="events.get(dayKey(date)) ?? emptyEvents"
        :issues="issues"
        :loading="loading"
        :highlighted-issue="preview?.event.issueId"
        :open-event="preview?.event.id"
        @inspect="openPreview"
        @leave="scheduleClose"
      />
    </div>

    <v-menu
      v-if="preview && previewIssue"
      :model-value="true"
      :activator="preview.target"
      :open-on-click="false"
      :open-on-focus="false"
      :close-on-content-click="false"
      :persistent="locked"
      location="bottom start"
      :offset="15"
      @update:model-value="(open) => { if (!open) closePreview(); }"
    >
      <div @pointerenter="enterPreview" @pointerleave="leavePreview">
        <CalendarEventCard
          :key="preview.event.id"
          v-model:locked="locked"
          :issue="previewIssue"
          :event-type="preview.event.type"
        />
      </div>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, shallowRef, watchPostEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import CalendarDayEvents from './CalendarDayEvents.vue';
import CalendarEventCard from './CalendarEventCard.vue';
import { addDays, dayKey, getCalendarRange, type CalendarPeriod } from '../utils/calendar-dates';
import type { CalendarEvent } from '../utils/calendar-events';

const props = defineProps<{
  currentDate: Date;
  period: Exclude<CalendarPeriod, 'year'>;
  events: Map<string, CalendarEvent[]>;
  issues: Map<string, DtoIssueWithCount>;
  loading: boolean;
}>();
const { locale } = useI18n();
const emptyEvents: CalendarEvent[] = [];
const today = dayKey(new Date());
const days = computed(() => {
  const { start } = getCalendarRange(props.currentDate, props.period);
  return Array.from({ length: props.period === 'week' ? 7 : 42 }, (_, day) => addDays(start, day));
});
const weekdayFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { weekday: 'short' }));
const weekdays = computed(() => days.value.slice(0, 7).map((date) => weekdayFormatter.value.format(date)));

const preview = shallowRef<{ event: CalendarEvent; target: HTMLElement }>();
const previewIssue = computed(() => preview.value && props.issues.get(preview.value.event.issueId));
const locked = ref(false);
let onEvent = false;
let inPreview = false;
let closeTimer: ReturnType<typeof setTimeout> | undefined;

function openPreview(event: CalendarEvent, target: HTMLElement) {
  if (locked.value && preview.value?.event.id !== event.id) return;
  clearTimeout(closeTimer);
  onEvent = true;
  if (preview.value?.event.id === event.id && preview.value.target === target) return;
  inPreview = false;
  preview.value = { event, target };
}

function scheduleClose(id?: string) {
  if (id !== undefined && id !== preview.value?.event.id) return;
  if (id !== undefined) onEvent = false;
  clearTimeout(closeTimer);
  if (!onEvent && !inPreview && !locked.value) closeTimer = setTimeout(closePreview, 140);
}

function enterPreview() {
  inPreview = true;
  clearTimeout(closeTimer);
}

function leavePreview() {
  inPreview = false;
  scheduleClose();
}

function closePreview() {
  clearTimeout(closeTimer);
  locked.value = false;
  preview.value = undefined;
  onEvent = false;
  inPreview = false;
}

watchPostEffect(() => {
  if (!preview.value) return;
  if (!previewIssue.value || !preview.value.target.isConnected) closePreview();
  else if (!locked.value) scheduleClose();
});

onBeforeUnmount(() => clearTimeout(closeTimer));
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  height: 100%;
  min-height: 0;
  overflow: auto;
  font-size: 16px;
  letter-spacing: 0.5px;
}
.calendar-grid-week { grid-template-rows: minmax(0, 1fr); }
.calendar-grid-month { grid-template-rows: 48px repeat(6, minmax(120px, 1fr)); }
.calendar-day {
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  min-height: 0;
  border-right: 1px solid var(--calendar-grid-line);
}
.calendar-month-cell {
  grid-template-rows: auto minmax(0, 1fr);
  border: 1px solid var(--calendar-grid-line);
}
.calendar-weekday {
  display: grid;
  min-height: 48px;
  place-items: center;
  text-transform: capitalize;
  border-bottom: 1px solid var(--calendar-grid-line);
}
.calendar-grid-week .calendar-weekday { min-height: 51px; }
.calendar-grid-month > .calendar-weekday { border: 1px solid var(--calendar-grid-line); }
.calendar-day-number { padding: 4px 0 8px; text-align: center; }
.calendar-month-cell .calendar-day-number { padding-bottom: 4px; }
.calendar-month-cell.calendar-outside-month .calendar-day-number { opacity: 0.4; }
.calendar-today {
  padding: 2px 8px;
  border: 2px solid var(--calendar-date-accent);
  border-radius: 16px;
  color: var(--calendar-date-accent);
}
</style>
