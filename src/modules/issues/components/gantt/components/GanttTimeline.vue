<template>
  <section
    ref="viewport"
    class="gantt-timeline"
    tabindex="0"
    :aria-label="t('issues.gantt.timeline')"
    @scroll.passive="updateScrollLeft"
    @wheel="wheel"
    @pointerdown="startPan"
    @pointermove="movePan"
    @lostpointercapture="pan = undefined"
  >
    <div class="gantt-canvas" :style="{ width: `${canvasWidth}px`, '--gantt-day-width': `${DAY_WIDTH}px` }">
      <div class="gantt-scale">
        <span v-for="month in monthLabels" :key="month.key" class="gantt-month" :style="{ left: `${month.left}px` }">
          {{ month.label }}
        </span>
        <span
          v-for="day in dayLabels"
          :key="day.index"
          class="gantt-day"
          :class="{ 'gantt-weekend': day.weekend }"
          :style="{ left: `${day.index * DAY_WIDTH}px` }"
        >
          {{ day.label }}
        </span>
      </div>
      <SprintProgress
        v-if="sprintRange"
        class="gantt-sprint-bar"
        :style="{ left: `${xForDay(sprintRange.start)}px`, width: `${(sprintRange.end - sprintRange.start) * DAY_WIDTH}px` }"
        :stats="sprint?.stats"
        :title="sprintLabel"
      >
        {{ sprintLabel }}
      </SprintProgress>
      <div class="gantt-grid">
        <div
          v-for="bar in bars"
          :key="bar.key"
          class="gantt-row"
          :data-issue-id="bar.issueId"
          :style="{ '--gantt-row-center': `${bar.centerY}px` }"
        >
          <div
            v-if="bar.showMain"
            class="gantt-bar"
            :class="[
              bar.group && `gantt-bar-${bar.group}`,
              { 'gantt-bar-short': bar.short, 'gantt-bar-wide': bar.width > 4 * DAY_WIDTH },
            ]"
            :style="{ left: `${bar.left}px`, width: `${bar.width}px` }"
          >
            <img v-if="bar.icon" :src="bar.icon" alt="" draggable="false" />
            <span v-if="!bar.short">{{ bar.label }}</span>
            <img v-if="bar.overdue && !bar.short" :src="alertIcon" alt="" draggable="false" />
          </div>
          <div
            v-if="bar.overdueWidth"
            class="gantt-bar gantt-bar-overdue"
            :style="{ left: `${bar.overdueLeft}px`, width: `${bar.overdueWidth}px` }"
          />
          <div
            v-if="bar.deadlineLeft !== undefined"
            class="gantt-deadline"
            :style="{ left: `${bar.deadlineLeft}px` }"
          />
          <img
            v-if="bar.shortAlertAt !== undefined"
            class="gantt-short-alert"
            :src="alertIcon"
            :style="{ left: `${bar.shortAlertAt}px` }"
            alt=""
            draggable="false"
          />
        </div>
      </div>
      <div v-if="todayX >= scrollLeft && todayX <= scrollLeft + width" class="gantt-today" :style="{ left: `${todayX}px` }">
        <span>{{ t('issues.gantt.today') }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import SprintProgress from '@/modules/sprints/components/SprintProgress.vue';
import type { GanttRow } from '../model/gantt-rows';
import { DAY_WIDTH, ganttRange, issueBar, localGanttDay, timelineDate } from '../utils/gantt-dates';
import alertIcon from '../icons/alert.svg';
import cancelIcon from '../icons/cancel.svg';
import checkIcon from '../icons/check.svg';
import clockIcon from '../icons/clock.svg';
import runIcon from '../icons/run.svg';

const icons: Record<string, string> = {
  unstarted: clockIcon,
  backlog: clockIcon,
  started: runIcon,
  completed: checkIcon,
  cancelled: cancelIcon,
};

const props = defineProps<{
  issues: readonly DtoIssueWithCount[];
  rows: readonly GanttRow[];
  sprint?: DtoSprint;
  sprintRange?: { start: number; end: number };
}>();
const emit = defineEmits<{ verticalScroll: [delta: number] }>();
const { t, locale } = useI18n();
const viewport = ref<HTMLElement | null>(null);
const { width } = useElementSize(viewport);
const scrollLeft = ref(0);
const today = localGanttDay(new Date());
const range = computed(() => ganttRange(props.issues, today, props.sprintRange));
const sprintStart = computed(() => props.sprintRange?.start);
const startDay = computed(() => range.value.start);
const dayCount = computed(() =>
  Math.max(Math.ceil(width.value / DAY_WIDTH), range.value.end - startDay.value),
);
const canvasWidth = computed(() => dayCount.value * DAY_WIDTH);
const xForDay = (day: number) => (day - startDay.value) * DAY_WIDTH;
const todayX = computed(() => xForDay(today + 1));
const right = computed(() => scrollLeft.value + width.value);
const monthFormat = computed(() => new Intl.DateTimeFormat(locale.value, { month: 'long', timeZone: 'UTC' }));
const sprintLabel = computed(() => {
  if (!props.sprintRange) return '';
  const format = new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const { start, end } = props.sprintRange;
  return `${props.sprint?.name ?? ''} ${format.format(timelineDate(start))} – ${format.format(timelineDate(end - 1))}`;
});

const dayLabels = computed(() => {
  const first = Math.max(0, Math.floor(scrollLeft.value / DAY_WIDTH) - 1);
  const last = Math.min(dayCount.value, Math.ceil(right.value / DAY_WIDTH) + 1);
  return Array.from({ length: Math.max(0, last - first) }, (_, offset) => {
    const index = first + offset;
    const date = timelineDate(startDay.value + index);
    const weekday = date.getUTCDay();
    return { index, date, label: String(date.getUTCDate()).padStart(2, '0'), weekend: weekday === 0 || weekday === 6 };
  });
});

const monthLabels = computed(() => {
  const first = Math.floor(scrollLeft.value / DAY_WIDTH);
  return dayLabels.value.flatMap(({ date, index }) => {
    if (index < first || (index !== first && date.getUTCDate() !== 1)) return [];
    return [{ key: index, left: Math.max(scrollLeft.value, index * DAY_WIDTH), label: monthFormat.value.format(date) }];
  });
});

const bars = computed(() => {
  if (!width.value) return [];
  const leftEdge = scrollLeft.value;
  const rightEdge = right.value;
  const intersects = (start: number, end: number) => start <= rightEdge && end >= leftEdge;

  return props.rows.flatMap(({ issue, key, centerY }) => {
    const bar = issueBar(issue, today);
    if (!bar) return [];
    const left = xForDay(bar.start);
    const end = xForDay(bar.end);
    const barWidth = end - left;
    const short = barWidth === DAY_WIDTH;
    const shortAlertAt = short && bar.overdue && intersects(end, end + DAY_WIDTH)
      ? end
      : undefined;
    const deadline = bar.deadline === undefined ? undefined : xForDay(bar.deadline);
    const deadlineLeft = deadline !== undefined && intersects(deadline, deadline) ? deadline : undefined;
    const overdueEnd = bar.overdueEnd === undefined ? undefined : xForDay(bar.overdueEnd);
    const overdueWidth = deadline !== undefined && overdueEnd !== undefined && intersects(deadline, overdueEnd)
      ? Math.max(0, overdueEnd - deadline)
      : 0;
    const showMain = intersects(left, end);
    if (!showMain && !overdueWidth && deadlineLeft === undefined && shortAlertAt === undefined) return [];
    return [{
      key, centerY, left, showMain, deadlineLeft, overdueWidth,
      issueId: issue.id,
      width: barWidth,
      short,
      shortAlertAt,
      overdueLeft: deadline,
      overdue: bar.overdue,
      icon: bar.group && icons[bar.group],
      group: bar.group,
      label: issue.state_detail?.name ?? t('issues.gantt.noStatus'),
    }];
  });
});

function updateScrollLeft() {
  scrollLeft.value = viewport.value?.scrollLeft ?? 0;
}

let initialized = false;
watch([startDay, width, sprintStart], ([start, viewportWidth, sprintDay], [previousStart, , previousSprintDay]) => {
  if (!viewport.value || !viewportWidth) return;
  if (!initialized || sprintDay !== previousSprintDay) {
    viewport.value.scrollLeft = sprintDay === undefined
      ? todayX.value - viewportWidth / 2
      : xForDay(sprintDay) - DAY_WIDTH;
    initialized = true;
  } else if (previousStart !== undefined && start !== previousStart) {
    viewport.value.scrollLeft = scrollLeft.value + (previousStart - start) * DAY_WIDTH;
  }
  updateScrollLeft();
}, { flush: 'post', immediate: true });

let pan: { id: number; x: number; left: number } | undefined;

function startPan(event: PointerEvent) {
  if (event.pointerType !== 'mouse' || event.button !== 0 || !viewport.value) return;
  viewport.value.setPointerCapture(event.pointerId);
  pan = { id: event.pointerId, x: event.clientX, left: viewport.value.scrollLeft };
}

function movePan(event: PointerEvent) {
  if (pan?.id !== event.pointerId || !viewport.value) return;
  viewport.value.scrollLeft = pan.left + pan.x - event.clientX;
}

function wheel(event: WheelEvent) {
  if (event.ctrlKey || event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
  event.preventDefault();
  const step = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.value?.clientHeight ?? 1 : 1;
  emit('verticalScroll', event.deltaY * step);
}
</script>

<style scoped>
.gantt-timeline {
  --gantt-line: rgb(var(--v-theme-border));
  --gantt-open-bg: #26b7f83d;
  --gantt-open-border: #26b7f8;
  --gantt-started-bg: #ff8b003d;
  --gantt-completed-bg: #43a0473d;
  --gantt-cancelled-bg: #bac4d53d;
  --gantt-overdue-bg: #dc3e3e3d;
  min-height: 0;
  min-width: 0;
  overflow: auto hidden;
  overscroll-behavior-x: contain;
  cursor: grab;
  user-select: none;
}

.v-theme--dark .gantt-timeline {
  --gantt-open-bg: #0e7ece3d;
  --gantt-open-border: #0e7ece;
  --gantt-started-bg: #ffab003d;
  --gantt-completed-bg: #7cb3423d;
  --gantt-cancelled-bg: #8b8b983d;
  --gantt-overdue-bg: #ff7a7a3d;
}

.gantt-timeline:active { cursor: grabbing; }

.gantt-canvas {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.gantt-scale {
  position: relative;
  height: var(--gantt-scale-height);
  border-bottom: 2px solid var(--gantt-line);
  background: rgb(var(--v-theme-background));
  font-size: 14px;
  font-weight: 500;
}

.gantt-sprint-bar {
  position: absolute;
  top: calc(var(--gantt-scale-height) + 7px);
  height: 32px;
}

.gantt-month {
  position: absolute;
  top: 14px;
  padding-inline-start: 16px;
  text-transform: capitalize;
}

.gantt-day {
  position: absolute;
  bottom: 10px;
  display: grid;
  width: var(--gantt-day-width);
  height: 24px;
  place-items: center;
  border-right: 2px solid var(--gantt-line);
}

.gantt-day.gantt-weekend { color: #efc980; }

.gantt-grid {
  position: absolute;
  inset: var(--gantt-header-height) 0 0;
  overflow: hidden;
  background: repeating-linear-gradient(
    to right,
    transparent 0 calc(var(--gantt-day-width) - 2px),
    var(--gantt-line) calc(var(--gantt-day-width) - 2px) var(--gantt-day-width)
  );
}

.gantt-row {
  position: absolute;
  inset: calc(var(--gantt-row-center) - var(--gantt-header-height)) 0 auto;
}

.gantt-bar {
  position: absolute;
  top: 0;
  display: flex;
  height: 32px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  padding: 0 4px;
  transform: translateY(-50%);
  border-radius: 4px;
  background: var(--gantt-cancelled-bg);
  font-size: 13px;
  white-space: nowrap;
}

.gantt-bar span { overflow: hidden; text-overflow: ellipsis; }
.gantt-bar img { width: 20px; height: 20px; flex: none; }
.gantt-bar-short img, .gantt-short-alert { width: 24px; height: 24px; }
.gantt-short-alert {
  position: absolute;
  top: 0;
  margin-left: 8px;
  transform: translateY(-50%);
}
.gantt-bar-wide { justify-content: flex-end; padding-right: 40px; }

.gantt-bar-backlog,
.gantt-bar-unstarted {
  border: 2px dashed var(--gantt-open-border);
  background: var(--gantt-open-bg);
}

.gantt-bar-started { background: var(--gantt-started-bg); }
.gantt-bar-completed { background: var(--gantt-completed-bg); }
.gantt-bar-overdue { background: var(--gantt-overdue-bg); }

.gantt-deadline {
  position: absolute;
  top: 0;
  height: 56px;
  transform: translateY(-50%);
  border-right: 2px dashed #ff7a7a;
}

.gantt-today {
  position: absolute;
  inset-block: calc(var(--gantt-scale-height) - 5px) 0;
  width: 1px;
  background: #e64949;
  pointer-events: none;
}

.gantt-today span {
  position: absolute;
  right: 0;
  padding: 0 4px;
  border: 1px solid #e64949;
  background: rgb(var(--v-theme-background));
  font-size: 11px;
}
</style>
