<template>
  <div ref="viewport" class="calendar-day-events">
    <template v-if="loading && !rows.length">
      <v-skeleton-loader v-for="line in 2" :key="line" type="text" />
    </template>
    <template v-else>
      <button
        v-for="row in visibleRows"
        :key="row.event.id"
        type="button"
        class="calendar-event"
        :class="{ 'calendar-event-dimmed': highlightedIssue && highlightedIssue !== row.event.issueId }"
        :style="{ backgroundColor: EVENT_TYPES[row.event.type].color }"
        @pointerenter="inspect(row.event, $event)"
        @pointerleave="emit('leave', row.event.id)"
        @click="inspect(row.event, $event)"
      >
        {{ row.label }}
      </button>

      <v-menu
        v-if="hiddenRows.length"
        v-model="moreOpen"
        :close-on-content-click="false"
        :persistent="hiddenRows.some(({ event }) => event.id === openEvent)"
        location="bottom start"
      >
        <template #activator="{ props: activatorProps }">
          <button v-bind="activatorProps" class="calendar-more" type="button">
            {{ t('issues.calendar.more', { count: hiddenRows.length }) }}
          </button>
        </template>
        <div class="calendar-more-menu">
          <div class="calendar-more-header">
            <div class="calendar-more-weekday">{{ weekdayLabel }}</div>
            <div>
              <span :class="{ 'calendar-more-today': isToday }">{{ day.getDate() }}</span>
            </div>
            <v-btn
              class="calendar-more-close"
              icon
              variant="text"
              color="icon"
              size="32"
              :aria-label="t('issues.calendar.close')"
              @click="moreOpen = false"
            >
              <v-icon icon="mdi-close" size="18" />
            </v-btn>
          </div>
          <div class="grid gap-1">
            <button
              v-for="row in hiddenRows"
              :key="row.event.id"
              type="button"
              class="calendar-event"
              :class="{ 'calendar-event-dimmed': highlightedIssue && highlightedIssue !== row.event.issueId }"
              :style="{ backgroundColor: EVENT_TYPES[row.event.type].color }"
              @pointerenter="inspect(row.event, $event)"
              @pointerleave="emit('leave', row.event.id)"
              @click="inspect(row.event, $event)"
            >
              {{ row.label }}
            </button>
          </div>
        </div>
      </v-menu>
    </template>

    <div v-if="rows.length" ref="measure" class="calendar-day-measure" aria-hidden="true">
      <div v-for="row in candidates" :key="row.event.id" class="calendar-event">{{ row.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchPostEffect } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { dayKey } from '../utils/calendar-dates';
import { EVENT_TYPES, type CalendarEvent } from '../utils/calendar-events';

const props = defineProps<{
  day: Date;
  events: CalendarEvent[];
  issues: Map<string, DtoIssueWithCount>;
  loading: boolean;
  highlightedIssue?: string;
  openEvent?: string;
}>();
const emit = defineEmits<{
  inspect: [event: CalendarEvent, target: HTMLElement];
  leave: [id: string];
}>();
const { t, locale } = useI18n();
const weekdayLabel = computed(() => props.day.toLocaleDateString(locale.value, { weekday: 'short' }));
const isToday = computed(() => dayKey(props.day) === dayKey(new Date()));
const viewport = ref<HTMLElement>();
const measure = ref<HTMLElement>();
const moreOpen = ref(false);
const visibleCount = ref(0);
const { width, height } = useElementSize(viewport);
const { height: measuredHeight } = useElementSize(measure);

const rows = computed(() => props.events.flatMap((event) => {
  const issue = props.issues.get(event.issueId);
  if (!issue) return [];
  return [{ event, label: `${issue.project_detail?.identifier ?? ''}-${issue.sequence_id ?? ''} ${issue.name ?? ''}` }];
}));
// A row is at least 32 px tall, so later rows cannot be visible.
const candidates = computed(() => rows.value.slice(0, Math.floor(height.value / 32) + 1));
const visibleRows = computed(() => rows.value.slice(0, visibleCount.value));
const hiddenRows = computed(() => rows.value.slice(visibleCount.value));

watchPostEffect(() => {
  const room = height.value;
  // Remeasure when available width, text wrapping or font metrics change.
  if (!measure.value || !width.value || !measuredHeight.value) {
    visibleCount.value = 0;
    return;
  }
  const ends = [...measure.value.children].map((row) => {
    const element = row as HTMLElement;
    return element.offsetTop + element.offsetHeight;
  });
  const allFit = ends.length === rows.value.length && (ends.at(-1) ?? 0) <= room;
  const limit = allFit ? room : room - 28; // Overflow button and the gap above it.
  visibleCount.value = ends.filter((end) => end <= limit).length;
});

function inspect(event: CalendarEvent, pointer: MouseEvent) {
  if (pointer.currentTarget instanceof HTMLElement) {
    emit('inspect', event, pointer.currentTarget);
  }
}
</script>

<style scoped>
.calendar-day-events {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 0;
  overflow: hidden;
  padding: 4px;
}
.calendar-day-measure {
  position: absolute;
  inset: 4px 4px auto;
  display: grid;
  gap: 4px;
  visibility: hidden;
  pointer-events: none;
}
.calendar-event {
  display: block;
  width: 100%;
  flex: none;
  padding: 5px 4px;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  line-height: 22px;
  text-align: left;
  overflow-wrap: anywhere;
}
button.calendar-event { cursor: pointer; }
.calendar-event-dimmed { filter: brightness(0.6); transition: filter 0.3s ease; }
.calendar-more { min-height: 24px; flex: none; align-self: start; color: rgb(var(--v-theme-primary)); cursor: pointer; }
.calendar-more-menu {
  position: relative;
  width: min(254px, calc(100vw - 24px));
  max-height: 50dvh;
  overflow: auto;
  padding: 16px 18px;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 16px;
  background: rgb(var(--v-theme-surface));
}
.calendar-more-header {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  text-align: center;
}
.calendar-more-weekday {
  margin-bottom: 8px;
  text-transform: uppercase;
}
.calendar-more-today {
  padding: 2px 8px;
  border: 2px solid currentColor;
  border-radius: 16px;
  color: #3f75ff;
}
.calendar-more-close {
  position: absolute;
  top: 10px;
  right: 10px;
}
.calendar-month-cell .calendar-day-events .calendar-event {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
