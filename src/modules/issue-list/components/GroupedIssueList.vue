<template>
  <div>
    <GroupedTables
      v-if="!isKanbanEnabled"
      :issues="issuesStore.groupedIssueList"
      :group-by="issuesStore.groupByIssues"
      @refresh-table="
        (index, pagination, isFullUpdate, entity) =>
          refreshTable(index, pagination, isFullUpdate, entity)
      "
    />
    <GroupedBoard
      v-if="isKanbanEnabled"
      :issues="issuesStore.groupedIssueList"
      :group-by="issuesStore.groupByIssues"
      @refresh-card="
        (index, pagination, isFullUpdate, entity) =>
          refreshTable(index, pagination, isFullUpdate, entity)
      "
    />
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

// stores
import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';

// components
import { useGroupedIssues } from '../composables/useGroupedIssues';

// utils
import GroupedTables from './table-view/GroupedTables.vue';
import GroupedBoard from './board-view/GroupedBoard.vue';

const { getGroupedIssues, getCurrentTable } = useGroupedIssues();

const issuesStore = useIssuesStore();
const { projectProps, issuesLoader, isKanbanEnabled } =
  storeToRefs(useProjectStore());

const route = useRoute();

//
async function refreshTable(
  index: number,
  pagination: any,
  isFullUpdate: boolean,
  entity: any,
) {
  if (isFullUpdate === false) {
    return await getCurrentTable(index, pagination, entity);
  }

  if (isKanbanEnabled.value === false) {
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
  }

  return await load();
}

async function load() {
  issuesLoader.value = true;

  await getGroupedIssues();

  issuesLoader.value = false;
}
</script>
