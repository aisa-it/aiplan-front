<template>
  <div>
    <GroupedTables
      v-if="!isKanbanEnabled"
      :issues="issuesTables"
      :group-by="groupBy"
      @refresh-table="
        (index, pagination, isFullUpdate) =>
          refreshTable(index, pagination, isFullUpdate)
      "
    />
    <GroupedBoard
      v-if="isKanbanEnabled"
      :issues="issuesTables"
      :group-by="groupBy"
      @refresh-card="
        (index, pagination, isFullUpdate) =>
          refreshCard(index, pagination, isFullUpdate)
      "
    />
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { watch, ref, inject } from 'vue';

// stores
import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import { useGroupedIssues } from '../composables/useGroupedIssues';

// utils
import GroupedTables from './table-view/GroupedTables.vue';
import GroupedBoard from './board-view/GroupedBoard.vue';
import { IGroupedResponse } from '../types';
import TableListSkeleton from './skeletons/TableListSkeleton.vue';
import BoardListSkeleton from './skeletons/BoardListSkeleton.vue';

const { getGroupedIssues } = useGroupedIssues();

const issuesStore = useIssuesStore();
const { project, projectProps, issuesLoader, isKanbanEnabled } =
  storeToRefs(useProjectStore());

const { workspaceInfo } = storeToRefs(useWorkspaceStore());

const props = defineProps(['initGroupedIssues', 'initGroupBy']);
const issuesTables = ref<Array<IGroupedResponse>>([]);
const groupBy = ref();
const route = useRoute();

//
async function refreshTable(
  index: number,
  pagination: any,
  isFullUpdate: boolean,
) {
  if (isFullUpdate === true) {
    let props = JSON.parse(JSON.stringify(projectProps.value));
    props.page_size = pagination.limit;
    props.filters.order_by = pagination.order_by;
    props.filters.orderDesc = pagination.desc;

    await useProjectStore().setProjectProps(
      route.params.workspace as string,
      route.params.project as string,
      props,
    );

    await useProjectStore().getMeInProject(
      route.params.workspace as string,
      route.params.project as string,
    );

    return await load();
  }

  const response = await issuesStore.getIssuesTable(
    workspaceInfo?.value?.id as string,
    project.value.id as string,
    {},
    pagination,
  );
  issuesTables.value[index].issues = response?.data.issues;
}

async function refreshCard(
  index: number,
  pagination: any,
  isFullUpdate: boolean,
) {
  if (isFullUpdate) {
    return load();
  }

  const response = await issuesStore.getIssuesTable(
    workspaceInfo?.value?.id as string,
    project.value.id as string,
    {},
    pagination,
  );
  issuesTables.value[index].issues = response?.data.issues;
}

async function load() {
  issuesTables.value = [];
  issuesLoader.value = true;

  const response = await getGroupedIssues();

  issuesTables.value = response?.data?.issues;
  groupBy.value = response?.data?.group_by;
  issuesLoader.value = false;
}

watch(
  () => props.initGroupedIssues,
  () => {
    issuesTables.value = props.initGroupedIssues;
  },
);
watch(
  () => props.initGroupBy,
  () => {
    groupBy.value = props.initGroupBy;
  },
);
</script>
