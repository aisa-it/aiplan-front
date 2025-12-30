<template>
  <q-scroll-area
    ref="scrollContainer"
    class="groupped-table"
    :class="!ny ? 'scroll-container' : 'new-year-scroll-container'"
    :horizontal-thumb-style="{ height: '0px' }"
    @scroll="handleScroll"
  >
    <PinnedIssueList
      v-if="pinnedIssues.length"
      :pinned-issues="pinnedIssues"
      class="pinned-issues"
    />

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
          (value) => setGroupHide(table?.entity?.id || table.entity, value)
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
          @updateGroupedIssues="updateGroupedIssues"
          @refresh="
            (pagination, isFullUpdate) =>
              refreshTable(index, pagination, isFullUpdate, table?.entity)
          "
          @open-preview="
            (issue, pagination) =>
              emits('openPreview', issue, index, pagination, table?.entity)
          "
          :context-type="contextType"
          @open-issue="(id, issue) => emits('openIssue', id, issue)"
        />
      </q-expansion-item>
    </div>
    <div ref="observerTarget" class="observer-target"></div>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import { onMounted, ref, watch } from 'vue';
import { throttle } from 'quasar';
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

import IssueTable from '../IssueTable.vue';
import PinnedIssueList from '../PinnedIssueList.vue';
import GroupedHeader from '../ui/GroupedHeader.vue';

import { defineEntityName } from '../../utils/defineEntityName';
import { IGroupedResponse } from '../../types';
import { useIssueContext } from '../../composables/useIssueContext';

const props = defineProps<{
  issues: IGroupedResponse[];
  groupBy: string;
  contextType: 'project' | 'sprint';
}>();

const emits = defineEmits([
  'refreshTable',
  'updateIssueField',
  'openPreview',
  'openIssue',
]);

const projectStore = useProjectStore();
const { ny } = storeToRefs(useUtilsStore());
const { project } = storeToRefs(projectStore);
const { contextProps, isGroupHide, setGroupHide } = useIssueContext(
  props.contextType,
);

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

const updateGroupedIssues = async (status: any) => {
  const group = (props.issues as any[]).find((item: any) => 
    item.entity?.id === status.id
  );

  if (group && group.issues.length === 0) {
    const groupIndex = (props.issues as any[]).indexOf(group);
    const pagination = {
      only_count: false,
      hide_sub_issues: contextProps.value?.hideSubIssues ?? false,
      only_active: contextProps.value?.showOnlyActive ?? true,
      order_by: contextProps.value?.filters?.order_by ?? 'sequence_id',
      desc: contextProps.value?.filters?.orderDesc ?? false,
      offset: 0,
      limit: contextProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
    };
    
    await refreshTable(groupIndex, pagination, false, group.entity);
  }
};

function* chunkGenerator(sourceArray, chunkSize = 10) {
  for (let i = 0; i < sourceArray.length; i += chunkSize) {
    yield sourceArray.slice(i, i + chunkSize);
  }
}

const refresh = (newIssues = false) => {
  issueList.value = [];
  generator = chunkGenerator(props.issues);
  let chunk = generator.next().value;
  if (!chunk) return;
  issueList.value.push(...chunk);
  pinnedIssues.value = [];
  if (project.value && newIssues) fetchPinnedIssues(project.value.id);
};

onMounted(() => {
  refresh();
});

watch(
  () => props.issues,
  () => {
    refresh(true);
  },
);
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

.pinned-issues {
  padding: 16px;
}
</style>
