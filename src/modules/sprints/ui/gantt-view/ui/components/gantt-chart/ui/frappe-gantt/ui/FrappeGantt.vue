<template>
  <div class="gantt-chart" ref="ganttContainer"></div>
</template>

<script setup lang="ts">
//core
import Gantt from 'frappe-gantt';
import { ref, onMounted, watch } from 'vue';
//styles
import '/node_modules/frappe-gantt/dist/frappe-gantt.css';
import { ICustomGanttTask } from '../types';
import {
  DtoIssue,
  DtoSprint,
  DtoStateLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  tasks?: ICustomGanttTask[];
  viewMode?: 'Day' | 'Week' | 'Month';
  issues: DtoIssue[];
  sprint: DtoSprint;
}>();

const ganttContainer = ref<HTMLDivElement | null>(null);
let ganttInstance: Gantt | null = null;

const ganttTasks = ref<any[]>(
  props.issues.map((task) => ({
    ...task,
    name: `${task.name} ${getStatusIcon(task.state_detail)}`,
    custom_class: getStatusClass(task.state_detail),
    start: task.created_at,
    end: task.target_date ?? props.sprint.end_date,
    progress: 100,
    status: task.state_detail?.name,
    parentId: task.parent,
  })),
);

function getStatusClass(status: DtoStateLight | null | undefined) {
  if (!status) return '';
  switch (status.group) {
    case 'unstarted': //'Открыта':
    case 'backlog':
      return 'status-open';
    case 'started': //'В работе':
      return 'status-in-progress';
    case 'completed': //'Выполнена':
      return 'status-done';
    case 'cancelled': //'Отменена':
      return 'status-canceled';
    case 'Просрочена': //???
      return 'status-overdue';
    default:
      return 'status-sprint';
  }
}

function getStatusIcon(status: DtoStateLight | null | undefined) {
  if (!status) return '';
  switch (status.group) {
    case 'unstarted':
    case 'backlog':
      return '⏳';
    case 'started':
      return '🏃';
    case 'completed':
      return '✅';
    case 'cancelled':
      return '❌';
    case 'Просрочена':
      return '⚠️';
    default:
      return '📌';
  }
}

const defaultFrappeGanttOptions: Gantt.Options = {
  language: 'ru',
  lines: 'vertical',
  scroll_to: 'start',
  container_height: 'auto',
  readonly_progress: true,
  today_button: false,
  readonly: true,
};

const initGantt = () => {
  if (!ganttContainer.value) return;

  if (ganttInstance) {
    ganttInstance.refresh(ganttTasks.value);
  } else {
    ganttInstance = new Gantt(ganttContainer.value, ganttTasks.value, {
      view_mode: props.viewMode || 'Day',
      ...defaultFrappeGanttOptions,
      on_click: (task: Gantt.Task) => console.log('Task clicked:', task),

      on_progress_change: (task: Gantt.Task, progress: number) =>
        console.log('Progress changed:', task, progress),

      on_view_change: (mode: Gantt.ViewModeObject) =>
        console.log('View mode changed:', mode),
    });
  }
};

onMounted(() => {
  initGantt();
});

watch(
  () => props.tasks,
  () => {
    ganttTasks.value = props.issues.map((task) => ({
      ...task,
      name: `${task.name} ${getStatusIcon(task.state_detail)}`,
      custom_class: getStatusClass(task.state_detail),
      start: task.created_at,
      end: task.target_date ?? props.sprint.end_date,
      progress: 100,
      status: task.state_detail?.name,
      parentId: task.parent,
    }));
    initGantt();
  },
);
</script>

<style lang="scss">
$statuses: ('open', 'in-progress', 'done', 'overdue', 'canceled', 'sprint');

$status-colors-light: (
  'open': #26b7f83d,
  'in-progress': #ff8b003d,
  'done': #43a0473d,
  'overdue': #dc3e3e3d,
  'canceled': #bac4d53d,
  'sprint': $positive,
);

$status-colors-dark: (
  'open': #0e7ece3d,
  'in-progress': #ffab003d,
  'done': #7cb3423d,
  'overdue': #ff7a7a3d,
  'canceled': #8b8b983d,
  'sprint': $positive,
);

.gantt .grid-row {
  fill: $bg-color;
}
.gantt .holiday-highlight {
  fill: $border-color !important;
  opacity: 0.5;
}
.gantt .tick {
  stroke: $border-color;
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
  border-bottom: 1px solid $border-color;
}

.gantt .bar-progress {
  // fill: $positive;
  border-radius: 3px;
  opacity: 0.7;
}

.bar-wrapper .bar-label,
.bar-wrapper .bar-label.big {
  fill: $text-color;
}

.body--light {
  @each $color in $statuses {
    .bar-wrapper.status-#{$color} .bar {
      fill: map-get($status-colors-light, $color) !important;
      outline: none;
      opacity: 0.3;
      @if ($color == 'open' or $color == 'canceled') {
        outline: 1px dashed map-get($status-colors-light, $color);
      }
    }
    .bar-wrapper.status-#{$color} .bar-progress {
      fill: map-get($status-colors-light, $color) !important;
    }
  }
}

.body--dark {
  @each $color in $statuses {
    .bar-wrapper.status-#{$color} .bar {
      fill: map-get($status-colors-dark, $color) !important;
      outline: none;
      opacity: 0.3;
      @if ($color == 'open' or $color == 'canceled') {
        outline: 1px dashed map-get($status-colors-dark, $color);
      }
    }
    .bar-wrapper.status-#{$color} .bar-progress {
      fill: map-get($status-colors-dark, $color) !important;
    }
  }
}
</style>
