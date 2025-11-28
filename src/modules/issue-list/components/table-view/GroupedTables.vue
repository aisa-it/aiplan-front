<template>
  <q-scroll-area
    ref="scrollContainer"
    class="scroll-container"
    :horizontal-thumb-style="{ height: '0px' }"
    @scroll="handleScroll"
  >
    <PinnedIssueList :pinned-issues="pinnedIssues" class="pinned-issues"/>

    <div v-for="(table, index) in issueList" :key="index">
      <q-item v-if="!table.issues?.length && projectProps?.showEmptyGroups">
        <GroupedHeader
          :entity="table?.entity"
          :group-by="groupBy"
          :badge-name="defineEntityName(table.entity, groupBy)"
          :badge-color="table.entity?.color ?? undefined"
          :issues-count="table?.count"
        />
      </q-item>

      <q-expansion-item
        v-if="table.issues?.length"
        :default-opened="
          !projectStore.isGroupHide(table?.entity?.id || table.entity)
        "
        @update:model-value="
          (value) =>
            projectStore.setGroupHide(entity?.entity?.id || table.entity, value)
        "
      >
        <template #header>
          <GroupedHeader
            :entity="table?.entity"
            :group-by="groupBy"
            :badge-name="defineEntityName(table.entity, groupBy)"
            :badge-color="table.entity?.color ?? undefined"
            :issues-count="table?.count"
          />
        </template>
        <IssueTable
          :rows="table?.issues"
          :rowsCount="table?.count"
          :entity="table.entity"
          @refresh="
            (pagination, isFullUpdate) =>
              refreshTable(index, pagination, isFullUpdate, table?.entity)
          "
          @open-preview="
            (id, pagination) =>
              emits('openPreview', id, index, pagination, table?.entity)
          "
        />
      </q-expansion-item>
    </div>
    <div ref="observerTarget" class="observer-target"></div>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { throttle } from 'quasar';
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';
import { useIssuesStore } from 'src/stores/issues-store';

import IssueTable from '../IssueTable.vue';
import PinnedIssueList from '../PinnedIssueList.vue';
import GroupedHeader from '../ui/GroupedHeader.vue';

import { defineEntityName } from '../../utils/defineEntityName';
import { IGroupedResponse } from '../../types';

const props = defineProps<{
  issues: IGroupedResponse[];
  groupBy: string;
}>();

const emits = defineEmits(['refreshTable', 'updateIssueField', 'openPreview']);

const projectStore = useProjectStore();
const { project, projectProps } = storeToRefs(projectStore);

const refreshTable = (index, pagination, isFullUpdate, entity) => {
  emits('refreshTable', index, pagination, isFullUpdate, entity);
};

const { pinnedIssues } = storeToRefs(useIssuesStore());
const { fetchPinnedIssues } = useIssuesStore();

const issueList = ref([]);
const scrollContainer = ref(null);
let generator;

const handleScroll = throttle((info) => {
  const { verticalPercentage } = info;
  const threshold = 0.8; // 95% от конца списка  console.log(e, 'lol');

  // if (!scrollContainer.value) return;
  if (verticalPercentage < threshold) return;

  const chunk = generator.next().value;

  if (!chunk) return;

  issueList.value.push(...chunk);
}, 100);

function* chunkGenerator(sourceArray, chunkSize = 10) {
  for (let i = 0; i < sourceArray.length; i += chunkSize) {
    yield sourceArray.slice(i, i + chunkSize);
  }
}

onMounted(() => {
  generator = chunkGenerator(props.issues);
  let chunk = generator.next().value;
  if (!chunk) return;
  issueList.value.push(...chunk);
  pinnedIssues.value = [];
  fetchPinnedIssues(project.value.id);
});
</script>

<style scoped lang="scss">
.scroll-container {
  height: calc(100vh - 105px);
  overflow-y: auto;
  contain: inherit;
}

.pinned-issues {
  padding: 16px;
}
</style>
