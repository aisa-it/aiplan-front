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
    
    <transition name="fade" mode="out-in">
      <component
        :is="currentIssueList"
        :defaultIssues="initDefaultIssues"
        :defaultIssuesCount="initDefaultIssuesCount"
        :initGroupedIssues="initGroupedIssues"
        :initGroupBy="initGroupedIssuesGroupBy"
      />
    </transition>
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
import { computed, onMounted, ref } from 'vue';

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

const currentIssueList = computed(() => {
  let view: string;
  let component;

  view = issuesLoader.value === true ? 'skeleton' : 'list';
  switch (view) {
    case 'list': {
      component = isGroupingEnabled.value ? GroupedIssueList : DefaultIssueList;
      return component;
    }
    case 'skeleton': {
      component = isKanbanEnabled.value ? BoardListSkeleton : TableListSkeleton;
      return component;
    }
  }
  return component;
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

.fade-element {
  transition: all 0.3s ease-in-out;
}

.fade-element-enter-from,
.fade-element-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.fade-element-enter-to,
.fade-element-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
