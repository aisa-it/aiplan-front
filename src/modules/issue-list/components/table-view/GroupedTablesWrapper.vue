<template>
  <div
    ref="scrollContainer"
    class="grouped-table"
    :class="!ny ? 'new-year-scroll-container' : 'scroll-container'"
    :horizontal-thumb-style="{ height: '0px' }"
    @scroll="handleScroll"
  >
    <div v-for="(group, index) in visibleGroups" :key="groupKey(group, index)">
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
          <slot :group="group" :index="index" />
        </div>
      </q-expansion-item>
    </div>

    <div ref="observerTarget" class="observer-target" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { throttle } from 'quasar';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';
import GroupedHeader from '../ui/GroupedHeader.vue';
import { defineEntityName } from '../../utils/defineEntityName';

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

const { ny } = storeToRefs(useUtilsStore());
const visibleGroups = ref<Group[]>([]);
let generator: Generator<Group[], void, unknown> | null = null;

function* chunkGenerator(source: Group[], size = 10) {
  for (let i = 0; i < source?.length; i += size) {
    yield source.slice(i, i + size);
  }
}

const refresh = () => {
  visibleGroups.value = [];
  generator = chunkGenerator(props.groups);
  const chunk = generator.next().value;
  if (chunk) visibleGroups.value.push(...chunk);
};

const handleScroll = throttle((info: any) => {
  if (info.verticalPercentage < 0.8) return;
  const chunk = generator?.next().value;
  if (chunk) visibleGroups.value.push(...chunk);
}, 100);

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

onMounted(refresh);

watch(() => [props.groups, props.groups?.length], refresh);
</script>

<style scoped lang="scss">
.scroll-container {
  height: calc(100vh - 105px);
  overflow-y: auto;
  contain: inherit;
}

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
