<template>
  <div
    ref="viewport"
    class="min-h-0 min-w-0 flex-1 overflow-x-auto overflow-y-hidden"
  >
    <div
      class="relative h-full"
      :style="{ width: `${virtualizer.getTotalSize()}px` }"
    >
      <IssueBoardColumn
        v-for="{ item, group } in visibleColumns"
        :key="group.key"
        class="absolute inset-y-0 left-0 py-2"
        :style="{
          width: `${item.size}px`,
          transform: `translateX(${item.start}px)`,
        }"
        :group="group"
        :rows-per-page="rowsPerPage"
        :accent="colorLabels ? group.color : undefined"
        :property-templates="propertyTemplates"
        :initial-scroll-top="scrollPositions.get(group.key)"
        @scroll-position="scrollPositions.set(group.key, $event)"
        @toggle="emit('toggle', group)"
        @page="emit('page', group, $event)"
        @manage-sprints="emit('manage-sprints', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useElementSize } from '@vueuse/core';
import { useVirtualizer } from '@tanstack/vue-virtual';
import type {
  DtoIssueWithCount,
  DtoProjectPropertyTemplate,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { IssueGroup, IssueGroupHeader } from '../../model/issue-groups';
import IssueBoardColumn from './IssueBoardColumn.vue';

type BoardGroup = IssueGroup & IssueGroupHeader;

const props = defineProps<{
  groups: BoardGroup[];
  rowsPerPage: number;
  colorLabels: boolean;
  propertyTemplates?: DtoProjectPropertyTemplate[];
}>();
const emit = defineEmits<{
  toggle: [group: BoardGroup];
  page: [group: IssueGroup, page: number];
  'manage-sprints': [issue: DtoIssueWithCount];
}>();

const viewport = ref<HTMLElement | null>(null);
const { width } = useElementSize(viewport);
const columnWidth = computed(() =>
  width.value ? Math.min(400, Math.max(1, width.value - 16)) : 400,
);
const scrollPositions = new Map<string, number>();
const groupKeys = computed((previous: string[] | undefined) => {
  const keys = props.groups.map(({ key }) => key);
  return previous?.length === keys.length &&
    keys.every((key, index) => key === previous[index])
    ? previous
    : keys;
});
const getItemKey = computed(() => {
  const keys = groupKeys.value;
  return (index: number) => keys[index] ?? index;
});

const virtualizer = useVirtualizer<HTMLElement, HTMLElement>(
  computed(() => ({
    horizontal: true,
    count: groupKeys.value.length,
    getScrollElement: () => viewport.value,
    getItemKey: getItemKey.value,
    estimateSize: () => columnWidth.value,
    gap: 12,
    paddingStart: 8,
    paddingEnd: 8,
    overscan: 1,
  })),
);
watch(columnWidth, () => virtualizer.value.measure());

const visibleColumns = computed(() =>
  virtualizer.value.getVirtualItems().flatMap((item) => {
    const group = props.groups[item.index];
    return group ? [{ item, group }] : [];
  }),
);
</script>
