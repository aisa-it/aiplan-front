<template>
  <div
    class="grouped-table"
    :class="ny ? 'new-year-scroll-container' : ''"
    :horizontal-thumb-style="{ height: '0px' }"
    ref="root"
  >
    <div v-for="(group, index) in groups" :key="groupKey(group, index)">
      <q-item v-if="!group.issues?.length && showEmptyGroups">
        <GroupedHeader
          :entity="group?.entity"
          :group-by="groupBy"
          :badge-name="defineEntityName(group.entity, groupBy)"
          :badge-color="group.entity?.color ?? undefined"
          :issues-count="group?.count"
        />
      </q-item>

      <q-expansion-item
        v-else-if="group.count > 0"
        :model-value="isOpen(group, index)"
        @update:model-value="(val) => onToggle(group, index, val)"
        class="gantt-margin"
      >
        <template #header>
          <GroupedHeader
            :entity="group?.entity"
            :group-by="groupBy"
            :badge-name="defineEntityName(group.entity, groupBy)"
            :badge-color="group.entity?.color ?? undefined"
            :issues-count="group?.count"
          />
        </template>

        <div
          :class="{
            'tag-colored-table': groupBy === 'labels' && group.entity?.color,
          }"
          :style="
            groupBy === 'labels' && group.entity?.color
              ? `--tag-color: ${group.entity.color}`
              : undefined
          "
        >
          <LazyVirtualMount
            :scroll-container="scrollContainer"
            :active="isOpen(group, index)"
            :estimated-height="getEstimatedHeight(group?.issues?.length)"
          >
            <slot :group="group" :index="index" />

            <template #fallback>
              <TableListSkeleton />
            </template>
          </LazyVirtualMount>
        </div>
      </q-expansion-item>
    </div>

    <div ref="observerTarget" class="observer-target" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';
import GroupedHeader from '../ui/GroupedHeader.vue';
import { defineEntityName } from '../../utils/defineEntityName';
import LazyVirtualMount from 'src/components/LazyVirtualMount.vue';
import TableListSkeleton from '../skeletons/TableListSkeleton.vue';

type Group = {
  entity: any;
  issues: any[];
  count: number;
};

const props = defineProps<{
  groups: Group[];
  groupBy: string;
  showEmptyGroups?: boolean;
  isGroupOpen?: (group: Group) => boolean;
}>();

const emits = defineEmits<{
  (e: 'toggle-group', group: Group, opened: boolean): void;
}>();

const scrollContainer = ref();
const root = ref<HTMLElement>();

const estimatedHeights = {
  10: 630,
  25: 1400,
  50: 2770,
} as const;

function getEstimatedHeight(length?: number): number {
  if (!length) return 300;
  return estimatedHeights[length as keyof typeof estimatedHeights] ?? 300;
}

const { ny } = storeToRefs(useUtilsStore());

const localOpenState = ref<Record<string, boolean>>({});

const groupKey = (group: Group, index: number) =>
  group.entity?.id ?? `${props.groupBy}-${index}`;

const isOpen = (group: Group, index: number) => {
  if (props.isGroupOpen) return props.isGroupOpen(group);
  const key = groupKey(group, index);
  return localOpenState.value[key] ?? true;
};

const onToggle = (group: Group, index: number, opened: boolean) => {
  const key = groupKey(group, index);

  if (!props.isGroupOpen) {
    localOpenState.value[key] = opened;
  }

  emits('toggle-group', group, opened);
};

function getScrollParent(el: HTMLElement | null): HTMLElement | null {
  if (!el) return null;

  let parent = el.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);

    const overflowY = style.overflowY;
    const isScrollable =
      overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay';

    if (isScrollable && parent.scrollHeight > parent.clientHeight) {
      return parent;
    }

    parent = parent.parentElement;
  }

  return null;
}

onMounted(() => {
  scrollContainer.value = getScrollParent(root.value ?? null);
});
</script>

<style scoped lang="scss">
.new-year-scroll-container {
  height: calc(100vh - 135px);
  overflow-y: auto;
  contain: inherit;
}

.tag-colored-table {
  :deep(.q-table) {
    border-left: 4px solid var(--tag-color);
    border-radius: 2px 0 0 2px;
  }
}
</style>
