<template>
  <div class="heatmap-wrapper" :class="{ 'heatmap-wrapper--dark': isDark }">
    <div class="flex">
      <div v-if="!loadReq" class="mt-7 mr-2">
        <div
          v-for="day in ACTIVITY_WEEKDAYS"
          :key="day"
          class="heatmap-day-label"
        >
          {{ day }}
        </div>
      </div>

      <div ref="heatmapRef" class="overflow-x-auto">
        <div v-if="squares.length && !loadReq" class="activity-heatmap">
          <div
            v-for="(month, index) in monthPositions"
            :key="`${month.name}-${index}`"
            class="heatmap-month-label"
            :style="{
              gridColumnStart: month.start,
              gridColumnEnd: `span ${month.span}`,
            }"
          >
            {{ month.name }}
          </div>

          <template v-for="(square, index) in squares" :key="index">
            <div
              v-if="square.level === -1"
              class="heatmap-square level--1"
              :style="getSquarePosition(index)"
            />

            <v-tooltip v-else location="top">
              <template #activator="{ props: tooltipProps }">
                <button
                  v-bind="tooltipProps"
                  type="button"
                  class="heatmap-square heatmap-square-hover"
                  :class="[
                    `level-${square.level}`,
                    { 'heatmap-square-active': activeSquare === index },
                  ]"
                  :style="getSquarePosition(index)"
                  :aria-label="`Дата: ${square.date} Активность: ${square.count}`"
                  @click="activeSquare = index"
                />
              </template>
              <span>
                {{ `Дата: ${square.date} Активность: ${square.count}` }}
              </span>
            </v-tooltip>
          </template>
        </div>
      </div>
      <page-loader v-if="loadReq" />
    </div>

    <div
      v-if="squares.length && exampleBlock && !loadReq"
      class="example-block mt-4"
    >
      <v-tooltip
        v-for="(text, index) in ACTIVITY_LEVEL_LABELS"
        :key="text"
        location="top"
        :text="text"
      >
        <template #activator="{ props: tooltipProps }">
          <div
            v-bind="tooltipProps"
            class="heatmap-square"
            :class="`level-${index}`"
          />
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, toRef, watch } from 'vue';

import { useAppTheme } from '@/composables/useAppTheme';

import {
  ACTIVITY_LEVEL_LABELS,
  ACTIVITY_WEEKDAYS,
} from './ActivityHotMap.config';
import { useActivityHotMap } from './composables/useActivityHotMap';

import type { CSSProperties } from 'vue';
import type { TypesActivityTable } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import PageLoader from '@/components/loaders/PageLoader.vue';

const props = withDefaults(
  defineProps<{
    activities: TypesActivityTable;
    exampleBlock?: boolean;
    loadReq?: boolean;
  }>(),
  {
    exampleBlock: true,
  },
);

const activeSquare = ref<number | null>(null);
const heatmapRef = ref<HTMLDivElement | null>(null);
const { isDark } = useAppTheme();
const { monthPositions, squares } = useActivityHotMap(
  toRef(props, 'activities'),
);

const getSquarePosition = (index: number): CSSProperties => ({
  gridColumnStart: Math.floor(index / 7) + 2,
  gridRowStart: (index % 7) + 2,
});

watch(
  () => props.loadReq,
  async (isLoading) => {
    if (isLoading) return;

    await nextTick();
    if (heatmapRef.value) {
      heatmapRef.value.scrollLeft = heatmapRef.value.scrollWidth;
    }
  },
  { immediate: true },
);
</script>

<style scoped>
.heatmap-wrapper {
  --heatmap-level-0: #ececef;
  --heatmap-level-1: #d2dcff;
  --heatmap-level-2: #7992f5;
  --heatmap-level-3: #3f51ae;
  --heatmap-level-4: #2a2b59;
}

.heatmap-wrapper--dark {
  --heatmap-level-0: #2e2e31;
  --heatmap-level-1: #242758;
  --heatmap-level-2: #39488e;
  --heatmap-level-3: #6c7cba;
  --heatmap-level-4: #d9dbe8;
}

.activity-heatmap {
  display: grid;
  grid-template-rows: auto repeat(7, 18px);
  grid-template-columns: auto repeat(54, 18px);
  gap: 2px;
  padding: 8px 8px 8px 0;
}

.heatmap-square {
  width: 18px;
  height: 18px;
}

.heatmap-square-active,
.heatmap-square-hover:hover {
  border: 2px solid gray;
}

.heatmap-month-label,
.heatmap-day-label {
  color: rgb(var(--v-theme-text));
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.heatmap-day-label {
  height: 20px;
}

.example-block {
  display: flex;
  gap: 3px;
  padding: 5px;
}

.level--1 {
  opacity: 0;
}

.level-0 {
  background-color: var(--heatmap-level-0, #ececef);
}

.level-1 {
  background-color: var(--heatmap-level-1, #d2dcff);
}

.level-2 {
  background-color: var(--heatmap-level-2, #7992f5);
}

.level-3 {
  background-color: var(--heatmap-level-3, #3f51ae);
}

.level-4 {
  background-color: var(--heatmap-level-4, #2a2b59);
}
</style>
