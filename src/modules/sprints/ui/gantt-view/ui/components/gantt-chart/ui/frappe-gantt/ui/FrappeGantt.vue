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

const statusIcons = {
  unstarted: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z" fill="#9664C4"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 7.25C12.1989 7.25 12.3897 7.32902 12.5303 7.46967C12.671 7.61032 12.75 7.80109 12.75 8V11.69L15.03 13.97C15.1037 14.0387 15.1628 14.1215 15.2038 14.2135C15.2448 14.3055 15.2668 14.4048 15.2686 14.5055C15.2704 14.6062 15.2518 14.7062 15.2141 14.7996C15.1764 14.893 15.1203 14.9778 15.049 15.049C14.9778 15.1203 14.893 15.1764 14.7996 15.2141C14.7062 15.2518 14.6062 15.2704 14.5055 15.2686C14.4048 15.2668 14.3055 15.2448 14.2135 15.2038C14.1215 15.1628 14.0387 15.1037 13.97 15.03L11.47 12.53C11.3293 12.3895 11.2502 12.1988 11.25 12V8C11.25 7.80109 11.329 7.61032 11.4697 7.46967C11.6103 7.32902 11.8011 7.25 12 7.25Z" fill="white"/>
</svg>`,
  backlog: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22Z" fill="#9664C4"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M12 7.25C12.1989 7.25 12.3897 7.32902 12.5303 7.46967C12.671 7.61032 12.75 7.80109 12.75 8V11.69L15.03 13.97C15.1037 14.0387 15.1628 14.1215 15.2038 14.2135C15.2448 14.3055 15.2668 14.4048 15.2686 14.5055C15.2704 14.6062 15.2518 14.7062 15.2141 14.7996C15.1764 14.893 15.1203 14.9778 15.049 15.049C14.9778 15.1203 14.893 15.1764 14.7996 15.2141C14.7062 15.2518 14.6062 15.2704 14.5055 15.2686C14.4048 15.2668 14.3055 15.2448 14.2135 15.2038C14.1215 15.1628 14.0387 15.1037 13.97 15.03L11.47 12.53C11.3293 12.3895 11.2502 12.1988 11.25 12V8C11.25 7.80109 11.329 7.61032 11.4697 7.46967C11.6103 7.32902 11.8011 7.25 12 7.25Z" fill="white"/>
</svg>`,
  started: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12Z" fill="#26B5CE"/>
<path d="M10.6865 8.37305C10.98 8.36662 11.2724 8.41776 11.5459 8.52441C13.0901 9.12505 13.4613 11.1401 12.2354 12.2539L12.2344 12.2529L11.7158 12.7266L11.7148 12.7256L11.6904 12.7471L11.6914 12.748C11.6654 12.7727 11.6452 12.8028 11.6318 12.8359C11.6185 12.8691 11.6127 12.9047 11.6143 12.9404C11.6159 12.9763 11.6252 13.012 11.6416 13.0439C11.6497 13.0597 11.6597 13.0743 11.6709 13.0879L11.709 13.126L11.7148 13.1309C11.7151 13.1311 11.7167 13.1325 11.7197 13.1348C11.7219 13.1364 11.7244 13.1383 11.7275 13.1406L11.9209 13.292C12.3613 13.659 12.7238 14.112 12.9854 14.624C13.2842 15.2091 13.4433 15.8558 13.4502 16.5127V17C13.4502 17.4141 13.1143 17.7499 12.7002 17.75C12.286 17.75 11.9502 17.4142 11.9502 17V16.5283L11.9434 16.3691C11.918 15.9993 11.8185 15.6378 11.6494 15.3066C11.4561 14.9282 11.1776 14.5994 10.8359 14.3467L10.8311 14.3438C10.8243 14.3387 10.8034 14.3212 10.7793 14.3018C10.7775 14.3003 10.7762 14.2993 10.7744 14.2979C10.7675 14.2922 10.7598 14.2872 10.7529 14.2812V14.2793C10.5684 14.1274 10.4158 13.9404 10.3066 13.7275C10.1922 13.5042 10.1265 13.2586 10.1152 13.0078C10.104 12.7571 10.1472 12.5071 10.2412 12.2744C10.3352 12.0417 10.4779 11.8318 10.6602 11.6592L10.6699 11.6494L10.7051 11.6182L10.7061 11.6162L11.2266 11.1436L11.2959 11.0713C11.6116 10.6972 11.4742 10.1069 11.001 9.92285C10.9116 9.88798 10.8157 9.87002 10.7197 9.87207C10.6236 9.87419 10.5284 9.89574 10.4404 9.93457L10.1787 10.0498C9.90414 10.1703 9.78675 10.2226 9.6748 10.2783C9.48054 10.3749 9.29148 10.4821 9.10938 10.5996C9.003 10.6686 8.89697 10.7431 8.6543 10.916L7.93555 11.4287L7.87012 11.4697C7.5398 11.6578 7.11396 11.5692 6.88867 11.2529C6.64871 10.9157 6.72739 10.4473 7.06445 10.207L7.78418 9.69434C8.02041 9.52602 8.1548 9.43062 8.29492 9.33984L8.29688 9.33887C8.52564 9.19132 8.76197 9.05678 9.00586 8.93555C9.15678 8.86037 9.30924 8.79305 9.57422 8.67676L9.83496 8.5625L10.04 8.4834C10.2484 8.41502 10.4665 8.37789 10.6865 8.37305Z" fill="white"/>
<path d="M9.3457 14.1191C9.61717 13.8531 10.0512 13.8308 10.3496 14.0791C10.6679 14.3442 10.7114 14.8175 10.4463 15.1357L10.2832 15.3203C9.89236 15.7403 9.42419 16.0821 8.90332 16.3262C8.30777 16.6052 7.65767 16.75 7 16.75C6.5858 16.75 6.25 16.4142 6.25 16C6.25002 15.5858 6.58581 15.25 7 15.25C7.43772 15.25 7.87022 15.1535 8.2666 14.9678C8.66287 14.7821 9.01385 14.512 9.29395 14.1758L9.3457 14.1191Z" fill="white"/>
<path d="M15.3193 11.2725C15.7212 11.172 16.1281 11.4165 16.2285 11.8184C16.3289 12.2202 16.0844 12.6271 15.6826 12.7275C14.9068 12.9213 14.0952 12.9214 13.3193 12.7275C12.9176 12.6271 12.6732 12.2201 12.7734 11.8184C12.8676 11.4417 13.2313 11.2035 13.6074 11.2578L13.6826 11.2725L13.8857 11.3164C14.3604 11.4045 14.8494 11.3899 15.3193 11.2725Z" fill="white"/>
<path fill-rule="evenodd" clip-rule="evenodd" d="M14.75 6.25C15.8546 6.25 16.75 7.14543 16.75 8.25C16.75 9.35457 15.8546 10.25 14.75 10.25C13.6454 10.25 12.75 9.35457 12.75 8.25C12.75 7.14543 13.6454 6.25 14.75 6.25ZM14.75 7.75C14.4739 7.75 14.25 7.97386 14.25 8.25C14.25 8.52614 14.4739 8.75 14.75 8.75C15.0261 8.75 15.25 8.52614 15.25 8.25C15.25 7.97386 15.0261 7.75 14.75 7.75Z" fill="white"/>
</svg>`,
  completed: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12Z" fill="#05BD8D"/>
<path d="M16.0292 8.96934C16.1696 9.10997 16.2485 9.30059 16.2485 9.49934C16.2485 9.69809 16.1696 9.88871 16.0292 10.0293L11.0292 15.0293C10.8886 15.1698 10.6979 15.2487 10.4992 15.2487C10.3004 15.2487 10.1098 15.1698 9.96918 15.0293L7.96918 13.0293C7.89549 12.9607 7.83639 12.8779 7.7954 12.7859C7.7544 12.6939 7.73236 12.5946 7.73059 12.4939C7.72881 12.3932 7.74733 12.2931 7.78505 12.1997C7.82278 12.1064 7.87892 12.0215 7.95014 11.9503C8.02136 11.8791 8.10619 11.8229 8.19958 11.7852C8.29297 11.7475 8.393 11.729 8.4937 11.7307C8.5944 11.7325 8.69372 11.7546 8.78571 11.7956C8.87771 11.8366 8.96051 11.8957 9.02918 11.9693L10.4992 13.4393L12.7342 11.2043L14.9692 8.96934C15.1098 8.82889 15.3004 8.75 15.4992 8.75C15.6979 8.75 15.8886 8.82889 16.0292 8.96934Z" fill="white"/>
</svg>`,
  cancelled: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2C17.523 2 22 6.477 22 12Z" fill="#8B8B98"/>
<path d="M8.96934 8.96918C9.10997 8.82873 9.30059 8.74984 9.49934 8.74984C9.69809 8.74984 9.88871 8.82873 10.0293 8.96918L11.9993 10.9392L13.9693 8.96918C14.038 8.89549 14.1208 8.83639 14.2128 8.7954C14.3048 8.7544 14.4041 8.73236 14.5048 8.73059C14.6055 8.72881 14.7055 8.74733 14.7989 8.78505C14.8923 8.82278 14.9772 8.87892 15.0484 8.95014C15.1196 9.02136 15.1757 9.10619 15.2135 9.19958C15.2512 9.29297 15.2697 9.393 15.2679 9.4937C15.2662 9.5944 15.2441 9.69372 15.2031 9.78572C15.1621 9.87771 15.103 9.96052 15.0293 10.0292L13.0593 11.9992L15.0293 13.9692C15.1618 14.1114 15.2339 14.2994 15.2305 14.4937C15.2271 14.688 15.1484 14.8734 15.011 15.0108C14.8735 15.1482 14.6882 15.2269 14.4939 15.2304C14.2996 15.2338 14.1115 15.1617 13.9693 15.0292L11.9993 13.0592L10.0293 15.0292C9.88716 15.1617 9.69912 15.2338 9.50482 15.2304C9.31052 15.2269 9.12513 15.1482 8.98772 15.0108C8.85031 14.8734 8.77159 14.688 8.76816 14.4937C8.76474 14.2994 8.83686 14.1114 8.96934 13.9692L10.9393 11.9992L8.96934 10.0292C8.82889 9.88855 8.75 9.69793 8.75 9.49918C8.75 9.30043 8.82889 9.1098 8.96934 8.96918Z" fill="white"/>
</svg>`,
  overdue: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.0002 3C9.69024 3 8.23024 5.587 5.31224 10.762L4.94824 11.406C2.52324 15.706 1.31024 17.856 2.40624 19.428C3.50224 21 6.21424 21 11.6362 21H12.3642C17.7862 21 20.4982 21 21.5942 19.428C22.6902 17.856 21.4772 15.706 19.0522 11.406L18.6882 10.761C15.7702 5.587 14.3112 3 12.0002 3Z" fill="#DC3E3E"/>
<path d="M12 7.25C12.1989 7.25 12.3897 7.32902 12.5303 7.46967C12.671 7.61032 12.75 7.80109 12.75 8V13C12.75 13.1989 12.671 13.3897 12.5303 13.5303C12.3897 13.671 12.1989 13.75 12 13.75C11.8011 13.75 11.6103 13.671 11.4697 13.5303C11.329 13.3897 11.25 13.1989 11.25 13V8C11.25 7.80109 11.329 7.61032 11.4697 7.46967C11.6103 7.32902 11.8011 7.25 12 7.25ZM12 17C12.2652 17 12.5196 16.8946 12.7071 16.7071C12.8946 16.5196 13 16.2652 13 16C13 15.7348 12.8946 15.4804 12.7071 15.2929C12.5196 15.1054 12.2652 15 12 15C11.7348 15 11.4804 15.1054 11.2929 15.2929C11.1054 15.4804 11 15.7348 11 16C11 16.2652 11.1054 16.5196 11.2929 16.7071C11.4804 16.8946 11.7348 17 12 17Z" fill="white"/>
</svg>
`,
  default: `+++`,
};

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
  return `<image xlink:href="data:image/svg+xml;base64,${btoa(statusIcons[status.group as keyof typeof statusIcons])}" height="24" width="24" x="2" y="2">`;
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

