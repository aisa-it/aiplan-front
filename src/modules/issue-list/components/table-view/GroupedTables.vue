<template>
  <q-scroll-area
    ref="scrollContainer"
    class="scroll-container"
    :horizontal-thumb-style="{ height: '0px' }"
    @scroll="handleScroll"
  >
    <div v-for="(table, index) in issueList" :key="index">
      <q-item v-if="!table.issues?.length && contextProps?.showEmptyGroups">
        <GroupedHeader
          :entity="table?.entity"
          :group-by="groupBy"
          :badge-name="defineEntityName(table.entity, groupBy)"
          :badge-color="table.entity?.color ?? undefined"
          :issues-count="table?.count"
      /></q-item>

      <q-expansion-item
        v-if="table.issues?.length"
        :default-opened="!isGroupHide(table?.entity?.id || table.entity)"
        @update:model-value="
          (value) => setGroupHide(entity?.entity?.id || table.entity, value)
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
            (issue, pagination) =>
              emits('openPreview', issue, index, pagination, table?.entity)
          "
          :context-type="contextType"
        />
      </q-expansion-item>
    </div>
    <div ref="observerTarget" class="observer-target"></div>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { useIssueContext } from '../../composables/useIssueContext';

import { defineEntityName } from '../../utils/defineEntityName';

import IssueTable from '../IssueTable.vue';
import GroupedHeader from '../ui/GroupedHeader.vue';

import { IGroupedResponse } from '../../types';
import { onMounted, ref, watch } from 'vue';
import { throttle } from 'quasar';

const props = defineProps<{
  issues: IGroupedResponse[];
  groupBy: string;
  contextType: 'project' | 'sprint';
}>();

const emits = defineEmits(['refreshTable', 'updateIssueField', 'openPreview']);

const { contextProps, isGroupHide, setGroupHide } = useIssueContext(
  props.contextType,
);

const refreshTable = (index, pagination, isFullUpdate, entity) => {
  emits('refreshTable', index, pagination, isFullUpdate, entity);
};

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

const refresh = () => {
  issueList.value = [];
  generator = chunkGenerator(props.issues);
  let chunk = generator.next().value;
  if (!chunk) return;
  issueList.value.push(...chunk);
};

onMounted(() => {
  refresh();
});

watch(
  () => props.issues,
  () => {
    refresh();
  },
);
</script>

<style scoped lang="scss">
.scroll-container {
  height: calc(100vh - 105px);
  overflow-y: auto;
}
</style>
