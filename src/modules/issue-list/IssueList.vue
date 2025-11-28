<template>
  <q-card class="single-list relative" flat dense>
    <q-card-section
      class="row issue-list__header"
      :style="'padding: 12px 16px'"
    >
      <IssuesListTitle />
      <q-space />

      <FiltersList
        v-if="is.object(projectProps)"
        :projectId="route.params.project"
        :columns="allColumns"
        @update="load()"
      />
    </q-card-section>

    <q-card-section v-if="!issuesLoader && !isGroupingEnabled && pinnedIssues.length">
      <PinnedIssueList :pinned-issues="pinnedIssues" />
    </q-card-section>

    <transition name="fade" mode="out-in">
      <component :is="currentIssueList" />
    </transition>
  </q-card>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';
import { is } from 'quasar';
// stores
import { useProjectStore } from 'src/stores/project-store';

// components
import FiltersList from 'src/components/FiltersList.vue';
import IssuesListTitle from 'src/components/IssuesListTitle.vue';
import PinnedIssueList from './components/PinnedIssueList.vue';

// constants
import { allColumns } from './constants/tableColumns';
import {
  defineAsyncComponent,
  onMounted,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';

// composables
import { useLoadProjectInfo } from './composables/useLoadProjectInfo';
import { storeToRefs } from 'pinia';
import { useDefaultIssues } from './composables/useDefaultIssues';
import { useGroupedIssues } from './composables/useGroupedIssues';
import { useIssuesStore } from 'src/stores/issues-store';

const { getAllProjectInfo } = useLoadProjectInfo();
const { onRequest } = useDefaultIssues();
const { getGroupedIssues } = useGroupedIssues();

const {
  project,
  isGroupingEnabled,
  isKanbanEnabled,
  issuesLoader,
  projectProps,
} = storeToRefs(useProjectStore());

const { refreshIssues, pinnedIssues } = storeToRefs(useIssuesStore());
const { fetchPinnedIssues } = useIssuesStore();

const route = useRoute();

const load = async () => {
  issuesLoader.value = true;

  if (isGroupingEnabled.value === false) {
    await onRequest();
  } else if (isGroupingEnabled.value === true) {
    await getGroupedIssues();
  }
  issuesLoader.value = false;
};

onMounted(async () => {
  pinnedIssues.value = [];
  issuesLoader.value = true;
  await getAllProjectInfo();
  await load();
  fetchPinnedIssues(project.value.id);
});

watch(
  () => refreshIssues.value,
  async () => {
    if (refreshIssues.value === true) {
      await load();
      refreshIssues.value = false;
    }
  },
);
const components = {
  DefaultIssueList: defineAsyncComponent(
    () => import('./components/DefaultIssueList.vue'),
  ),
  GroupedIssueList: defineAsyncComponent(
    () => import('./components/GroupedIssueList.vue'),
  ),
  TableListSkeleton: defineAsyncComponent(
    () => import('./components/skeletons/TableListSkeleton.vue'),
  ),
  BoardListSkeleton: defineAsyncComponent(
    () => import('./components/skeletons/BoardListSkeleton.vue'),
  ),
};

const currentIssueList = shallowRef();

watchEffect(() => {
  if (issuesLoader.value === false) {
    currentIssueList.value = isGroupingEnabled.value
      ? components.GroupedIssueList
      : components.DefaultIssueList;
  } else {
    currentIssueList.value = isKanbanEnabled.value
      ? components.BoardListSkeleton
      : components.TableListSkeleton;
  }
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
  transition: all 0.2s ease-in-out;
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
