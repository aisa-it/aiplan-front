<template>
  <div class="gantt-chart" ref="ganttContainer">
    <q-menu
      v-model="sprintTooltip.show"
      no-parent-event
      no-refocus
      anchor="top middle"
      self="bottom middle"
      :target="sprintTooltip.anchorEl"
    >
      <div class="q-pa-sm text-body2">{{ sprintTooltip.text }}</div>
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import Gantt from 'frappe-gantt';
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue';

import '/node_modules/frappe-gantt/dist/frappe-gantt.css';
import { DtoIssue, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { scrollToTarget } from './ganttScroll';
import { buildGanttTasks } from './ganttTasks';
import { decorateBars } from './ganttDecorators';
import { observeGanttRedraw } from './observeGanttRedraw';
import { enableDragScroll } from './enableDragScroll';

const props = defineProps<{
  viewMode?: 'Day' | 'Week' | 'Month';
  issues: DtoIssue[];
  sprint?: DtoSprint;
}>();

const ganttContainer = ref<HTMLDivElement | null>(null);
let ganttInstance: Gantt | null = null;
let ganttObserver: MutationObserver | undefined = undefined;
let destroyDragScroll: (() => void) | null = null;

const sprintTooltip = ref({
  show: false,
  text: '',
  anchorEl: undefined as HTMLElement | undefined,
});

const tooltipHandlers = {
  show({ text, anchorEl }: { text: string; anchorEl: HTMLElement }) {
    sprintTooltip.value = {
      show: true,
      text,
      anchorEl,
    };
  },
  hide() {
    sprintTooltip.value.show = false;
  },
};

const ganttTasks = ref<any[]>(buildGanttTasks(props.issues, props.sprint));

const defaultFrappeGanttOptions: Gantt.Options = {
  language: 'ru',
  lines: 'vertical',
  scroll_to: 'start',
  container_height: 'auto',
  readonly_progress: true,
  today_button: false,
  readonly: true,
  bar_height: 32,
  padding: 21.39,
  column_width: 40,
  popup: false,
};

function scrollInContainer() {
  if (!ganttContainer.value) return;

  const scrollContainer = ganttContainer.value?.querySelector(
    '.gantt-container',
  ) as HTMLElement | null;

  if (!scrollContainer) return;
  const selector = props.sprint ? '.sprint' : '.current-highlight';
  scrollToTarget(scrollContainer, selector);
}

const initGantt = async () => {
  if (!ganttContainer.value) return;

  if (ganttInstance) {
    ganttInstance.refresh(ganttTasks.value);
  } else {
    ganttInstance = new Gantt(ganttContainer.value, ganttTasks.value, {
      view_mode: props.viewMode || 'Day',
      ...defaultFrappeGanttOptions,
    });
  }

  await nextTick();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!ganttContainer.value) return;
        decorateBars(ganttContainer.value, ganttTasks.value, tooltipHandlers);
        scrollInContainer();

        const scrollContainer = ganttContainer.value.querySelector(
          '.gantt-container',
        ) as HTMLElement | null;

        if (scrollContainer && !destroyDragScroll) {
          destroyDragScroll = enableDragScroll(scrollContainer);
        }

        if (!ganttObserver) {
          ganttObserver = observeGanttRedraw(ganttContainer.value, () => {
            decorateBars(
              ganttContainer.value!,
              ganttTasks.value,
              tooltipHandlers,
            );
          });
        }
      });
    });
  });
};

onMounted(() => {
  initGantt();
});

onUnmounted(() => {
  ganttObserver?.disconnect();
  destroyDragScroll?.();
});

watch(
  () => [props.issues, props.sprint],
  () => {
    ganttTasks.value = buildGanttTasks(props.issues, props.sprint);
    initGantt();
  },
);
</script>

<style lang="scss">
$statuses: ('open', 'in-progress', 'done', 'overdue', 'cancelled', 'sprint');