function injectStatusIcons() {
  if (!ganttContainer.value) return;

  const svg = ganttContainer.value.querySelector('svg');
  if (!svg) return;

  const bars = svg.querySelectorAll<SVGGElement>('g.bar-wrapper');

  bars.forEach((bar) => {
    // не дублируем иконки
    if (bar.querySelector('image.status-icon')) return;

    const text = bar.querySelector<SVGTextElement>('text.bar-label');
    if (!text) return;

    const barGroup = text.parentElement as SVGGElement;
    if (!barGroup) return;

    const taskId = bar.getAttribute('data-id');
    const task = ganttTasks.value.find((t) => t.id === taskId);
    if (!task || !task.state_detail) return;

    const iconSvg =
      statusIcons[task.state_detail.group as keyof typeof statusIcons];
    if (!iconSvg) return;

    // базовые размеры
    const ICON_SIZE = 24;
    const ICON_GAP = 8;

    const textX = Number(text.getAttribute('x'));
    const textY = Number(text.getAttribute('y'));

    // y у <text> — это baseline, поэтому центрируем вручную
    const iconX = textX - ICON_SIZE - ICON_GAP;
    const iconY = textY - ICON_SIZE / 2 - 1; // эмпирически как у тебя (195 vs 205)

    const image = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'image',
    );

    image.setAttribute('class', 'status-icon');
    image.setAttribute('href', `data:image/svg+xml;base64,${btoa(iconSvg)}`);
    image.setAttribute('width', `${ICON_SIZE}px`);
    image.setAttribute('height', `${ICON_SIZE}px`);
    image.setAttribute('x', iconX.toString());
    image.setAttribute('y', iconY.toString());

    // вставляем ПЕРЕД текстом
    barGroup.insertBefore(image, text);

    // сдвигаем текст вправо
    text.setAttribute('x', (textX + ICON_SIZE + ICON_GAP).toString());
  });
}

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

  requestAnimationFrame(() => {
    injectStatusIcons();
  });
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
  opacity: 0.2;
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
}
</style>
