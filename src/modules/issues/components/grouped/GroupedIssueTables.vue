<template>
  <div
    ref="viewport"
    :data-gantt-scroll="ganttLayout ? '' : undefined"
    class="min-h-0 min-w-0 flex-1 overflow-y-auto [overflow-anchor:none]"
  >
    <div :style="spacerStyles">
      <section
        v-for="{ item, group } in visibleGroups"
        :key="group.key"
        :ref="measure"
        :data-index="item.index"
        class="min-w-0"
      >
        <component
          :is="group.total > 0 ? 'button' : 'div'"
          :type="group.total > 0 ? 'button' : undefined"
          :aria-expanded="group.total > 0 ? group.expanded : undefined"
          class="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-start"
          :class="{
            'cursor-pointer hover:bg-[rgba(var(--v-theme-on-background),0.05)]':
              group.total > 0,
          }"
          @click="group.total > 0 && emit('toggle', group)"
        >
          <IssueGroupHeading :group="group" />
          <v-icon
            v-if="group.total > 0"
            :icon="group.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            size="20"
          />
        </component>

        <v-expand-transition>
          <div v-if="group.total > 0 && group.expanded">
            <slot :group="group" />
          </div>
        </v-expand-transition>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts" generic="Group extends IssueGroupHeader">
import { computed, inject, ref, type ComponentPublicInstance } from 'vue';
import { useVirtualizer } from '@tanstack/vue-virtual';

import IssueGroupHeading from './IssueGroupHeading.vue';
import type { IssueGroupHeader } from '../../model/issue-groups';
import { ganttLayoutKey } from '../gantt/model/gantt-rows';

const props = defineProps<{
  groups: readonly Group[];
  estimateBodyHeight?: (group: Group) => number;
}>();
const emit = defineEmits<{ toggle: [group: Group] }>();
defineSlots<{ default(props: { group: Group }): unknown }>();

const viewport = ref<HTMLElement | null>(null);
const ganttLayout = inject(ganttLayoutKey, undefined);
const groupKeys = computed((previous: string[] | undefined) => {
  const keys = props.groups.map((group) => group.key);
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
    count: props.groups.length,
    getScrollElement: () => viewport.value,
    getItemKey: getItemKey.value,
    estimateSize: (index) => {
      const group = props.groups[index];
      return group?.expanded && group.total > 0
        ? 48 + (props.estimateBodyHeight?.(group) ?? 300)
        : 48;
    },
    overscan: 1,
    useAnimationFrameWithResizeObserver: true,
    onChange: ganttLayout?.layoutChanged,
  })),
);

const visibleGroups = computed(() =>
  virtualizer.value.getVirtualItems().flatMap((item) => {
    const group = props.groups[item.index];
    return group ? [{ item, group }] : [];
  }),
);

const spacerStyles = computed(() => {
  const items = virtualizer.value.getVirtualItems();
  const start = items[0]?.start ?? 0;
  const end = items.at(-1)?.end ?? 0;
  return {
    paddingTop: `${start}px`,
    paddingBottom: `${Math.max(0, virtualizer.value.getTotalSize() - end)}px`,
  };
});

const measure = (element: Element | ComponentPublicInstance | null) => {
  virtualizer.value.measureElement(
    element instanceof HTMLElement ? element : null,
  );
};

</script>
