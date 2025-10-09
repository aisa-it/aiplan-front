<template>
  <IssueTable
    :rows="rows"
    :rows-count="rowsCount"
    :loading="loadingTable"
    @refresh="(pagination) => load(pagination)"
  />
</template>

<script setup lang="ts">
// core
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
// stores
import { useProjectStore } from 'src/stores/project-store';

// constants
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

// types

// components
import IssueTable from './IssueTable.vue';
import { useDefaultIssues } from '../composables/useDefaultIssues';

const { projectProps, issuesLoader } = storeToRefs(useProjectStore());

const route = useRoute();
const rows = ref([]);
const table = ref();
const rowsCount = ref<number | null>(null);

const { onRequest } = useDefaultIssues();

const props = defineProps([
  'projectInfoLoading',
  'defaultIssues',
  'defaultIssuesCount',
]);
const loadingTable = ref(false);
const load = async (pagination) => {
  loadingTable.value = true;
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
  table.value = response.data;
  rows.value = response.data.issues;
  rowsCount.value = response.data.count || DEF_ROWS_PER_PAGE;
  loadingTable.value = false;
};

watch(
  () => props.defaultIssues,
  () => {
    rows.value = props.defaultIssues;
  },
  { immediate: true },
);
watch(
  () => props.defaultIssuesCount,
  () => {
    rowsCount.value = props.defaultIssuesCount;
  },
  { immediate: true },
);
</script>
