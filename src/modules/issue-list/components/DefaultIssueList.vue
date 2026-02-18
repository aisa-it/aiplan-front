<template>
  <div class="issue-list">
    <IssueTable
      v-if="rows?.length"
      :rows="rows"
      :rows-count="rowsCount"
      :loading="loadingTable"
      :context-type="contextType"
      @refresh="(pagination) => load(pagination)"
      @open-preview="
        (row) =>
          emits('openIssuePreview', row, {
            page: 1,
            rowsNumber: 0,
            sortBy: contextProps?.filters?.order_by,
            descending: contextProps?.filters?.orderDesc,
            rowsPerPage: contextProps?.page_size ?? DEF_ROWS_PER_PAGE,
          })
      "
      @open-issue="
        (id, issue) =>
          openIssue(
            id,
            issue.project_detail?.identifier ??
              (route.params.project as string),
          )
      "
    />
    <div
      v-else
      class="column flex-center"
      style="width: 100%; height: calc(100vh - 200px)"
    >
      <DocumentIcon :width="56" :height="56" />
      <h6>Нет задач</h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';
import { useIssuesStore } from 'src/stores/issues-store';

import IssueTable from './IssueTable.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';

import { useIssueContext } from '../composables/useIssueContext';
import { useDefaultIssues } from '../composables/useDefaultIssues';

import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';
import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { QuasarPagination } from '../composables/useGroupedIssues';

const props = defineProps<{
  contextType: 'project' | 'sprint';
}>();

const emits = defineEmits<{
  refreshIssue: [issues: DtoIssue[]];
  openIssuePreview: [issue: DtoIssue, pagination: QuasarPagination];
}>();

const { contextProps, updateProps } = useIssueContext(props.contextType);

const route = useRoute();
const rows = ref([]);
const table = ref();
const rowsCount = ref<number | null>(null);

const { onRequest } = useDefaultIssues(props.contextType);

const loadingTable = ref(false);
const singleIssueStore = useSingleIssueStore();
const { isPreview, currentIssueID } = storeToRefs(singleIssueStore);
const { user } = storeToRefs(useUserStore());

const issuesStore = useIssuesStore();

const refreshContext = ref<{
  pagination?: QuasarPagination;
}>({
  pagination: undefined,
});

const load = async (pagination) => {
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

async function refreshByPreview(isFullUpdate: boolean = false) {
  if (!currentIssueID.value) return;

  if (isFullUpdate) {
    await load({
      page: 1,
      rowsNumber: 0,
      sortBy: contextProps?.filters?.order_by,
      descending: contextProps?.filters?.orderDesc,
      rowsPerPage: contextProps?.page_size ?? DEF_ROWS_PER_PAGE,
    });
  } else {
    const currentPagination = {
      limit: contextProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
      order_by: contextProps.value?.filters?.order_by || 'sequence_id',
      desc: contextProps.value?.filters?.orderDesc || false,
      page: 1,
    };

    await load(currentPagination);
  }
}

function setRefreshContext(
  issue: DtoIssue,
  pagination?: QuasarPagination,
  entity?: any,
) {
  refreshContext.value = {
    pagination: pagination || refreshContext.value.pagination,
  };
}

defineExpose({
  refreshByPreview,
  setRefreshContext,
});

watch(
  () => issuesStore.ungroupedIssueList,
  () => {
    rows.value = issuesStore.ungroupedIssueList?.issues;
    rowsCount.value = issuesStore.ungroupedIssueList?.count;
    emits('refreshIssue', rows.value);
  },
  { immediate: true },
);
</script>
