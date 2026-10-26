<template>
  <div
    class="issue-table-columns issue-table-wrapper flex h-full min-w-0 flex-col"
  >
    <div
      ref="tableRoot"
      class="issue-table-vertical-scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto"
    >
      <IssueTableSkeleton
        v-if="showSkeleton"
        :columns="tableColumns"
        :row-count="Math.min(query.rowsPerPage, 15)"
      />
      <v-data-table-server
        v-show="!showSkeleton"
        :headers="tableColumns"
        :items="items"
        :items-length="total"
        :items-per-page="query.rowsPerPage"
        :page="query.page"
        :sort-by="sortBy"
        :loading="isLoading"
        item-value="id"
        no-data-text="Нет задач"
        must-sort
        hover
        hide-default-footer
        class="issue-table"
        @update:sort-by="handleSort"
      >
        <template #no-data>
          <div
            class="flex h-[calc(100dvh-var(--v-layout-top)-220px)] min-h-40 flex-col items-center justify-center gap-2"
          >
            <DocumentIcon :width="56" :height="56" />
            <h6 class="text-xl">Нет задач</h6>
          </div>
        </template>
        <template #item.sequence_id="{ item }">
          <SequenceIdColumn
            :identifier="item.project_detail?.identifier"
            :sequence-id="item.sequence_id"
          />
        </template>
        <template #item.name="{ item }">
          <NameColumn :issue="item" :hide-parent="hideParent" />
        </template>
        <template #item.priority="{ item }">
          <PriorityColumn :issue="item" />
        </template>
        <template #item.state="{ item }">
          <StatusColumn :issue="item" />
        </template>
        <template #item.target_date="{ item }">
          <TargetDateColumn :issue="item" />
        </template>
        <template #item.created_at="{ item }">
          <DateColumn :date="item.created_at" />
        </template>
        <template #item.updated_at="{ item }">
          <DateColumn :date="item.updated_at" />
        </template>
        <template #item.author="{ item }">
          <AuthorColumn :user="item.author_detail" />
        </template>
        <template #item.assignees="{ item }">
          <AssigneesColumn :users="item.assignee_details" />
        </template>
        <template #item.labels="{ item }">
          <LabelsColumn :labels="item.label_details" />
        </template>
        <template #item.sprint="{ item }">
          <SprintColumn :sprints="item.sprints" />
        </template>
        <template
          v-for="column in countColumns"
          :key="column"
          #[`item.${column}`]="{ item }"
        >
          <ChipCountColumn :column="column" :count="item[column]" />
        </template>
      </v-data-table-server>
    </div>

    <div class="z-10 shrink-0 bg-[rgb(var(--v-theme-background))]">
      <div
        ref="scrollbar"
        class="issue-table-scrollbar overflow-x-auto overflow-y-hidden"
        @scroll="syncViewport"
      >
        <div :style="{ width: `${contentWidth}px`, height: '1px' }" />
      </div>

      <PaginationDefault
        :selected-page="query.page"
        :rows-per-page="query.rowsPerPage"
        :rows-per-page-options="[10, 25, 50]"
        :rows-number="total"
        show-rows-per-page
        @request="handlePaginationRequest"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import PaginationDefault from '@/components/pagination/PaginationDefault.vue';
import DocumentIcon from '@/components/icons/DocumentIcon.vue';

