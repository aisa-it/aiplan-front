<template>
  <div class="heatmap-wrapper">
    <div style='display: flex'>
      <div style="margin-top: 28px" v-if="!loadReq">
        <div
          v-for="(day, dIndex) in days"
          :key="'day-' + dIndex"
          class="heatmap-day-label q-mr-sm"
          :style="{ zIndex: 1 }"
        >
          {{ day }}
        </div>
      </div>
      <div ref="heatmap" style="overflow-x: auto">
        <div class="activity-heatmap" v-if="squares.length > 0 && !loadReq">
          <div
            v-for="(month, mIndex) in monthPositions"
            :key="'month-' + mIndex"
            class="heatmap-month-label"
            :style="{
              gridColumnStart: month.start,
              gridColumnEnd: `span ${month.span}`,
            }"
          >
            {{ month.name }}
          </div>

          <div
            v-for="(level, index) in squares"
            :key="index"
            @click="onCellClick(index, squaresData[index].date)"
            :class="['heatmap-square', activeSquares === index ? 'heatmap-square-active' : '' , getSquareClass(level), isMobile ? '' : 'heatmap-square-hover']"
            :style="{
              gridColumnStart: Math.floor(index / 7) + 2,
              gridRowStart: (index % 7) + 2,
            }"
          >
            <q-popup-proxy
              v-if="level !== -1"
              transition-show="scale"
              transition-hide="scale"
              class="q-pa-sm"
              :breakpoint="100"
              style="width: 250px; text-align: center; z-index: 1;"
              @before-hide="() => activeSquares = null"
            >
              <div>{{"Дата: " + squaresData[index].date + " Активность: " + level}}</div>
            </q-popup-proxy>
          </div>
        </div>
      </div>
      <q-spinner-oval v-if="loadReq" color="blue" style="width: 100%" class="q-mt-sm" size="75px" />
    </div>
    <div class="q-mt-md example-block" v-if="squares.length > 0 && exampleBlock && !loadReq">
      <div :class="['heatmap-square', `level-${index}`]" v-for="(text, index) in colorOfActivity" :key="index">
        <q-popup-proxy
          transition-show="scale"
          transition-hide="scale"
          class="q-pa-sm"
        >
          <div>{{ text }}</div>
        </q-popup-proxy>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import { useQuasar } from 'quasar';

const props = withDefaults(defineProps<{
  activities: any
  loadReq?: boolean
  exampleBlock?: boolean
}>(), {
  exampleBlock: true
})

const emits = defineEmits(['onCellClick']);
const quasar = useQuasar()

const squares = ref<number[]>([]);
const squaresData = ref<{ date: string; level: any; }[]>([]);

const months = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];
const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const colorOfActivity = ['0 активностей', '1-10 активностей', '11-20 активностей', '21-30 активностей', '31+ активностей'];
const monthPositions = ref<{ name: string; start: number; span: number }[]>([]);
const today = new Date();
const activeSquares = ref<number | null>(null);
const isMobile = computed(() => quasar.screen.width < 600)
const heatmap = ref<HTMLDivElement | null>(null)

const onCellClick = (index:number, day:string) => {
  activeSquares.value = index
  emits('onCellClick', day);
}

const generateHeatmapSquares = () => {
  const dateIteration = new Date(today);
  dateIteration.setFullYear(today.getFullYear() - 1);

  if (dateIteration.getDay() !== 1) {
    let iteration = dateIteration.getDay() - 1
    if (dateIteration.getDay() === 0) {
      iteration = 6
    }
    for (let i = 0; i < iteration; i++) {
      squares.value.push(-1);
      squaresData.value.push({ date: '', level: -1 });
    }
  }

  let previousMonth = dateIteration.getMonth();
  let monthStartIndex = Math.floor(squares.value.length / 7) + 2;

  for (let i = 1; i <= 366; i++) {
    const dayOfMonth = String(dateIteration.getDate()).padStart(2, '0');
    const month = String(dateIteration.getMonth() + 1).padStart(2, '0');
    const year = dateIteration.getFullYear();

    const dateString = `${dayOfMonth}.${month}.${year}`;

    const level = props.activities[dateString.split('.').join('')]?.count || 0;
    squares.value.push(level);
    squaresData.value.push({ date: dateString, level });

    const currentMonth = dateIteration.getMonth();
    if (currentMonth !== previousMonth || i === 366) {
      monthPositions.value.push({
        name: months[previousMonth],
        start: monthStartIndex,
        span: Math.floor((squares.value.length - 1) / 7) + 2 - monthStartIndex,
      });
      previousMonth = currentMonth;
      monthStartIndex = Math.floor(squares.value.length / 7) + 2;
    }

    dateIteration.setDate(dateIteration.getDate() + 1);
  }

  for (let i = 0; i < monthPositions.value.length; i++) {
    if (i !== 0) {
      if (monthPositions.value[i].start === monthPositions.value[i - 1].start) {
        monthPositions.value[i].start += 1;
        monthPositions.value[i].span -= 1;
      }
    }
  }
};

const getSquareClass = (level:number) => {
  if (level === -1) return 'level--1';
  if (level === 0) return 'level-0';
  if (0 < level && level < 11) return 'level-1';
  if (10 < level && level < 21) return 'level-2';
  if (20 < level && level < 31) return 'level-3';
  if (level >= 31) return 'level-4';
};
watch(
  () => props.loadReq,
  (load) => {
    if (load) return;
    nextTick(() => {
      if (heatmap.value) heatmap.value.scrollLeft = heatmap.value.scrollWidth;
    });
  },{immediate: true},
);
onMounted(async () => {
  // await userStore.getActivityDate(dates.from, dates.to);
  generateHeatmapSquares();
});
</script>

<style scoped lang="scss">

.activity-heatmap {
  display: grid;
  grid-template-rows: auto repeat(7, 18px);
  grid-template-columns: auto repeat(53, 18px);
  gap: 2px;
  padding: 8px 8px 8px 0;
}

.heatmap-square {
  width: 18px;
  height: 18px;
}

.heatmap-square-active {
  border: 2px solid rgb(167, 167, 167);
}

.heatmap-square-hover:hover {
  border: 2px solid gray;
}

.example-block div {
  margin-right: 3px;
}

.example-block {
  display: flex;
  padding: 5px;
}

.level--1 {
  opacity: 0;
}

:deep(.q-linear-progress) {
  border: none;
}
</style>
