<template>
  <div
    ref="container"
    class="gantt-view"
    :style="{ gridTemplateColumns: `minmax(0, ${split}fr) 8px minmax(0, ${100 - split}fr) auto` }"
  >
    <div ref="pane" class="gantt-table-pane" @scroll.capture="onTableScroll">
      <slot />
    </div>
    <div
      class="gantt-divider"
      role="separator"
      tabindex="0"
      aria-orientation="vertical"
      :aria-label="t('issues.gantt.divider')"
      :aria-valuenow="Math.round(split)"
      @pointerdown="start"
      @pointermove="move"
      @lostpointercapture="stop"
      @keydown="keydown"
    />
    <GanttTimeline :issues="issues" :rows="rows" @vertical-scroll="scrollTable" />
    <div
      v-show="scrollRange > 0"
      ref="scrollbar"
      class="gantt-vertical-scrollbar"
      role="region"
      tabindex="0"
      :aria-label="t('issues.gantt.verticalScroll')"
      @scroll.passive="onScrollbarScroll"
    >
      <div class="w-px" :style="{ height: `calc(100% + ${scrollRange}px)` }" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DtoIssueWithCount } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useGanttRows } from '../composables/useGanttRows';
import { useGanttSplitter } from '../composables/useGanttSplitter';
import GanttTimeline from './GanttTimeline.vue';

defineProps<{ issues: readonly DtoIssueWithCount[] }>();

const { t } = useI18n();
const container = ref<HTMLElement | null>(null);
const pane = ref<HTMLElement | null>(null);
const scrollbar = ref<HTMLElement | null>(null);
const { rows, scrollRange, onScrollbarScroll, onTableScroll, scrollTable } =
  useGanttRows(pane, scrollbar);
const { split, start, move, stop, keydown } = useGanttSplitter(container, scrollbar);
</script>

<style scoped>
.gantt-view {
  --gantt-header-height: 84px;
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
}

.gantt-table-pane {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.gantt-table-pane :deep([data-gantt-scroll]) {
  scrollbar-width: none;
}

.gantt-table-pane :deep([data-gantt-scroll]::-webkit-scrollbar) {
  display: none;
}

.gantt-vertical-scrollbar {
  min-height: 0;
  min-width: 8px;
  overflow: hidden scroll;
  scrollbar-gutter: stable;
}

.gantt-divider {
  position: relative;
  z-index: 11;
  touch-action: none;
  cursor: col-resize;
}

.gantt-divider::before {
  position: absolute;
  inset: 0 3px 0 auto;
  width: 1px;
  background: rgb(var(--v-theme-border));
  content: '';
}

.gantt-divider:is(:hover, :focus-visible)::before {
  background: rgb(var(--v-theme-primary));
}
</style>
