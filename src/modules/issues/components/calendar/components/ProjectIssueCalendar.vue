<template>
  <div class="project-calendar">
    <header class="calendar-header">
      <div class="calendar-period-nav">
        <v-btn icon variant="text" color="icon" size="40"
          :aria-label="t('issues.calendar.previous')" @click="shift(-1)">
          <v-icon icon="mdi-chevron-left" size="18" />
        </v-btn>
        <span>{{ periodLabel }}</span>
        <v-btn icon variant="text" color="icon" size="40"
          :aria-label="t('issues.calendar.next')" @click="shift(1)">
          <v-icon icon="mdi-chevron-right" size="18" />
        </v-btn>
      </div>
      <v-select
        v-model="period"
        :items="periodOptions"
        :aria-label="t('issues.calendar.period')"
        class="calendar-period-select"
        density="compact"
        variant="outlined"
        hide-details
      />
    </header>

    <aside class="calendar-sidebar">
      <Transition :name="transition" mode="out-in">
        <CalendarMiniMonth
          :key="currentDate.getMonth() + ':' + currentDate.getFullYear()"
          :date="currentDate"
          :highlighted-week="highlightedWeek"
          navigation
          @shift="(direction) => shift(direction, 'month')"
        />
      </Transition>
      <section class="px-4 pb-4 pt-5">
        <h2 class="mb-2 text-xl font-medium">{{ t('issues.calendar.eventTypes') }}</h2>
        <v-checkbox
          v-for="type in eventTypes"
          :key="type"
          v-model="types"
          :value="type"
          :label="t(`issues.calendar.${type}`)"
          :style="{ '--calendar-event-color': EVENT_TYPES[type].color }"
          true-icon="mdi-check"
          false-icon="mdi-check"
          class="calendar-event-filter"
          density="compact"
          hide-details
        />
      </section>
      <CalendarFilters
        v-model="filters"
        :workspace-id="workspaceId"
        :project-id="scope.projectId"
        @view="changeView"
      />
    </aside>

    <section class="calendar-body">
      <div v-if="failed" class="flex items-center justify-between gap-2 border-b border-border p-3" role="status">
        <span>{{ t('issues.calendar.loadError') }}</span>
        <v-btn variant="text" color="primary" @click="reload">{{ t('issues.groups.retry') }}</v-btn>
      </div>
      <v-progress-linear v-if="loading && period === 'year'" indeterminate color="primary" />
      <div class="calendar-view">
        <Transition :name="transition" mode="out-in">
          <div v-if="period === 'year'" :key="currentDate.getFullYear()" class="calendar-year">
            <div v-for="month in 12" :key="month" class="calendar-year-month">
              <CalendarMiniMonth
                :date="new Date(currentDate.getFullYear(), month - 1, 1)"
                :events-by-day="data.byDay"
              />
            </div>
          </div>
          <CalendarGrid
            v-else
            :key="viewKey"
            :period="period"
            :current-date="currentDate"
            :events="data.byDay"
            :issues="data.issues"
            :loading="loading"
          />
        </Transition>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue';
import { useEventBus } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import type { TypesViewProps } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { toast } from '@/modules/toast';
import { useProjectIssueListActions } from '../../../composables/useProjectIssueListActions';
import { provideIssueEditorActions } from '../../../model/issue-list.context';
import { issueCreatedEvent } from '../../../model/issue-list.events';
import type { EditableIssueField, ProjectIssueListScope } from '../../../model/issue-list.types';
import CalendarFilters from './CalendarFilters.vue';
import CalendarGrid from './CalendarGrid.vue';
import CalendarMiniMonth from './CalendarMiniMonth.vue';
import { addDays, dayKey, getCalendarRange, shiftPeriod, type CalendarPeriod } from '../utils/calendar-dates';
import { createCalendarFilters, EVENT_TYPES, eventTypes, type CalendarRequest, type EventType } from '../utils/calendar-events';
import { normalizeIssueGroupBy } from '../../../model/issue-groups';
import { useCalendarEvents } from '../composables/useCalendarEvents';

const props = defineProps<{
  scope: ProjectIssueListScope;
  workspaceId?: string;
  viewSettings?: TypesViewProps;
}>();
const { t, locale } = useI18n();
const actions = useProjectIssueListActions(props.scope);
const currentDate = shallowRef(new Date());
const period = ref<CalendarPeriod>('week');
const types = ref<EventType[]>([...eventTypes]);
const filters = ref(createCalendarFilters());
const transition = ref('calendar-forward');
const range = computed(() => getCalendarRange(currentDate.value, period.value));
const viewKey = computed(() => `${period.value}:${dayKey(range.value.start)}:${dayKey(range.value.end)}`);
const highlightedWeek = computed(() => period.value === 'week'
  ? [dayKey(range.value.start), dayKey(addDays(range.value.end, -1))] as const
  : undefined,
);
const periodOptions = computed(() =>
  (['week', 'month', 'year'] as const).map((value) => ({ value, title: t(`issues.calendar.${value}`) })),
);
const periodLabel = computed(() => {
  const date = currentDate.value;
  if (period.value === 'year') return String(date.getFullYear());
  if (period.value === 'month') return date.toLocaleDateString(locale.value, { month: 'long' });
  const format = new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit', year: '2-digit' });
  return `${format.format(range.value.start)} – ${format.format(addDays(range.value.end, -1))}`;
});

