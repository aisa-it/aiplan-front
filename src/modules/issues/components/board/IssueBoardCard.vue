<template>
  <article class="issue-board-card flex min-w-0 flex-col gap-3 rounded-2xl border border-border p-3">
    <div class="flex items-start justify-between gap-2 text-xs">
      <SequenceIdColumn
        :identifier="issue.project_detail?.identifier"
        :sequence-id="issue.sequence_id"
      />
      <DateColumn :date="issue.created_at" />
    </div>

    <NameColumn v-if="hasColumn('name')" :issue="issue" />
    <ParentIssueChip v-else :issue="issue" class="self-start" />

    <div
      v-if="hasColumn('priority') || hasColumn('target_date')"
      class="grid min-w-0 grid-cols-2 items-center gap-3"
    >
      <PriorityColumn v-if="hasColumn('priority')" :issue="issue" />
      <TargetDateColumn
        v-if="hasColumn('target_date')"
        :issue="issue"
        compact
        class="min-w-0 [&>button]:max-w-full [&>button>span]:truncate"
      />
    </div>

    <div
      v-if="
        hasColumn('state') ||
        hasColumn('author') ||
        hasColumn('assignees') ||
        hasColumn('watchers')
      "
      class="grid min-w-0 grid-cols-2 items-center gap-3"
    >
      <StatusColumn v-if="hasColumn('state')" :issue="issue" />
      <div class="col-start-2 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
        <AuthorColumn v-if="hasColumn('author')" :user="issue.author_detail" />
        <AssigneesColumn
          v-if="hasColumn('assignees') && issue.assignee_details?.length"
          :users="issue.assignee_details"
          class="flex-wrap"
          role="group"
          :aria-label="t('issues.columns.assignees')"
        />
        <AssigneesColumn
          v-if="hasColumn('watchers') && issue.watcher_details?.length"
          :users="issue.watcher_details"
          class="flex-wrap"
          role="group"
          :aria-label="t('issues.columns.watchers')"
        />
      </div>
    </div>

    <button
      v-if="canEditField(issue, 'sprints')"
      type="button"
      class="flex min-h-8 max-w-full cursor-pointer items-center gap-1 self-start border-b border-border text-start hover:border-primary"
      :aria-label="t('issues.board.sprints.title')"
      @click="emit('manage-sprints')"
    >
      <SprintColumn :sprints="issue.sprints" />
      <v-icon icon="mdi-menu-down" size="18" />
    </button>
    <SprintColumn v-else :sprints="issue.sprints" />

    <div v-if="visibleProperties.length" class="flex min-w-0 flex-col gap-1 text-xs">
      <div
        v-for="property in visibleProperties"
        :key="property.id"
        class="grid min-w-0 grid-cols-[minmax(0,45%)_minmax(0,1fr)] gap-2"
      >
        <span class="truncate opacity-75" :title="property.name">
          {{ property.name }}
        </span>
        <PropertyColumn :issue="issue" :property="property" />
      </div>
    </div>

    <div class="flex flex-wrap">
      <QuantityChip
        v-for="column in ISSUE_COUNT_COLUMN_KEYS"
        :key="column"
        :column="column"
        :count="issue[column]"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  DtoIssueWithCount,
  DtoProjectPropertyTemplate,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useIssueListControllerContext } from '../../model/issue-list.context';
import type { IssueColumnKey } from '../../model/issue-list.types';
import { ISSUE_COUNT_COLUMN_KEYS } from '../../constants/issue-table-columns';
import AuthorColumn from '../issue-table/AuthorColumn.vue';
import AssigneesColumn from '../issue-table/AssigneesColumn.vue';
import DateColumn from '../issue-table/DateColumn.vue';
import NameColumn from '../issue-table/NameColumn.vue';
import PriorityColumn from '../issue-table/PriorityColumn.vue';
import PropertyColumn from '../issue-table/PropertyColumn.vue';
import SequenceIdColumn from '../issue-table/SequenceIdColumn.vue';
import SprintColumn from '../issue-table/SprintColumn.vue';
import StatusColumn from '../issue-table/StatusColumn.vue';
import TargetDateColumn from '../issue-table/TargetDateColumn.vue';
import ParentIssueChip from '../ParentIssueChip.vue';
import QuantityChip from '../QuantityChip.vue';

const props = defineProps<{
  issue: DtoIssueWithCount;
  propertyTemplates?: DtoProjectPropertyTemplate[];
}>();
const emit = defineEmits<{ 'manage-sprints': [] }>();
const { t } = useI18n();
const { columns, canEditField } = useIssueListControllerContext();
const hasColumn = (column: IssueColumnKey) => columns.includes(column);
const visibleProperties = computed(() =>
  props.propertyTemplates?.filter(({ id }) => id && hasColumn(`property:${id}`)) ?? [],
);
</script>

<style scoped>
.issue-board-card {
  min-height: 240px;
  border-inline-start-color: var(--issue-board-accent, rgb(var(--v-theme-border)));
  border-inline-start-width: var(--issue-board-accent-width, 1px);
}
</style>
