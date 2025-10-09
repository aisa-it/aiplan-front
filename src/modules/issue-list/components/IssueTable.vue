<template>
  <q-table
    v-model:pagination="quasarPagination"
    class="my-sticky-column-table table-bottom-reverse"
    row-key="sequence_id"
    flat
    :rows="rows"
    :columns="projectStore.getTableColumns"
    @row-contextmenu.prevent="(ev, row) => (selectedRow = row)"
    @request="(e) => getIssues(e.pagination)"
  >
    <template #bottom>
      <PaginationDefault
        v-model:selected-page="quasarPagination.page"
        :rows-per-page="quasarPagination.rowsPerPage"
        :rows-per-page-options="[10, 25, 50, 100]"
        :rows-number="quasarPagination.rowsNumber"
        show-rows-per-page
        @request="() => getIssues()"
        @update:rowsPerPage="
          (rowsPerPage) =>
            getIssues(
              Object.assign(quasarPagination, { rowsPerPage: rowsPerPage }),
            )
        "
      />
    </template>

    <template v-slot:body-cell-sequence_id="props">
      <SequenceIdColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-name="props">
      <NameColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-priority="props">
      <PriorityColumn :row-info="props" @refresh="updateIssuesList()" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-state="props">
      <StatusColumn
        :row-info="props"
        @refresh="
          (status) => {
            props.row.state_detail = status;
            updateIssuesList();
          }
        "
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-target_date="props">
      <TargetDateColumn :row-info="props" @refresh="updateIssuesList()" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-created_at="props">
      <CreatedAtColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-updated_at="props">
      <UpdatedAtColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-author="props">
      <AuthorColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-assignees="props">
      <AssigneesColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-labels="props">
      <LabelsColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-sub_issues_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'sub-issues'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-linked_issues_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'linked_issues_count'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-link_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'links'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-attachment_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'attachments'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>
  </q-table>
</template>

<script lang="ts" setup>
import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';
import { onMounted, ref, watchEffect } from 'vue';

import { useProjectStore } from 'src/stores/project-store';

import IssueContextMenu from 'src/shared/components/IssueContextMenu.vue';
import {
  CreatedAtColumn,
  SequenceIdColumn,
  NameColumn,
  PriorityColumn,
  StatusColumn,
  TargetDateColumn,
  AuthorColumn,
  AssigneesColumn,
  UpdatedAtColumn,
  LabelsColumn,
  ChipCountColumn,
} from './issue-table';
import { storeToRefs } from 'pinia';

const projectStore = useProjectStore();

const { projectProps } = storeToRefs(projectStore);

interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

const emits = defineEmits(['refresh']);
const props = defineProps(['rows', 'rowsCount', 'loading']);

const selectedRow = ref();

const quasarPagination = ref<QuasarPagination>({
  page: 1,
  rowsNumber: props.rowsCount,
  sortBy: projectProps.value?.filters?.order_by,
  descending: projectProps.value?.filters?.orderDesc,
  rowsPerPage: projectProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
});

const initialOffset = ref(parsePagination(quasarPagination.value)?.offset);

// преобразуем quasar пагинацию в пагинацию бека
function parsePagination(pagination: QuasarPagination) {
  return {
    only_count: false,
    show_sub_issue: projectProps.value.showSubIssues ?? true,
    draft: projectProps.value?.draft ?? true,
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

const getIssues = async (p?: any) => {
  let isFullUpdate = false;
  if (p) quasarPagination.value = p;

  if (initialOffset.value === parsePagination(quasarPagination.value)?.offset) {
    isFullUpdate = true;
  }
  initialOffset.value = parsePagination(quasarPagination.value)?.offset;

  emits('refresh', parsePagination(quasarPagination.value), isFullUpdate);
};

const updateIssuesList = () => {
  emits('refresh', parsePagination(quasarPagination.value), true);
};
watchEffect(() => {
  quasarPagination.value.rowsNumber = props.rowsCount;
});
</script>

<style lang="scss">
.my-sticky-column-table {
  thead tr:first-child th:first-child {
    background: $bg-surface;
    position: sticky;
    left: 0;
    z-index: 100;
  }

  td:first-child {
    background: $bg-surface;
    border-right: 2px solid $color-shadow;
    position: sticky;
    left: 0;
    z-index: 100;
  }
}
</style>
