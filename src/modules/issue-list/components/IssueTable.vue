<template>
  <q-table
    v-model:pagination="quasarPagination"
    binary-state-sort
    class="my-sticky-column-table table-bottom-reverse"
    row-key="sequence_id"
    flat
    :loading="loadingTable"
    :rows="rows"
    :columns="projectStore.getTableColumns"
    @row-contextmenu.prevent="(ev, row) => (selectedRow = row)"
    @row-click="
      (_, row) =>
        emits('openPreview', row.sequence_id, parsePagination(quasarPagination))
    "
    @request="(e) => getIssues(e.pagination)"
  >
    <template #bottom>
      <PaginationDefault
        v-model:selected-page="quasarPagination.page"
        :rows-per-page="quasarPagination.rowsPerPage"
        :rows-per-page-options="[10, 25, 50]"
        :rows-number="quasarPagination.rowsNumber"
        show-rows-per-page
        @request="(pagination, action) => getIssues(pagination, action)"
      />
    </template>

    <template v-slot:body-cell-sequence_id="props">
      <SequenceIdColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-name="props">
      <NameColumn
        :row-info="props"
        @open-preview="
          emits(
            'openPreview',
            props.row.sequence_id,
            parsePagination(quasarPagination),
          )
        "
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-priority="props">
      <PriorityColumn
        :row-info="props"
        @refresh="updateIssueField('priority', props.row, entity)"
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-state="props">
      <StatusColumn
        :row-info="props"
        @refresh="
          (status) => {
            props.row.state_detail = status;
            updateIssueField('state', props.row, entity);
          }
        "
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" />
    </template>

    <template v-slot:body-cell-target_date="props">
      <TargetDateColumn
        :row-info="props"
        @refresh="updateIssueField('targetDate', props.row, entity)"
      />
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
import { inject, ref, watch, watchEffect } from 'vue';

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
import { useGroupedIssues } from '../composables/useGroupedIssues';
import { EventBus } from 'quasar';

const projectStore = useProjectStore();

const { projectProps, isGroupingEnabled } = storeToRefs(projectStore);

interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}
const { updateCurrentTable } = useGroupedIssues();

const emits = defineEmits(['refresh', 'updateIssueField', 'openPreview']);
const props = defineProps(['entity', 'rows', 'rowsCount', 'loading']);

const bus = inject('bus') as EventBus;

const selectedRow = ref();
const loadingTable = ref(false);
const quasarPagination = ref<QuasarPagination>({
  page: 1,
  rowsNumber: props.rowsCount,
  sortBy: projectProps.value?.filters?.order_by ?? 'sequence_id',
  descending: projectProps.value?.filters?.orderDesc,
  rowsPerPage: projectProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
});

// преобразуем quasar пагинацию в пагинацию бека
function parsePagination(pagination: QuasarPagination) {
  return {
    only_count: false,
    show_sub_issues: projectProps.value.showSubIssues ?? true,
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

const getIssues = async (p: any, action = 'sorting') => {
  let isFullUpdate = action !== 'selectedPage' ? true : false;

  quasarPagination.value = await Object.assign(quasarPagination.value, p);

  if (isFullUpdate === false) loadingTable.value = true;

  emits('refresh', parsePagination(quasarPagination.value), isFullUpdate);
};

bus.on('updateIssueTable', (field, entityId) => {
  if (props.entity?.id && entityId === props.entity?.id) {
    loadingTable.value = true;
    emits('refresh', parsePagination(quasarPagination.value), false);
  }
});

const updateIssueField = (action?: string, row?: any, entity?: any) => {
  if (isGroupingEnabled.value === true) {
    updateCurrentTable(action, row, entity);
  } else emits('refresh', parsePagination(quasarPagination.value));
};
watchEffect(() => {
  quasarPagination.value.rowsNumber = props.rowsCount;
});

watch(
  () => props.rows,
  () => {
    loadingTable.value = false;
  },
);
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

  .q-linear-progress {
    position: absolute !important;
    width: 100% !important;
    overflow: hidden !important;
    font-size: 4px !important;
    height: 1px !important;
    color: var(--q-primary) !important;
    transform: scale3d(1, 1, 1) !important;
    border: 0px;
    z-index: 101;
    background-color: $color-shadow !important;
  }
}
</style>
