<template>
  <q-card flat container class="q-pa-md row">
    <q-splitter
      v-model="splitterModel"
      unit="%"
      :limits="[0, 100]"
      class="full-width"
    >
      <template v-slot:before>
        <q-card-section
          class="q-pa-none"
          :style="`height: calc(100% - ${shiftHeight}px)`"
        >
          <DefaultIssueList
            v-if="!isGroupingEnabled"
            :context-type="contextType"
            @open-issue-preview="handleOpenPreview"
            @refresh-issue="refresh"
            style="width: 100%"
            :class="{
              'sprint-margin-default': contextType === 'sprint',
              'project-margin-default': contextType === 'project',
            }"
          />
          <GroupedIssueList
            v-else
            :context-type="contextType"
            @open-issue-preview="handleOpenPreview"
            style="height: 100%"
            :class="{
              'sprint-margin-grouped': contextType === 'sprint',
              'project-margin-grouped': contextType === 'project',
            }"
          />
        </q-card-section>
      </template>
      <template v-slot:after>
        <q-card-section v-if="issues.length" class="col q-pa-none">
          <FrappeGantt :sprint="sprint" :issues="issues" :view-mode="'Day'" />
        </q-card-section>
      </template>
    </q-splitter>
  </q-card>
</template>
<script setup lang="ts">
import { shallowRef, watch, ref, computed } from 'vue';

import FrappeGantt from './FrappeGantt.vue';
import { DtoIssue, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import DefaultIssueList from '../DefaultIssueList.vue';
import GroupedIssueList from '../GroupedIssueList.vue';
import { useIssuesStore } from 'src/stores/issues-store';
import { useIssueContext } from '../../composables/useIssueContext';
import { QuasarPagination } from '../../composables/useGroupedIssues';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  sprint?: DtoSprint;
  contextType: 'sprint' | 'project';
}>();

const emits = defineEmits<{
  openIssuePreview: [issue: DtoIssue, pagination: QuasarPagination, entity: any];
  refreshIssue: [issues: DtoIssue[]];
}>();

const issuesStore = useIssuesStore();
const { isPreview } = storeToRefs(useSingleIssueStore());

const issues = shallowRef<DtoIssue[]>([]);

const { isGroupHide, contextProps, isGroupingEnabled } = useIssueContext(
  props.contextType,
);

const refresh = (newIssues: DtoIssue[]) => {
  issues.value = newIssues ?? [];
};

const splitterModel = ref(50);

const shiftHeight = computed(() => {
  if (isGroupingEnabled.value) {
    return props.contextType === 'sprint' ? 42 : -10;
  }
});

let oldSplitter = 50;

const handleOpenPreview = (issue: DtoIssue, pagination?: QuasarPagination, entity?: any) => {
  emits('openIssuePreview', issue, pagination, entity);
};

watch(
  () => isPreview.value,
  () => {
    if (isPreview.value) {
      oldSplitter = splitterModel.value;
      splitterModel.value = 100;
    } else {
      splitterModel.value = oldSplitter;
    }
  },
);

watch(
  () => [issuesStore.groupedIssueList, contextProps.value.group_tables_hide],
  () => {
    if (!issuesStore.groupedIssueList) return;
    let result = [] as DtoIssue[];
    issuesStore.groupedIssueList.map((el) => {
      if (isGroupHide(el?.entity?.id || el?.entity)) {
        result = [...result, { id: null }];
        return;
      }
      if (!el.issues) return;
      result = [
        ...result,
        ...el.issues,
        { id: null },
        { id: null },
        { id: null },
      ];
    });
    issues.value = result;
  },
  { immediate: true },
);
</script>
<style lang="scss" scoped>
.sprint-margin-default {
  margin-top: 91px;
}

.project-margin-default {
  margin-top: 37px;
}

.sprint-margin-grouped {
  margin-top: 42px;
}

.project-margin-grouped {
  margin-top: -10px;
}

:deep(.q-expansion-item__container) {
  margin-bottom: 5px;
}

.sprint-margin-grouped :deep(.q-expansion-item__container) {
  margin-bottom: 15px;
}

:deep(.groupped-table) {
  height: 100%;
}

:deep(.gantt-margin) {
  margin-bottom: 14.17px;
}
</style>
