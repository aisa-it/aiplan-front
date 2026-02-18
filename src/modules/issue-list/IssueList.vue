<template>
  <q-card class="single-list relative" flat dense>
    <q-card-section
      class="row issue-list__header"
      :style="'padding: 12px 16px'"
    >
      <IssuesListTitle />
      <q-space />

      <ProjectFiltersList
        v-if="is.object(projectProps)"
        :columns="projectStore.sortAllColumns"
        @update="load()"
      />
    </q-card-section>

    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="general" label="Основные" />
      <q-tab
        v-if="pinnedIssues.length"
        name="pinned"
        label="Закрепленные задачи"
      />
    </q-tabs>

    <q-tab-panels v-model="tab">
      <q-tab-panel name="general" style="height: 90vh">
        <transition name="fade" mode="out-in" @after-enter="onIssueTableReady">
          <component
            :is="currentIssueList"
            contextType="project"
            data-tour="issue-table"
            class="q-pt-sm"
          />
        </transition>
      </q-tab-panel>

      <q-tab-panel name="pinned" v-if="pinnedIssues.length">
        <q-card-section>
          <PinnedIssueList :pinned-issues="pinnedIssues" />
        </q-card-section>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
  <GuidedTour
    v-if="
      !issuesLoader &&
      tableReader &&
      user?.tutorial === STEP_NUM - 1 &&
      $q.platform.is.desktop
    "
    :steps="steps"
    :step-num="STEP_NUM"
    @end-tutorial="userStore.setMeTutorial(STEP_NUM)"
  />
</template>

<script setup lang="ts">
// core
import { is } from 'quasar';
// stores
import { useProjectStore } from 'src/stores/project-store';

// components
import ProjectFiltersList from './components/ProjectFiltersList.vue';
import IssuesListTitle from 'src/components/IssuesListTitle.vue';
import PinnedIssueList from './components/PinnedIssueList.vue';

import GuidedTour from '../guided-tours/GuidedTour.vue';
import { steps, STEP_NUM } from 'src/modules/guided-tours/tutorials/tutorial2';

// constants
import {
  ref,
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
import { useUserStore } from 'src/stores/user-store';

const { getAllProjectInfo } = useLoadProjectInfo();
const { onRequest } = useDefaultIssues('project');
const { getGroupedIssues } = useGroupedIssues('project');

const projectStore = useProjectStore();

const {
  project,
  isGroupingEnabled,
  isGanttDiagramm,
  isKanbanEnabled,
  issuesLoader,
  projectProps,
} = storeToRefs(projectStore);

const userStore = useUserStore();

const { user } = storeToRefs(userStore);

const { refreshIssues, pinnedIssues } = storeToRefs(useIssuesStore());
const { fetchPinnedIssues } = useIssuesStore();

const tab = ref('general');

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
  GanttView: defineAsyncComponent(
    () => import('src/modules/issue-list/components/gantt-view/GanttView.vue'),
  ),
  TableListSkeleton: defineAsyncComponent(
    () => import('./components/skeletons/TableListSkeleton.vue'),
  ),
  BoardListSkeleton: defineAsyncComponent(
    () => import('./components/skeletons/BoardListSkeleton.vue'),
  ),
};

const currentIssueList = shallowRef();

const tableReader = ref(false);

const onIssueTableReady = () => {
  if (
    currentIssueList.value != components.BoardListSkeleton &&
    currentIssueList.value != components.TableListSkeleton
  ) {
    tableReader.value = true;
  }
};

watchEffect(() => {
  tableReader.value = false;
  if (issuesLoader.value === false) {
    if (isGanttDiagramm.value) {
      currentIssueList.value = components.GanttView;
      return;
    }

    if (isGroupingEnabled.value) {
      currentIssueList.value = components.GroupedIssueList;
      return;
    }

    currentIssueList.value = components.DefaultIssueList;
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

<style lang="scss" scoped>
:deep(.q-tab__label) {
  text-transform: none;
  font-size: 16px;
  letter-spacing: 0.5px;
}

:deep(.q-tab-panel) {
  padding: 0;
}
</style>