const request = computed<CalendarRequest>(() => ({
  types: types.value,
  range: range.value,
  filters: filters.value,
  projectId: props.scope.projectId,
  workspaceId: props.workspaceId,
}));
const { data, loading, failed, reload, updateIssue } = useCalendarEvents(() => request.value);

useEventBus(issueCreatedEvent).on(({ workspaceSlug, projectId }) => {
  if (workspaceSlug === props.scope.workspaceSlug && projectId === props.scope.projectId) {
    reload();
  }
});

function shift(direction: -1 | 1, unit = period.value) {
  transition.value = direction === 1 ? 'calendar-forward' : 'calendar-backward';
  currentDate.value = shiftPeriod(currentDate.value, unit, direction);
}

function changeView(view: 'list' | 'kanban' | 'gantt_chart') {
  const group = normalizeIssueGroupBy(props.viewSettings?.filters?.group_by);
  const patch = {
    issueView: view,
    ...(view === 'kanban' && (!group || group === 'project')
      ? { filters: { group_by: 'state' } }
      : {}),
  };
  void actions.updateViewSettings(patch).catch(() => {});
}

provideIssueEditorActions({
  canEditField: actions.canEdit,
  getAvailableStates: actions.getAvailableStates,
  async updateIssue(issue, patch) {
    const fields = Object.keys(patch) as EditableIssueField[];
    if (fields.some((field) => !actions.canEdit(issue, field))) throw new Error('Issue cannot be edited');
    try {
      const updated = await actions.update(issue, patch);
      updateIssue({ ...issue, ...patch, ...updated }, patch.name ?? undefined);
      if (patch.state !== undefined) reload();
      toast.success();
    } catch (error) {
      toast.error();
      throw error;
    }
  },
});
</script>

<style scoped>
.project-calendar {
  --calendar-grid-line: #dde2ea;
  --calendar-muted-date: #8b8b98;
  --calendar-date-accent: #3f75ff;
  display: grid;
  height: 100%;
  min-height: 0;
  grid-template-columns: 336px minmax(0, 1fr);
  grid-template-rows: 64px minmax(0, 1fr);
  border-bottom: 1px solid var(--calendar-grid-line);
}
.project-calendar.v-theme--dark,
.v-theme--dark .project-calendar {
  --calendar-grid-line: #24272e;
}
.calendar-header {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 120px;
  align-items: center;
  gap: 12px;
  padding: 0 16px 0 336px;
  border-bottom: 1px solid var(--calendar-grid-line);
}
.calendar-period-nav {
  display: flex;
  justify-self: center;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: capitalize;
  white-space: nowrap;
}
.calendar-period-select { justify-self: end; width: 120px; }
.calendar-sidebar {
  overflow: auto;
  border-right: 1px solid var(--calendar-grid-line);
}
.calendar-event-filter :deep(.v-selection-control) {
  --v-selection-control-size: 20px;
  min-height: 31px;
  gap: 8px;
}
.calendar-event-filter :deep(.v-selection-control__input > .v-icon) {
  width: 20px;
  height: 20px;
  border: 2px solid var(--calendar-event-color);
  border-radius: 4px;
  color: transparent;
  font-size: 14px;
  opacity: 1;
}
.calendar-event-filter :deep(.v-selection-control--dirty .v-selection-control__input > .v-icon) {
  background-color: var(--calendar-event-color);
  color: white;
}
.calendar-event-filter :deep(.v-label) {
  font-size: 14px;
  letter-spacing: 0.25px;
}
.calendar-body { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.calendar-view { flex: 1; min-height: 0; overflow: hidden; }
.calendar-year {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  height: 100%;
  overflow: auto;
}
.calendar-year-month {
  display: flex;
  justify-content: center;
  padding: 4px 0 16px;
  border: 1px solid var(--calendar-grid-line);
}
.calendar-forward-enter-active, .calendar-forward-leave-active,
.calendar-backward-enter-active, .calendar-backward-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}
.calendar-forward-enter-from, .calendar-backward-leave-to { opacity: 0; transform: translateX(12px); }
.calendar-backward-enter-from, .calendar-forward-leave-to { opacity: 0; transform: translateX(-12px); }
@media (max-width: 960px) {
  .project-calendar { grid-template-columns: 272px minmax(0, 1fr); }
  .calendar-header { padding-left: 272px; }
  .calendar-year { grid-template-columns: repeat(2, minmax(180px, 1fr)); }
}
@media (max-width: 640px) {
  .project-calendar { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto minmax(0, 23%) minmax(0, 1fr); }
  .calendar-header { grid-template-columns: minmax(0, 1fr) auto; gap: 4px; padding: 4px; }
  .calendar-period-nav { grid-column: 1; justify-self: center; gap: 0; font-size: 14px; }
  .calendar-period-select { width: 96px; }
  .calendar-sidebar { border-right: 0; border-bottom: 1px solid var(--calendar-grid-line); }
}
@media (prefers-reduced-motion: reduce) {
  .calendar-forward-enter-active, .calendar-forward-leave-active,
  .calendar-backward-enter-active, .calendar-backward-leave-active { transition: none; }
}
</style>
