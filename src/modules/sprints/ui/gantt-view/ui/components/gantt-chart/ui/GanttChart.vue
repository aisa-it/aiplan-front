<template>
  <g-gantt-chart
    :chart-start="chartStart"
    :chart-end="chartEnd"
    precision="day"
    :row-height="40"
    grid
    current-time
    width="100%"
    bar-start="beginDate"
    bar-end="endDate"
    :date-format="format"
    @click-bar="onClickBar($event.bar, $event.e, $event.datetime)"
    @mousedown-bar="onMousedownBar($event.bar, $event.e, $event.datetime)"
    @dblclick-bar="onMouseupBar($event.bar, $event.e, $event.datetime)"
    @mouseenter-bar="onMouseenterBar($event.bar, $event.e)"
    @mouseleave-bar="onMouseleaveBar($event.bar, $event.e)"
    @dragstart-bar="onDragstartBar($event.bar, $event.e)"
    @drag-bar="onDragBar($event.bar, $event.e)"
    @dragend-bar="onDragendBar($event.bar, $event.e, $event.movedBars)"
    @contextmenu-bar="onContextmenuBar($event.bar, $event.e, $event.datetime)"
  >
    <!--   <g-gantt-row label="My row to test" :bars="bars1" highlight-on-hover />
    <g-gantt-row
      label="My another new row to test"
      highlight-on-hover
      :bars="bars2"
    />
    <g-gantt-row
      label="just another row to test gantt"
      highlight-on-hover
      :bars="bars3"
    />
    <g-gantt-row
      label="errors teach us, and debugging makes us stronger!"
      highlight-on-hover
      :bars="bars4"
    /> -->
    <g-gantt-row
      v-for="(row, index) in rows"
      :key="index"
      :bars="row.bars"
      :label="row.label"
      highlight-on-hover
    />
  </g-gantt-chart>

  <button type="button" @click="addBar()">Add bar</button>
  <button type="button" @click="deleteBar()">Delete bar</button>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue';
import dayjs from 'dayjs';
import { GanttBarObject } from '@infectoone/vue-ganttastic';
import { IGanttRow } from '../types';

const props = defineProps<{
  chartStart: string;
  chartEnd: string;
  rows: IGanttRow[];
}>();

const format = ref('DD.MM.YYYY HH:mm');
/* const chartStart = ref(dayjs().startOf('day').format(format.value));
const chartEnd = ref(
  dayjs(chartStart.value, format.value)
    .add(3, 'days')
    .hour(12)
    .format(format.value),
);
 */

const addBar = () => {
  /*  if (bars1.value.some((bar) => bar.ganttBarConfig.id === 'test1')) {
    return;
  }
  const bar = {
    beginDate: dayjs()
      .add(1, 'day')
      .hour(4)
      .startOf('hour')
      .format(format.value),
    endDate: dayjs().add(2, 'day').hour(4).startOf('hour').format(format.value),
    ganttBarConfig: {
      id: 'test1',
      hasHandles: true,
      label: 'Hello!',
      style: {
        background: '#5484b7',
        borderRadius: '20px',
      },
    },
  };
  bars1.value.push(bar); */
};

const deleteBar = () => {
  /*   const idx = bars1.value.findIndex((b) => b.ganttBarConfig.id === 'test1');
  if (idx !== -1) {
    bars1.value.splice(idx, 1);
  } */
};

const onClickBar = (bar: GanttBarObject, e: MouseEvent, datetime?: string) => {
  console.log('click-bar', bar, e, datetime);
};

const onMousedownBar = (
  bar: GanttBarObject,
  e: MouseEvent,
  datetime?: string,
) => {
  console.log('mousedown-bar', bar, e, datetime);
};

const onMouseupBar = (
  bar: GanttBarObject,
  e: MouseEvent,
  datetime?: string,
) => {
  console.log('mouseup-bar', bar, e, datetime);
};

const onMouseenterBar = (bar: GanttBarObject, e: MouseEvent) => {
  console.log('mouseenter-bar', bar, e);
};

const onMouseleaveBar = (bar: GanttBarObject, e: MouseEvent) => {
  console.log('mouseleave-bar', bar, e);
};

const onDragstartBar = (bar: GanttBarObject, e: MouseEvent) => {
  console.log('dragstart-bar', bar, e);
};

const onDragBar = (bar: GanttBarObject, e: MouseEvent) => {
  console.log('drag-bar', bar, e);
};

const onDragendBar = (
  bar: GanttBarObject,
  e: MouseEvent,
  movedBars?: Map<GanttBarObject, { oldStart: string; oldEnd: string }>,
) => {
  console.log('dragend-bar', bar, e, movedBars);
};

const onContextmenuBar = (
  bar: GanttBarObject,
  e: MouseEvent,
  datetime?: string,
) => {
  console.log('contextmenu-bar', bar, e, datetime);
};
</script>
