<template>
  <q-card class="single-list relative" flat dense>
    <q-card-section
      class="row issue-list__header"
      :style="'padding: 12px 16px'"
    >
      <IssuesListTitle />
      <q-space />

      <FiltersList
        :projectId="route.params.project"
        :columns="allColumns"
        @update="load()"
      />
    </q-card-section>
    <q-separator />

    <div v-show="issuesLoader === false">
      <DefaultIssueList
        v-if="!isGroupingEnabled"
        :defaultIssues="initDefaultIssues"
        :defaultIssuesCount="initDefaultIssuesCount"
      />

      <GroupedIssueList
        v-if="isGroupingEnabled"
        :initGroupedIssues="initGroupedIssues"
        :initGroupBy="initGroupedIssuesGroupBy"
      />
    </div>

    <div v-show="issuesLoader === true">
      <TableListSkeleton v-if="!isKanbanEnabled" />
      <BoardListSkeleton v-if="isKanbanEnabled" />
    </div>
  </q-card>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';

// stores
import { useProjectStore } from 'src/stores/project-store';

// components
import FiltersList from 'src/components/FiltersList.vue';
import IssuesListTitle from 'src/components/IssuesListTitle.vue';

// constants
import { allColumns } from './constants/tableColumns';
import { onMounted, ref } from 'vue';

// composables
import { useLoadProjectInfo } from './composables/useLoadProjectInfo';
import { storeToRefs } from 'pinia';
import DefaultIssueList from './components/DefaultIssueList.vue';
import GroupedIssueList from './components/GroupedIssueList.vue';
import TableListSkeleton from './components/skeletons/TableListSkeleton.vue';
import BoardListSkeleton from './components/skeletons/BoardListSkeleton.vue';
import { useDefaultIssues } from './composables/useDefaultIssues';
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';
import { useGroupedIssues } from './composables/useGroupedIssues';

const { getAllProjectInfo } = useLoadProjectInfo();
const { onRequest } = useDefaultIssues();
const { getGroupedIssues } = useGroupedIssues();

const { isGroupingEnabled, isKanbanEnabled, issuesLoader } =
  storeToRefs(useProjectStore());
const route = useRoute();

const initDefaultIssues = ref([]);
const initDefaultIssuesCount = ref(null);

const initGroupedIssues = ref([]);
const initGroupedIssuesGroupBy = ref('');

const load = async () => {
  issuesLoader.value = true;

  if (isGroupingEnabled.value === false) {
    const response = await onRequest();
    initDefaultIssues.value = response.data.issues;
    initDefaultIssuesCount.value = response.data.count || DEF_ROWS_PER_PAGE;
  } else if (isGroupingEnabled.value === true) {
    const response = await getGroupedIssues();
    initGroupedIssues.value = response?.data.issues;
    initGroupedIssuesGroupBy.value = response?.data.group_by;
  }
  issuesLoader.value = false;
};

onMounted(async () => {
  issuesLoader.value = true;
  await getAllProjectInfo();
  await load();
});
</script>

<style>
/* Анимация появления и исчезновения */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