$status-colors-light: (
  'open': #26b7f83d,
  'in-progress': #ff8b003d,
  'done': #43a0473d,
  'overdue': #dc3e3e3d,
  'cancelled': #bac4d53d,
  'sprint': $positive,
);

$status-colors-dark: (
  'open': #0e7ece3d,
  'in-progress': #ffab003d,
  'done': #7cb3423d,
  'overdue': #ff7a7a3d,
  'cancelled': #8b8b983d,
  'sprint': $positive,
);

.gantt-container {
  cursor: grab;
}

.gantt-container.dragging {
  cursor: grabbing;
  user-select: none;
}

.gantt-container {
  overflow-y: hidden;
}

.gantt-container .grid-header .lower-header {
  border-top: 2px solid var(--dark-border-color);
  border-bottom: 2px solid var(--dark-border-color);
}

.gantt-container .grid-header .lower-text {
  text-align: center;
  font-weight: 500;
  font-size: 14px;
  border-right: 2px solid var(--dark-border-color);
  margin: 0;
  width: 40px;
}
.gantt-container .grid-header .lower-text.weekend-date {
  color: #efc980;
}

.target-date-line {
  stroke: #ff7a7a;
  stroke-width: 2;
  stroke-dasharray: 6 6;
  opacity: 0.9;
  pointer-events: none;
}

.gantt .grid-row {
  fill: $bg-color;
}
.gantt .holiday-highlight {
  display: none;
}
.gantt .tick {
  stroke: var(--dark-border-color);
}
.gantt .tick.thick {
  stroke: var(--dark-border-color);
}

.gantt .tick {
  stroke: var(--dark-border-color);
  stroke-width: 2px;
  stroke-opacity: 1; // Делаем более непрозрачными
}

.gantt-container .current-highlight {
  background: $negative;
}

.gantt .row-line {
  stroke: $border-color;
}

.gantt-container .grid-header * {
  color: $text-color;
  background-color: $bg-color;
}
.gantt-container .grid-header {
  background-color: $bg-color;
  padding-top: 10px;
}

.gantt .bar-progress {
  border-radius: 3px;
  opacity: 1;
}

.current-ball-highlight {
  position: absolute;
  border: 1px solid $negative;
  border-radius: 0 !important;
  padding: 2px 4px;
}

.bar-wrapper .bar-label,
.bar-wrapper .bar-label.big {
  fill: $text-color;
}

.bar-wrapper.sprint .bar {
  fill: transparent !important;
  outline: none;
}

.bar-wrapper.sprint .bar-progress {
  fill: transparent !important;
}

.body--light {
  @each $color in $statuses {
    .bar-wrapper.status-#{$color} .bar {
      fill: map-get($status-colors-light, $color) !important;
      outline: none;
      @if ($color == 'open') {
        stroke: rgba(38, 183, 248, 1);
        stroke-width: 2px;
        stroke-dasharray: 12, 4;
        rx: 4px;
        transform: translate(1px, 1px);
      }
    }
    .bar-wrapper.status-#{$color} .bar-progress {
      fill: map-get($status-colors-light, $color) !important;
    }
  }

  .bar-overdue {
    fill: map-get($status-colors-light, 'overdue');
  }
}

.body--dark {
  @each $color in $statuses {
    .bar-wrapper.status-#{$color} .bar {
      fill: map-get($status-colors-dark, $color) !important;
      outline: none;
      @if ($color == 'open') {
        stroke: rgba(14, 126, 206, 1);
        stroke-width: 2px;
        stroke-dasharray: 12, 4;
        rx: 4px;
        transform: translate(1px, 1px);
      }
    }
    .bar-wrapper.status-#{$color} .bar-progress {
      fill: map-get($status-colors-dark, $color) !important;
    }
  }

  .bar-overdue {
    fill: map-get($status-colors-dark, 'overdue');
  }
}
</style>
