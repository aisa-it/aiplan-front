<template>
  <div
    class="grouped-table"
    :class="ny ? 'new-year-scroll-container' : ''"
    :horizontal-thumb-style="{ height: '0px' }"
    ref="root"
  >
    <div v-for="(folder, index) in sprintFolders" :key="folder.id">
      <q-item v-if="!folder.sprints?.length">
        <GroupedHeader
          :badge-name="folder?.name"
          :sprints-count="0"
        />
      </q-item>

      <q-expansion-item
        v-else-if="folder.sprints.length > 0 && folder.id !== ROOT_FOLDER_ID"
        class="gantt-margin"
        >
        <template #header>
          <GroupedHeader
            :badge-name="folder?.name"
            :sprints-count="folder?.sprints?.length"
          />
        </template>

        <div>
          <!-- <LazyVirtualMount
            :scroll-container="scrollContainer"
            :active="isOpen(folder, index)"
            :estimated-height="getEstimatedHeight(folder?.issues?.length)"
          > -->
            <slot :folder="folder" :index="index" />

            <!-- <template #fallback>
              <TableListSkeleton />
            </template>
          </LazyVirtualMount> -->
        </div>
      </q-expansion-item>
      <q-expansion-item
        v-else
        class="gantt-margin"
        >
        <template #header>
          <GroupedHeader
            :sprints-count="folder?.sprints?.length"
          />
        </template>

        <div>
          <!-- <LazyVirtualMount
            :scroll-container="scrollContainer"
            :active="isOpen(folder, index)"
            :estimated-height="getEstimatedHeight(folder?.issues?.length)"
          > -->
            <slot :folder="folder" :index="index" />

            <!-- <template #fallback>
              <TableListSkeleton />
            </template>
          </LazyVirtualMount> -->
        </div>
      </q-expansion-item>
    </div>

    <div ref="observerTarget" class="observer-target" />
  </div>
</template>

<script setup lang="ts">
import { DtoSprintFolder } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { storeToRefs } from 'pinia';
import { ROOT_FOLDER_ID } from 'src/constants/constants';
import GroupedHeader from 'src/modules/sprints/ui/GroupedHeader.vue';
import { useUtilsStore } from 'src/stores/utils-store';
import { computed, ref } from 'vue';
import LazyVirtualMount from 'src/components/LazyVirtualMount.vue'

const { ny } = storeToRefs(useUtilsStore());

const props = defineProps<{
  sprintFolders: DtoSprintFolder[];
  showEmptyFolders?: boolean;
  isFolderOpen?: (folder: DtoSprintFolder) => boolean;
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
};

const isOpen = (folder: DtoSprintFolder, index: number) => {
  if (props.isFolderOpen) return props.isFolderOpen(folder);
  const key = groupKey(folder, index);
  return localOpenState.value[key] ?? true;
};

// const sprintFolders = computed(() =>
//   sprints.value?.filter((item) => item.id !== ROOT_FOLDER_ID),
// );
// const rootSprints = computed(
//   () => sprints.value?.find((item) => item.id === ROOT_FOLDER_ID)?.sprints,
// );
// const filteredSprints = computed(() => {
//   let items = [];
//   if (sprintFolders.value) {
//     items.push(...sprintFolders.value);
//   }
//   if (rootSprints.value) {
//     items.push(...rootSprints.value);
//   }
//   return items;
// });

</script>
