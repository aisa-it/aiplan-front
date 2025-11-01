<template>
  <div>
    <GroupedTables
      v-if="!isKanbanEnabled && issuesStore.groupedIssueList?.length"
      :issues="issuesStore.groupedIssueList"
      :group-by="issuesStore.groupByIssues"
      @refresh-table="
        (index, pagination, isFullUpdate, entity) =>
          refreshTable(index, pagination, isFullUpdate, entity)
      "
      @open-preview="
        (id, index, pagination, entity) =>
          openPreview(id, index, pagination, entity)
      "
    />
    <GroupedBoard
      v-if="isKanbanEnabled && issuesStore.groupedIssueList?.length"
      :issues="issuesStore.groupedIssueList"
      :group-by="issuesStore.groupByIssues"
      @refresh-card="
        (index, pagination, isFullUpdate, entity) =>
          refreshTable(index, pagination, isFullUpdate, entity)
      "
      @open-preview="
        (id, index, pagination, entity) =>
          openPreview(id, index, pagination, entity)
      "
    />
    <div
      v-if="!issuesStore.groupedIssueList.length"
      class="column flex-center"
      style="width: 100%; height: calc(100vh - 200px)"
    >
      <DocumentIcon :width="56" :height="56" />
      <h6>Нет задач</h6>
    </div>
    <IssuePreview
      v-model="isPreview"
      @refresh="refreshByPreview"
      @open="openIssue"
      @close="closePreview"
    />
  </div>
</template>

<script setup lang="ts">
// core
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { Screen } from 'quasar';
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
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import IssuePreview from 'src/modules/single-issue/preview-issue/ui/IssuePreview.vue';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';

const { getGroupedIssues, getCurrentTable } = useGroupedIssues();

const issuesStore = useIssuesStore();
const { projectProps, issuesLoader, isKanbanEnabled } =
  storeToRefs(useProjectStore());
const singleIssueStore = useSingleIssueStore();

const { currentIssueID, isPreview, issueCommentsData, issueActivitiesData } =
  storeToRefs(singleIssueStore);
const { user } = storeToRefs(useUserStore());

const route = useRoute();

const isMobile = computed(() => Screen.width <= 1200);

// TODO типизировать
const refreshReviewInfo = ref<{
  index: number | null;
  pagination?: any;
  entity?: any;
}>({
  index: null,
  pagination: undefined,
  entity: undefined,
});
// TODO типизировать
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

async function openIssue(id: string) {
  isPreview.value = false;

  singleIssueStore.openIssue(
    id,
    user.value.theme?.open_in_new ? '_blank' : '_self',
  );
}

async function openPreview(
  id: string,
  index?: number,
  pagination?: any,
  entity?: any,
) {
  if (!route.params.workspace || !route.params.project) return;
  if ((currentIssueID.value === id && isPreview.value) || isMobile.value) {
    openIssue(id);
    return;
  }
  isPreview.value = false;
  issueCommentsData.value = undefined;
  issueActivitiesData.value = undefined;
  currentIssueID.value = id;

  await singleIssueStore.getIssueData(
    route.params.workspace as string,
    route.params.project as string,
  );

  Object.assign(refreshReviewInfo.value, { index, pagination, entity });

  isPreview.value = true;
}

async function closePreview() {
  if (!isPreview.value) return;
  isPreview.value = false;
  currentIssueID.value = '';
}

async function refreshByPreview(isFullUpdate?: boolean) {
  const { index, pagination, entity } = refreshReviewInfo.value;
  if (index === null) return;
  if (isKanbanEnabled.value) delete pagination.group_by;
  refreshTable(index, pagination, !!isFullUpdate, entity);
}

watch(isMobile, () => {
  if (isMobile.value) closePreview();
});

onBeforeUnmount(() => {
  closePreview();
});
</script>
