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
          <slot :folder="folder" :index="index" />
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
          <slot :folder="folder" />
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

const { ny } = storeToRefs(useUtilsStore());

const props = defineProps<{
  sprintFolders: DtoSprintFolder[];
}>();
</script>
