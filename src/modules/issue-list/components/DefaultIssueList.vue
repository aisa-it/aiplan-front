<template>
  <IssueTable
    :rows="rows"
    :rows-count="rowsCount"
    @refresh="(pagination) => load(pagination)"
  />
</template>

<script setup lang="ts">
// core
import { computed, onMounted, ref, watch, watchEffect } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { IQuery, useIssuesStore } from 'src/stores/issues-store';

// constants
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

// types
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// components
import IssueTable from './IssueTable.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import { useDefaultIssues } from '../composables/useDefaultIssues';

const issuesStore = useIssuesStore();
const { project, projectProps, issuesLoader } = storeToRefs(useProjectStore());
const { workspaceInfo } = storeToRefs(useWorkspaceStore());
const route = useRoute();
const rows = ref([]);
const rowsCount = ref<number | null>(null);
const loading = ref(true);
const { onRequest } = useDefaultIssues();

const props = defineProps([
  'projectInfoLoading',
  'defaultIssues',
  'defaultIssuesCount',
]);

const load = async (pagination) => {
  let props = JSON.parse(JSON.stringify(projectProps.value));
  props.page_size = pagination.limit;
  props.filters.order_by = pagination.order_by;
  props.filters.orderDesc = pagination.desc;

  await useProjectStore().setProjectProps(
    route.params.workspace as string,
    route.params.project as string,
    props,
  );

  await useProjectStore().getMeInProject(
    route.params.workspace as string,
    route.params.project as string,
  );

  const response = await onRequest(pagination);
  rows.value = response.data.issues;
  rowsCount.value = response.data.count || DEF_ROWS_PER_PAGE;
};

watch(
  () => props.defaultIssues,
  () => {
    rows.value = props.defaultIssues;
  },
);
watch(
  () => props.defaultIssuesCount,
  () => {
    rowsCount.value = props.defaultIssuesCount;
  },
);
</script>
