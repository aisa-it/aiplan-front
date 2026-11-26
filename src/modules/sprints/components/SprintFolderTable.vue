<template>
  <v-data-table
    v-model:sort-by="sortBy"
    :headers="headers"
    :items="rows"
    :items-per-page="-1"
    hide-default-footer
    must-sort
    hover
    class="sprint-folder-table"
    :style="columnWidths"
    @click:row="openRow"
    @contextmenu:row="openContextMenu"
  >
    <template
      v-for="key in resizableColumns"
      :key="key"
      #[`header.${key}`]="{ column, getSortIcon }"
    >
      <div class="v-data-table-header__content min-w-0">
        <span>{{ column.title }}</span>
        <v-icon class="v-data-table-header__sort-icon" :icon="getSortIcon(column)" />
      </div>
      <IssueColumnResizer
        @start="columnResize.startResize($event, key)"
        @reset="columnResize.resetWidth(key)"
      />
    </template>
    <template #item.name="{ item }">
      <RouterLink
        :to="sprintLocation(item.id)"
        :title="item.name"
        target="_blank"
        rel="noopener"
        class="block truncate no-underline"
        @click.stop
      >
        {{ item.name }}
      </RouterLink>
    </template>
    <template #item.start_date="{ value }">{{ formatDate(value) }}</template>
    <template #item.end_date="{ value }">{{ formatDate(value) }}</template>
    <template #item.progress="{ item }">
      <SprintProgress :stats="item.stats" />
    </template>
  </v-data-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { SortItem } from 'vuetify/lib/components/VDataTable/composables/sort.js';
import type { DataTableHeader } from 'vuetify/lib/components/VDataTable/types.js';
import type { useIssueColumnResize } from '@/modules/issues/composables/useIssueColumnResize';
import IssueColumnResizer from '@/modules/issues/components/issue-table/IssueColumnResizer.vue';
import { getSprintProgress } from '../model/sprint-progress';
import SprintProgress from './SprintProgress.vue';

type SprintRow = DtoSprintLight & { id: string; progress: number; total: number };
const props = defineProps<{
  sprints: DtoSprintLight[];
  workspaceSlug: string;
  columnResize: ReturnType<typeof useIssueColumnResize>;
}>();
const sortBy = defineModel<SortItem[]>('sortBy', { default: () => [] });
const emit = defineEmits<{ menu: [event: MouseEvent, sprint: SprintRow] }>();
const router = useRouter();
const { t } = useI18n();
const resizableColumns = ['name', 'progress'] as const;

const rows = computed(() => props.sprints.flatMap((sprint): SprintRow[] => {
  if (!sprint.id) return [];
  const { percent, total } = getSprintProgress(sprint.stats);
  return [{ ...sprint, id: sprint.id, progress: percent, total }];
}));
const headers = computed<DataTableHeader<SprintRow>[]>(() => [
  {
    key: 'name',
    title: t('sprints.overview.columns.name'),
    sortable: true,
    fixed: true,
    width: 'var(--sprint-name-width)',
    headerProps: { class: 'sprint-resizable-header' },
    cellProps: { class: 'sprint-name-cell' },
  },
  { key: 'start_date', title: t('sprints.overview.columns.startDate'), width: 160, sortable: true },
  { key: 'end_date', title: t('sprints.overview.columns.endDate'), width: 160, sortable: true },
  {
    key: 'progress',
    title: t('sprints.overview.columns.progress'),
    width: 'var(--sprint-progress-width)',
    align: 'center',
    sortable: true,
    headerProps: { class: 'sprint-resizable-header' },
  },
  { key: 'total', title: t('sprints.overview.columns.total'), width: 120, align: 'center', sortable: true },
]);
const columnWidths = computed(() => {
  const name = props.columnResize.widthFor('name');
  const progress = props.columnResize.widthFor('progress');
  return {
    '--sprint-name-width': name === undefined ? undefined : `${name}px`,
    '--sprint-progress-width': progress === undefined ? undefined : `${progress}px`,
  };
});

function sprintLocation(sprintId: string) {
  return { name: 'sprint', params: { workspace: props.workspaceSlug, sprint: sprintId } };
}

function openRow(_event: MouseEvent, { item }: { item: SprintRow }) {
  window.open(router.resolve(sprintLocation(item.id)).href, '_blank', 'noopener');
}

function openContextMenu(event: MouseEvent, { item }: { item: SprintRow }) {
  event.preventDefault();
  emit('menu', event, item);
}

function formatDate(value: unknown) {
  const match = typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[3]}.${match[2]}.${match[1]}` : '';
}
</script>

<style scoped>
.sprint-folder-table {
  --sprint-name-width: 300px;
  --sprint-progress-width: 235px;
  --v-table-row-height: 48px;
  --v-table-header-height: 48px;
  background-color: rgb(var(--v-theme-background));
}

@media (min-width: 1921px) {
  .sprint-folder-table { --sprint-name-width: 400px; }
}

@media (max-width: 1200px) {
  .sprint-folder-table { --sprint-name-width: 250px; }
}

@media (max-width: 600px) {
  .sprint-folder-table { --sprint-name-width: 200px; }
}

.sprint-folder-table :deep(table) {
  min-width: calc(var(--sprint-name-width) + var(--sprint-progress-width) + 440px);
  table-layout: fixed;
}

.sprint-folder-table :deep(.v-data-table-column--fixed) {
  background-color: rgb(var(--v-theme-background));
}

.sprint-folder-table :deep(.sprint-name-cell) {
  border-inline-end: 1px solid rgb(var(--v-theme-border));
}

.sprint-folder-table :deep(.sprint-resizable-header) {
  position: relative;
}

.sprint-folder-table :deep(.sprint-resizable-header.v-data-table-column--fixed) {
  position: sticky;
}

.sprint-folder-table :deep(tbody tr) {
  cursor: pointer;
}
</style>