import {
  ISSUE_COUNT_COLUMN_KEYS,
  ISSUE_TABLE_COLUMNS,
} from '../constants/issue-table-columns';
import { useSyncedHorizontalScroll } from '../composables/useSyncedHorizontalScroll';
import { useIssueListControllerContext } from '../model/issue-list.context';
import '../styles/issue-table-columns.css';
import SequenceIdColumn from './issue-table/SequenceIdColumn.vue';
import NameColumn from './issue-table/NameColumn.vue';
import PriorityColumn from './issue-table/PriorityColumn.vue';
import StatusColumn from './issue-table/StatusColumn.vue';
import TargetDateColumn from './issue-table/TargetDateColumn.vue';
import DateColumn from './issue-table/DateColumn.vue';
import AuthorColumn from './issue-table/AuthorColumn.vue';
import AssigneesColumn from './issue-table/AssigneesColumn.vue';
import LabelsColumn from './issue-table/LabelsColumn.vue';
import SprintColumn from './issue-table/SprintColumn.vue';
import ChipCountColumn from './issue-table/ChipCountColumn.vue';
import IssueTableSkeleton from './IssueTableSkeleton.vue';

defineProps<{ hideParent?: boolean }>();

const countColumns = ISSUE_COUNT_COLUMN_KEYS;

const {
  items,
  total,
  isLoading,
  query,
  columns,
  setPage,
  setRowsPerPage,
  setSort,
} = useIssueListControllerContext();

const showSkeleton = computed(() => isLoading.value && !items.value.length);

const tableColumns = computed(() =>
  columns.map((column) => ISSUE_TABLE_COLUMNS[column]),
);
const sortBy = computed(() => [
  {
    key: query.sortBy,
    order: query.descending ? ('desc' as const) : ('asc' as const),
  },
]);

const tableRoot = ref<HTMLElement | null>(null);
const scrollbar = ref<HTMLElement | null>(null);
const { contentWidth, syncViewport } = useSyncedHorizontalScroll(
  tableRoot,
  scrollbar,
);

const handleSort = (
  value: readonly { key: string; order?: boolean | 'asc' | 'desc' }[],
) => {
  const sort = value[0];
  if (!sort || !columns.includes(sort.key as (typeof columns)[number])) return;

  setSort(sort.key as (typeof columns)[number], sort.order === 'desc');
};

const handlePaginationRequest = (options: {
  page: number;
  rowsPerPage?: number;
}) => {
  if (options.rowsPerPage !== undefined) {
    setRowsPerPage(options.rowsPerPage);
    return;
  }

  setPage(options.page);
};
</script>

<style scoped>
.issue-table-wrapper {
  position: relative;
}

:deep(.issue-table .v-table__wrapper) {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

:deep(.issue-table .v-table__wrapper::-webkit-scrollbar) {
  display: none;
}

:deep(.issue-table table) {
  table-layout: fixed;
}

:deep(.issue-table.v-table),
:deep(.issue-table .v-table__wrapper),
:deep(.issue-table table),
:deep(.issue-table .v-data-table-column--fixed),
:deep(.issue-table thead th) {
  background-color: rgb(var(--v-theme-background));
}

:deep(.issue-table.v-table) {
  color: rgb(var(--v-theme-text));
}

:deep(.issue-table .v-data-table__td) {
  height: 56px;
  max-width: 0;
}

:deep(.issue-table .v-data-table__th) {
  height: 48px;
  font-size: 12px;
  white-space: nowrap;
}

:deep(.issue-table .issue-count-header) {
  padding-inline: 4px;
}

:deep(.issue-table .v-data-table-rows-loading td) {
  height: 160px;
}

:deep(.issue-table .v-data-table-column--last-fixed) {
  border-right: 2px solid rgba(var(--v-theme-on-background), 0.12) !important;
}

.issue-table-scrollbar {
  height: 8px;
  opacity: 0;
  scrollbar-color: rgba(var(--v-theme-on-background), 0.5) transparent;
  scrollbar-width: thin;
  transition: opacity 150ms;
}

.issue-table-scrollbar::-webkit-scrollbar {
  height: 8px;
}

.issue-table-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.issue-table-scrollbar::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background: rgba(var(--v-theme-on-background), 0.5);
}

.issue-table-wrapper:hover .issue-table-scrollbar {
  opacity: 1;
}

@media (pointer: coarse) {
  .issue-table-scrollbar {
    display: none;
  }
}
</style>
