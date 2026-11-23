<template>
  <div class="flex h-full min-h-0 min-w-0 flex-col">
    <div
      v-if="loadFailed"
      class="flex flex-wrap items-center justify-center gap-2 p-2"
      :class="{ 'flex-1 content-center': !visibleGroups.length }"
    >
      <span role="status">
        {{
          visibleGroups.length
            ? t('issues.groups.partialLoadError')
            : t('issues.groups.loadError')
        }}
      </span>
      <v-btn color="primary" variant="text" @click="emit('retry')">
        {{ t('issues.groups.retry') }}
      </v-btn>
    </div>
    <component
      :is="board ? IssueBoardSkeleton : IssueTableSkeleton"
      v-if="isStreaming && !visibleGroups.length"
    />
    <div
      v-else-if="!visibleGroups.length && !loadFailed"
      class="flex flex-1 flex-col items-center justify-center gap-2"
    >
      <DocumentIcon :width="56" :height="56" />
      <h6 class="text-xl">{{ t('issues.groups.empty') }}</h6>
    </div>
    <IssueBoard
      v-else-if="board && visibleGroups.length"
      :groups="visibleGroups"
      :rows-per-page="boardPageSize"
      :color-labels="groupBy === 'labels'"
      :property-templates="propertyTemplates"
      @toggle="toggleGroup"
      @page="(group, page) => emit('page', group, page)"
      @manage-sprints="sprintIssue = $event"
    />
    <GroupedIssueTables
      v-else-if="visibleGroups.length"
      :groups="visibleGroups"
      :estimate-body-height="estimateBodyHeight"
      @toggle="toggleGroup"
    >
      <template #default="{ group }">
        <div
          :class="{ 'border-s-4': groupBy === 'labels' }"
          :style="{ borderColor: group.color ?? 'transparent' }"
        >
          <IssueTable
            :group="group"
            :column-resize="columnResize"
            :hide-parent="hideParent"
            :property-templates="propertyTemplates"
            :initial-scroll-left="scrollPositions.get(group.key)"
            @horizontal-scroll="scrollPositions.set(group.key, $event)"
            @group-page="emit('page', group, $event)"
          />
        </div>
      </template>
    </GroupedIssueTables>
    <IssueBoardSprintDialog
      v-if="sprintIssue"
      v-model="sprintIssue"
      :workspace-slug="scope.workspaceSlug"
      @change="(before, after) => emit('sprints-changed', before, after)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, shallowRef, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  DtoIssueWithCount,
  DtoProjectPropertyTemplate,
  TypesViewProps,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import DocumentIcon from '@/components/icons/DocumentIcon.vue';
import type { useIssueColumnResize } from '../../composables/useIssueColumnResize';
import { useGroupLookupLabels } from '../../composables/useGroupLookupLabels';
import { useIssueGroupHeaders } from '../../composables/useIssueGroupHeaders';
import { getSavedBoardGroupKey } from '../../model/issue-groups';
import type {
  IssueGroup,
  IssueGroupBy,
  IssueGroupHeader,
} from '../../model/issue-groups';
import type { ProjectIssueListScope } from '../../model/issue-list.types';
import IssueTable from '../IssueTable.vue';
import IssueTableSkeleton from '../IssueTableSkeleton.vue';
import GroupedIssueTables from './GroupedIssueTables.vue';
import IssueBoardSkeleton from '../board/IssueBoardSkeleton.vue';

const IssueBoard = defineAsyncComponent({
  loader: () => import('../board/IssueBoard.vue'),
  loadingComponent: IssueBoardSkeleton,
  delay: 0,
});
const IssueBoardSprintDialog = defineAsyncComponent(
  () => import('../board/IssueBoardSprintDialog.vue'),
);

const props = defineProps<{
  scope: ProjectIssueListScope;
  groupBy: IssueGroupBy;
  groups: IssueGroup[];
  board: boolean;
  boardPageSize: number;
  isStreaming: boolean;
  loadFailed: boolean;
  viewSettings?: TypesViewProps;
  hideParent?: boolean;
  propertyTemplates?: DtoProjectPropertyTemplate[];
  columnResize: ReturnType<typeof useIssueColumnResize>;
}>();
const emit = defineEmits<{
  page: [group: IssueGroup, page: number];
  retry: [];
  change: [patch: TypesViewProps];
  'sprints-changed': [before: DtoIssueWithCount, after: DtoIssueWithCount];
}>();

const { t } = useI18n();
const sprintIssue = shallowRef<DtoIssueWithCount | null>(null);
const scrollPositions = new Map<string, number>();
const groupTemplate = computed(() =>
  props.propertyTemplates?.find(
    (template) => `property:${template.id}` === props.groupBy,
  ),
);
const lookupLabels = useGroupLookupLabels(
  props.scope,
  () => groupTemplate.value,
);
const visibleGroups = useIssueGroupHeaders(
  toRef(props, 'groups'),
  () => props.groupBy,
  () => props.viewSettings,
  () => groupTemplate.value,
  lookupLabels,
  () => props.board,
);

const estimateBodyHeight = (group: IssueGroup) => 104 + group.items.length * 56;
const toggleGroup = (group: IssueGroup & IssueGroupHeader) => {
  const key = props.board ? getSavedBoardGroupKey(group.entity) : group.key;
  emit('change', { group_tables_hide: { [key]: group.expanded } });
};
</script>
