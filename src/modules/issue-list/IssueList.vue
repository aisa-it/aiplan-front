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

    <q-card-section v-if="!issuesLoader && pinnedIssues.length">
      <PinnedIssueList
        :pinned-issues="pinnedIssues"
        :style="{ 'padding: 16px;': isGroupingEnabled }"
        @open-issue-preview="openIssuePreview"
      />
    </q-card-section>
    <q-separator />

    <transition name="fade" mode="out-in" @after-enter="onIssueTableReady">
      <component
        :is="currentIssueList"
        ref="tableComponentRef"
        contextType="project"
        data-tour="issue-table"
        @open-issue-preview="openIssuePreview"
      />
    </transition>
    <IssuePreview
      v-model="isPreview"
      @open="openIssue"
      @close="closeIssuePreview"
      @refresh="handleRefreshRequest"
    />
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
import { is, Screen, useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';

// components
import ProjectFiltersList from './components/ProjectFiltersList.vue';
import IssuesListTitle from 'src/components/IssuesListTitle.vue';
import PinnedIssueList from './components/PinnedIssueList.vue';
import IssuePreview from '../single-issue/preview-issue/ui/IssuePreview.vue';
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
  computed,
  onBeforeUnmount,
} from 'vue';

// composables
import { useLoadProjectInfo } from './composables/useLoadProjectInfo';
import { useDefaultIssues } from './composables/useDefaultIssues';
import {
  QuasarPagination,
  useGroupedIssues,
} from './composables/useGroupedIssues';

import { DtoIssue } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const $q = useQuasar();
const route = useRoute();

const { currentIssueID, isPreview, issueCommentsData, issueActivitiesData } =
  storeToRefs(useSingleIssueStore());
const { getIssueData, openIssue } = useSingleIssueStore();

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

const { getAllProjectInfo } = useLoadProjectInfo();
const { onRequest } = useDefaultIssues('project');
const { getGroupedIssues } = useGroupedIssues('project');

const isMobile = computed<boolean>(() => Screen.width <= 1200);

const load = async () => {
  issuesLoader.value = true;

  if (isGroupingEnabled.value === false) {
    await onRequest();
  } else if (isGroupingEnabled.value === true) {
    await getGroupedIssues();
  }
  issuesLoader.value = false;
};

async function handleOpenIssue(id: string): Promise<void> {
  isPreview.value = false;
  openIssue(id, user.value.theme?.open_in_new ? '_blank' : '_self');
}

async function openIssuePreview(
  issue: DtoIssue,
  pagination?: QuasarPagination,
  entity?: any,
) {
  if (!route.params.workspace || !(issue.project ?? route.params.project))
    return;

  const id = String(issue.sequence_id);
  if (isMobile.value) {
    handleOpenIssue(id);
    return;
  } else if (currentIssueID.value === id && isPreview.value) return;
  isPreview.value = false;
  issueCommentsData.value = undefined;
  issueActivitiesData.value = undefined;
  currentIssueID.value = id;

  await getIssueData(
    route.params.workspace as string,
    issue.project_detail?.identifier ?? (route.params.project as string),
  );

  if (
    tableComponentRef.value &&
    (tableComponentRef.value as any).setRefreshContext
  ) {
    (tableComponentRef.value as any).setRefreshContext(issue, pagination, entity);
  }

  isPreview.value = true;
}

async function closeIssuePreview(): Promise<void> {
  if (!isPreview.value) return;
  isPreview.value = false;
  currentIssueID.value = '';
}

const tableComponentRef = ref<any | null>(null);
const handleRefreshRequest = (isFullUpdate: boolean = false) => {
  if (
    tableComponentRef.value &&
    (tableComponentRef.value as any).refreshByPreview
  ) {
    (tableComponentRef.value as any).refreshByPreview(isFullUpdate);
  }
};

watch(isMobile, () => {
  if (isMobile.value) closeIssuePreview();
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

onMounted(async () => {
  pinnedIssues.value = [];
  issuesLoader.value = true;
  await getAllProjectInfo();
  await load();
  fetchPinnedIssues(project.value.id);
});

onBeforeUnmount(() => {
  closeIssuePreview();
});

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
