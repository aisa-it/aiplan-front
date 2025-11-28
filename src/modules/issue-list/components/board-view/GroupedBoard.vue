<template>
  <PinnedIssueList :pinned-issues="pinnedIssues" class="pinned-issues"/>
  <div class="horizontal-scroll-enable board-wrapper">
    <div v-for="(table, index) in defineIssues" :key="index">
      <BoardCardList
        :table="table"
        :group-by="groupBy"
        @refresh="
          (pagination, isFullUpdate) =>
            refreshTable(index, pagination, isFullUpdate, table.entity)
        "
        @open-preview="
          (id, pagination) =>
            emits('openPreview', id, index, pagination, table?.entity)
        "
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

import { useProjectStore } from 'src/stores/project-store';
import { useIssuesStore } from 'src/stores/issues-store';

import BoardCardList from './BoardCardList.vue';
import PinnedIssueList from '../PinnedIssueList.vue';
import { IGroupedResponse } from '../../types';

const props = defineProps<{
  issues: IGroupedResponse[];
  groupBy: string;
}>();

const emits = defineEmits(['refreshCard', 'refresh', 'openPreview']);

const projectStore = useProjectStore();
const { project, projectProps } = storeToRefs(projectStore);

const { pinnedIssues } = storeToRefs(useIssuesStore());
const { fetchPinnedIssues } = useIssuesStore();

const refreshTable = (index: number, pagination, isFullUpdate, entity) => {
  const p = pagination;
  delete p.group_by;

  emits('refreshCard', index, pagination, isFullUpdate, entity);
};

const defineIssues = computed(() => {
  return !projectProps.value?.showEmptyGroups
    ? props.issues.filter((table) => table.issues?.length)
    : props.issues;
});

onMounted(() => {
  pinnedIssues.value = [];
  fetchPinnedIssues(project.value.id);
});
</script>

<style scoped lang="scss">
.board-wrapper {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  width: 100%;
  gap: 12px;
  max-height: calc(100vh - 120px);
  padding: 8px;
  overflow-y: hidden;
}

.all-boards {
  position: relative;
}

.board-card {
  border-radius: 16px;
  border: 1px solid var(--darkest-border-color);
  min-height: 240px;
  padding: 8px;

  &__header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
}

.pinned-issues {
  padding: 16px;
}
</style>
