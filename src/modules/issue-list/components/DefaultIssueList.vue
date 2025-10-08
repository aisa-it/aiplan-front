<template>
  <div v-show="!issuesLoader">
    <transition name="fade">
      <IssueTable
        v-show="rows?.length"
        key="table"
        :rows="rows"
        :rows-count="rowsCount"
        @refresh="(pagination) => load(pagination)"
      />
    </transition>

    <transition name="fade">
      <div
        v-show="!rows.length"
        style="
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: calc(100vh - 150px);
        "
      >
        <DocumentIcon :width="56" :height="56" />
        <h6>Нет задач</h6>
      </div>
    </transition>
  </div>
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

const defineIssuesFilters = computed(() => {
  return {
    workspaces: [workspaceInfo?.value?.id],
    projects: [project.value?.id],
  };
});

const defineIssuesPagination = computed(() => {
  return {
    only_count: false,
    show_sub_issue: projectProps.value?.showSubIssues ?? true,
    draft: projectProps.value?.draft ?? true,
    order_by: projectProps.value?.filters?.order_by,
    desc: projectProps.value?.filters?.orderDesc,
    offset: 0,
    limit: projectProps.value?.page_size,
  };
});

const load = async (pagination) => {
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
