<template>
  <div>
    <transition name="fade">
      <q-markup-table
        v-show="loading"
        style="position: absolute; z-index: 1000; width: 100%; box-shadow: none"
      >
        <thead>
          <tr>
            <th class="text-left" style="width: 150px">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
            <th class="text-right">
              <q-skeleton animation="blink" type="text" />
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="n in 15" :key="n">
            <td class="text-left">
              <q-skeleton animation="blink" type="text" width="85px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="50px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="35px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="65px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="25px" />
            </td>
            <td class="text-right">
              <q-skeleton animation="blink" type="text" width="85px" />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </transition>

    <transition name="fade">
      <IssueTable
        key="table"
        :rows="rows"
        :rows-count="rowsCount"
        @refresh="(pagination) => onRequest(pagination)"
      />
    </transition>
  </div>
</template>

<script setup lang="ts">
// core
import { computed, onMounted, ref } from 'vue';
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

const issuesStore = useIssuesStore();
const { project, projectProps } = storeToRefs(useProjectStore());
const { workspaceInfo } = storeToRefs(useWorkspaceStore());
const route = useRoute();
const rows = ref([]);
const rowsCount = ref<number | null>(null);
const loading = ref(true);

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

const onRequest = async (
  pagination: IQuery,
  filters?: TypesIssuesListFilters,
) => {
  const { data } = await issuesStore.getIssueList(
    filters || defineIssuesFilters.value,
    pagination,
  );
  rows.value = data.issues;
  rowsCount.value = data.count || DEF_ROWS_PER_PAGE;
};

onMounted(async () => {
  loading.value = true;

  await onRequest(defineIssuesPagination.value, defineIssuesFilters.value);
  loading.value = false;
});
</script>
