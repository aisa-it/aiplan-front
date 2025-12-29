<template>
  <q-card flat container class="q-pa-md row">
    <q-card-section class="col q-pa-none q-mr-md">
      <DefaultIssueList
        v-if="!isGroupingEnabled"
        :context-type="contextType"
        @refresh-issue="refresh"
        :class="{
          'sprint-margin-default': contextType === 'sprint',
          'project-margin-default': contextType === 'project',
        }"
      />
      <GroupedIssueList
        v-else
        :context-type="contextType"
        style="height: 100%"
        :class="{
          'sprint-margin-grouped': contextType === 'sprint',
          'project-margin-grouped': contextType === 'project',
        }"
      />
    </q-card-section>
    <q-card-section v-if="issues.length" class="col q-pa-none">
      <FrappeGantt :sprint="sprint" :issues="issues" :view-mode="'Day'" />
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
import { shallowRef, watch } from 'vue';

import FrappeGantt from './FrappeGantt.vue';
import { DtoIssue, DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import DefaultIssueList from '../DefaultIssueList.vue';
import GroupedIssueList from '../GroupedIssueList.vue';
import { useIssuesStore } from 'src/stores/issues-store';
import { useIssueContext } from '../../composables/useIssueContext';

const props = defineProps<{
  sprint?: DtoSprint;
  contextType: 'sprint' | 'project';
}>();

const issuesStore = useIssuesStore();

const issues = shallowRef<any>([]);

const { isGroupHide, contextProps, isGroupingEnabled } = useIssueContext(
  props.contextType,
);

const refresh = (newIssues: DtoIssue[]) => {
  issues.value = newIssues ?? [];
};

watch(
  () => [issuesStore.groupedIssueList, contextProps.value.group_tables_hide],
  () => {
    if (!issuesStore.groupedIssueList) return;
    let result = [] as DtoIssue[];
    issuesStore.groupedIssueList.map((el) => {
      if (isGroupHide(el.entity.id || el.entity)) {
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
</style>
