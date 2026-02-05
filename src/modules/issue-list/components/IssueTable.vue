<template>
  <q-table
    v-model:pagination="quasarPagination"
    binary-state-sort
    class="my-sticky-column-table table-bottom-reverse"
    row-key="sequence_id"
    flat
    :loading="loadingTable"
    :rows="rows"
    :columns="columns"
    @row-contextmenu.prevent="(ev, row) => (selectedRow = row)"
    @row-click="(_, row) => handleClick(row)"
    @request="(e) => getIssues(e.pagination)"
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th
          v-for="col in columns"
          :key="col.name"
          :props="props"
          :class="`${col.name.includes('count') ? 'count-column': ''}`"
          >
          {{ col.label }}
        </q-th>
      </q-tr>
    </template>

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
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-name="props">
      <NameColumn
        :row-info="props"
        @open-preview="
          (issue) =>
            emits('openPreview', issue, parsePagination(quasarPagination))
        "
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-priority="props">
      <PriorityColumn
        :row-info="props"
        @refresh="updateIssueField('priority', props.row, entity)"
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-state="props">
      <StatusColumn
        :row-info="props"
        @refresh="
          (status) => {
            props.row.state_detail = status;
            updateIssueField('state', props.row, entity, status);
          }
        "
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-target_date="props">
      <TargetDateColumn
        :row-info="props"
        @refresh="updateIssueField('targetDate', props.row, entity)"
      />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-created_at="props">
      <CreatedAtColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-updated_at="props">
      <UpdatedAtColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-author="props">
      <AuthorColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-assignees="props">
      <AssigneesColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-labels="props">
      <LabelsColumn :row-info="props" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-sprint="props">
      <SprintColumn :row-info="props" @refresh="updateIssueField('sprint', props.row, entity)"/>
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-sub_issues_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'sub-issues'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-linked_issues_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'linked_issues_count'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-link_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'links'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>

    <template v-slot:body-cell-attachment_count="props">
      <ChipCountColumn :row-info="props" :chip-name="'attachments'" />
      <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refreshTable" />
    </template>
  </q-table>
</template>

<script lang="ts" setup>
import { inject, ref, watch, watchEffect, computed } from 'vue';
import { EventBus } from 'quasar';
import { storeToRefs } from 'pinia';

import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';

import PaginationDefault from 'src/components/pagination/PaginationDefault.vue';
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
  SprintColumn,
} from './issue-table';

import { useIssueContext } from '../composables/useIssueContext';
import { useGroupedIssues } from '../composables/useGroupedIssues';

import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

interface QuasarPagination {
  page: number;
  rowsNumber: number;
  sortBy: string;
  descending: boolean;
  rowsPerPage: number;
}

const emits = defineEmits([
  'refresh',
  'updateIssueField',
  'openPreview',
  'openIssue',
  'updateGroupedIssues',
]);
const props = defineProps([
  'entity',
  'rows',
  'rowsCount',
  'loading',
  'columns',
  'contextType',
]);

const { fetchPinnedIssues } = useIssuesStore();
const { project } = storeToRefs(useProjectStore());

const {
  contextProps,
  isGroupingEnabled,
  getTableColumns,
  store: contextStore,
} = useIssueContext(props.contextType);

const { updateCurrentTable } = useGroupedIssues(props.contextType);

const columns = computed(() => {
  return props.columns ?? getTableColumns;
});

const bus = inject('bus') as EventBus;

const selectedRow = ref();
const loadingTable = ref(false);
const quasarPagination = ref<QuasarPagination>({
  page: 1,
  rowsNumber: props.rowsCount,
  sortBy: contextProps.value?.filters?.order_by ?? 'sequence_id',
  descending: contextProps.value?.filters?.orderDesc,
  rowsPerPage: contextProps.value?.page_size ?? DEF_ROWS_PER_PAGE,
});

// преобразуем quasar пагинацию в пагинацию бека
function parsePagination(pagination: QuasarPagination) {
  return {
    only_count: false,
    only_active: contextProps.value?.showOnlyActive,
    hide_sub_issues: contextProps.value.hideSubIssues ?? false,
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

const clickCount = ref(0);
let clickTimeout: NodeJS.Timeout;

const handleClick = (row) => {
  clickCount.value++;

  if (clickCount.value === 1) {
    clickTimeout = setTimeout(() => {
      clickCount.value = 0;
      emits('openPreview', row, parsePagination(quasarPagination.value));
    }, 250);
  } else if (clickCount.value === 2) {
    // Обработка двойного клика
    clickCount.value = 0;
    clearTimeout(clickTimeout);
    emits('openIssue', row.sequence_id, row);
  }
};

const refreshTable = (isFullRefresh?: boolean) => {
  emits('refresh', parsePagination(quasarPagination.value), isFullRefresh);
}

const getIssues = async (p: any, action = 'sorting') => {
  let isFullUpdate = action !== 'selectedPage' ? true : false;

  quasarPagination.value = await Object.assign(quasarPagination.value, p);

  if (isFullUpdate === false) loadingTable.value = true;

  refreshTable(isFullUpdate);
};

bus.on('updateIssueTable', (field, entityId) => {
  if (props.entity?.id && entityId === props.entity?.id) {
    loadingTable.value = true;
    refreshTable(false);
  }
});

const updateIssueField = (
  action?: string,
  row?: any,
  entity?: any,
  status?: any,
) => {
  if (props.contextType === 'project' && project.value.id)
    fetchPinnedIssues(project.value.id);

  if (isGroupingEnabled.value === true) {
    emits('updateGroupedIssues', status);
    updateCurrentTable(action, row, entity);
  } else refreshTable()
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
  th.count-column {
    min-width: 95px;
    max-width: 95px;
    padding-right: 0;
  }

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
