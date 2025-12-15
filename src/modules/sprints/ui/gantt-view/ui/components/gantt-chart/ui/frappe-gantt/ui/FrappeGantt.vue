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
import { DtoIssue, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  tasks: ICustomGanttTask[];
  viewMode?: 'Day' | 'Week' | 'Month';
  issues: DtoIssue;
  sprint: DtoSprint;
}>();

const ganttContainer = ref<HTMLDivElement | null>(null);
let ganttInstance: Gantt | null = null;

const ganttTasks = ref<ICustomGanttTask[]>(
  props.tasks.map((task) => ({
    ...task,
    name: `${task.name} ${getStatusIcon(task.status)}`,
    custom_class: getStatusClass(task.status),
  })),
);

function getStatusClass(status: string) {
  switch (status) {
    case 'Открыта':
      return 'status-open';
    case 'В работе':
      return 'status-in-progress';
    case 'Выполнена':
      return 'status-done';
    case 'Отменена':
      return 'status-canceled';
    case 'Просрочена':
      return 'status-overdue';
    default:
      return 'status-sprint';
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'Открыта':
      return '⏳';
    case 'В работе':
      return '🏃';
    case 'Выполнена':
      return '✅';
    case 'Отменена':
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
      on_date_change: (task: Gantt.Task, newStart: Date, newEnd: Date) => {
        console.log('Date changed:', task, newStart, newEnd);

        const currentTask = ganttTasks.value.find((t) => t.id === task.id);
        if (!currentTask) return;

        const oldStart = new Date(currentTask.start).getTime();
        const delta = newStart.getTime() - oldStart;

        // Обновляем выбранный таск
        currentTask.start = newStart.toISOString();
        currentTask.end = newEnd.toISOString();

        // Если это спринт (нет parentId) — сдвигаем всех детей
        const isSprint = !currentTask.parentId;
        if (isSprint) {
          ganttTasks.value.forEach((childTask) => {
            if (childTask.parentId === currentTask.id) {
              const childStart = new Date(childTask.start).getTime();
              const childEnd = childTask.end
                ? new Date(childTask.end).getTime()
                : 0;
              childTask.start = new Date(childStart + delta).toISOString();
              childTask.end = new Date(childEnd + delta).toISOString();
            }
          });
          ganttInstance?.setup_tasks(ganttTasks.value);
          ganttInstance?.change_view_mode(undefined, true);
        }
      },

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
    ganttTasks.value = props.tasks.map((task) => ({
      ...task,
      name: `${task.name} ${getStatusIcon(task.status)}`,
      custom_class: getStatusClass(task.status),
    }));
    initGantt();
  },
);
</script>

<style lang="scss">
$statuses: ('open', 'in-progress', 'done', 'overdue', 'canceled', 'sprint');

$status-colors-light: (
  'open': #26b7f8,
  'in-progress': #ff8b00,
  'done': #43a047,
  'overdue': #dc3e3e,
  'canceled': #bac4d5,
  'sprint': $positive,
);

$status-colors-dark: (
  'open': #0e7ece,
  'in-progress': #31363f,
  'done': #7cb342,
  'overdue': #ff7a7a,
  'canceled': #8b8b98,
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
  fill: $positive;
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
      fill: map-get($status-colors-light, $color);
      outline: none;
      opacity: 0.3;
      @if ($color == 'open' or $color == 'canceled') {
        outline: 1px dashed map-get($status-colors-light, $color);
      }
    }
  }
}

.body--dark {
  @each $color in $statuses {
    .bar-wrapper.status-#{$color} .bar {
      fill: map-get($status-colors-dark, $color);
      outline: none;
      opacity: 0.3;
      @if ($color == 'open' or $color == 'canceled') {
        outline: 1px dashed map-get($status-colors-dark, $color);
      }
    }
  }
}
</style>
