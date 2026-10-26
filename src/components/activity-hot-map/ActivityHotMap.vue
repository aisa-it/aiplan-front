<template>
  <div>
    <div class="flex">
      <div v-if="!loadReq" class="mt-7 mr-2">
        <div
          v-for="day in ACTIVITY_WEEKDAY_KEYS"
          :key="day"
          class="h-5 text-center text-xs font-bold"
        >
          {{ t(`activityHotMap.weekdays.${day}`) }}
        </div>
      </div>

      <div ref="heatmapRef" class="overflow-x-auto">
        <div
          v-if="squares.length && !loadReq"
          class="grid grid-rows-[auto_repeat(7,18px)] grid-cols-[auto_repeat(54,18px)] gap-0.5 py-2 pr-2"
        >
          <div
            v-for="(month, index) in monthPositions"
            :key="`${month.key}-${index}`"
            class="text-center text-xs font-bold"
            :style="{
              gridColumnStart: month.start,
              gridColumnEnd: `span ${month.span}`,
            }"
          >
            {{ t(`activityHotMap.months.${month.key}`) }}
          </div>

          <template v-for="(square, index) in squares" :key="index">
            <div
              v-if="square.level === -1"
              class="size-[18px] opacity-0"
              :style="getSquarePosition(index)"
            />

            <v-tooltip v-else location="top">
              <template #activator="{ props: tooltipProps }">
                <button
                  v-bind="tooltipProps"
                  type="button"
                  class="size-[18px] hover:border-2 hover:border-[gray]"
                  :class="[
                    getActivityLevelClass(square.level, isDark),
                    activeSquare === index ? 'border-2 border-[gray]' : '',
                  ]"
                  :style="getSquarePosition(index)"
                  :aria-label="
                    t('activityHotMap.tooltip', {
                      date: square.date,
                      count: square.count,
                    })
                  "
                  @click="activeSquare = index"
                />
              </template>
              <span>
                {{
                  t('activityHotMap.tooltip', {
                    date: square.date,
                    count: square.count,
                  })
                }}
              </span>
            </v-tooltip>
          </template>
        </div>
      </div>
      <page-loader v-if="loadReq" />
    </div>

    <div
      v-if="squares.length && exampleBlock && !loadReq"
      class="mt-4 flex gap-[3px] p-[5px]"
    >
      <v-tooltip
        v-for="(levelKey, index) in ACTIVITY_LEVEL_KEYS"
        :key="levelKey"
        location="top"
        :text="t(`activityHotMap.levels.${levelKey}`)"
      >
        <template #activator="{ props: tooltipProps }">
          <div
            v-bind="tooltipProps"
            class="size-[18px]"
            :class="getActivityLevelClass(index, isDark)"
          />
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, toRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import { useAppTheme } from '@/composables/useAppTheme';

import {
  ACTIVITY_LEVEL_KEYS,
  ACTIVITY_WEEKDAY_KEYS,
  getActivityLevelClass,
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

const { t } = useI18n();

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
