<template>
  <div>
    <IssueTable
      v-if="rows?.length"
      :rows="rows"
      :rows-count="rowsCount"
      :loading="loadingTable"
      @refresh="(pagination) => load(pagination)"
      @open-preview="(row) => openPreview(row)"
      :context-type="contextType"
      @open-issue="(id) => openIssue(id)"
    />
    <div
      v-else
      class="column flex-center"
      style="width: 100%; height: calc(100vh - 200px)"
    >
      <DocumentIcon :width="56" :height="56" />
      <h6>Нет задач</h6>
    </div>
    <IssuePreview
      v-model="isPreview"
      @refresh="
        load(
          parsePagination({
            page: 1,
            rowsNumber: 0,
            sortBy: contextProps?.filters?.order_by,
            descending: contextProps?.filters?.orderDesc,
            rowsPerPage: contextProps?.page_size ?? DEF_ROWS_PER_PAGE,
          }),
        )
      "
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

// constants
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

// components
import IssueTable from './IssueTable.vue';
import { useDefaultIssues } from '../composables/useDefaultIssues';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import IssuePreview from 'src/modules/single-issue/preview-issue/ui/IssuePreview.vue';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useIssueContext } from '../composables/useIssueContext';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  contextType: 'project' | 'sprint';
}>();

const { contextProps, updateProps } = useIssueContext(props.contextType);

const route = useRoute();
const rows = ref([]);
const table = ref();
const rowsCount = ref<number | null>(null);

const { onRequest } = useDefaultIssues(props.contextType);

const loadingTable = ref(false);
const singleIssueStore = useSingleIssueStore();
const { currentIssueID, isPreview, issueCommentsData, issueActivitiesData } =
  storeToRefs(singleIssueStore);
const { user } = storeToRefs(useUserStore());

const isMobile = computed(() => Screen.width <= 1200);
const issuesStore = useIssuesStore();
const load = async (pagination) => {
  console.log('зашли');
  loadingTable.value = true;
  let props = JSON.parse(JSON.stringify(contextProps.value));
  props.page_size = pagination.limit;
  props.filters.order_by = pagination.order_by;
  props.filters.orderDesc = pagination.desc;

  await updateProps(props);

  const response = await onRequest(pagination);
  table.value = response.data;
  rows.value = response.data.issues;
  rowsCount.value = response.data.count || DEF_ROWS_PER_PAGE;
  loadingTable.value = false;
};

async function openIssue(id: string, project: string) {
  isPreview.value = false;

  singleIssueStore.openIssue(
    id,
    user.value.theme?.open_in_new ? '_blank' : '_self',
    project,
  );
}

async function openPreview(issue: DtoIssue) {
  if (!route.params.workspace || !(issue.project ?? route.params.project))
    return;

  const id = String(issue.sequence_id);
  if (isMobile.value) {
    openIssue(id, issue.project ?? (route.params.project as string));
    return;
  } else if (currentIssueID.value === id && isPreview.value) return;

  isPreview.value = false;
  issueCommentsData.value = undefined;
  issueActivitiesData.value = undefined;
  currentIssueID.value = id;

  await singleIssueStore.getIssueData(
    route.params.workspace as string,
    issue.project ?? (route.params.project as string),
  );
  isPreview.value = true;
}

async function closePreview() {
  if (!isPreview.value) return;
  isPreview.value = false;
  currentIssueID.value = '';
}

function parsePagination(pagination) {
  return {
    only_count: false,
    show_sub_issues: contextProps.value.showSubIssues ?? true,
    draft: contextProps.value?.draft ?? true,
    order_by: pagination.sortBy,
    desc: pagination.descending,
    offset:
      (pagination.page - 1) *
      (pagination.rowsPerPage == 0 ? 10 : pagination.rowsPerPage),
    limit:
      pagination.rowsPerPage == 0
        ? pagination.rowsNumber || 10
        : pagination.rowsPerPage,
  };
}
watch(
  () => issuesStore.ungroupedIssueList,
  () => {
    rows.value = issuesStore.ungroupedIssueList?.issues;
    rowsCount.value = issuesStore.ungroupedIssueList?.count;
  },
  { immediate: true },
);

watch(isMobile, () => {
  if (isMobile.value) closePreview();
});

onBeforeUnmount(() => {
  closePreview();
});
</script>
