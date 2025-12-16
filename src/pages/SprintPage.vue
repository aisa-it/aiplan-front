<template>
  <q-page>
    <q-card class="single-list relative" flat dense>
      <q-card-section
        class="row issue-list__header"
        :style="!ny ? 'padding: 12px 16px' : 'padding: 32px 16px 12px 16px'"
      >
        <SprintHeaderSkeleton v-if="sprintLoader" />
        <SprintHeader v-else :sprint="sprint" />
        <q-space />

        <SprintFiltersList
          v-if="is.object(sprintProps)"
          :columns="sprintStore.sortAllColumns"
          @update="load()"
        />
      </q-card-section>
      <q-separator />
      <transition name="fade" mode="out-in">
        <component
          :is="currentIssueList"
          contextType="sprint"
          :sprint="sprint"
        />
      </transition>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { is } from 'quasar';
import { useRouter } from 'vue-router';
import {
  ref,
  defineAsyncComponent,
  onMounted,
  shallowRef,
  watch,
  watchEffect,
} from 'vue';

import { getSprint } from 'src/modules/sprints/services/api';

import SprintFiltersList from 'src/modules/issue-list/components/SprintFiltersList.vue';
import SprintHeader from 'src/modules/sprints/ui/SprintHeader.vue';
import SprintHeaderSkeleton from 'src/modules/sprints/sceletons/SprintHeaderSkeleton.vue';

import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { storeToRefs } from 'pinia';
import { useDefaultIssues } from 'src/modules/issue-list//composables/useDefaultIssues';
import { useGroupedIssues } from 'src/modules/issue-list//composables/useGroupedIssues';
import { useIssuesStore } from 'src/stores/issues-store';
import { useUtilsStore } from 'src/stores/utils-store';

const { onRequest } = useDefaultIssues('sprint');
const { getGroupedIssues } = useGroupedIssues('sprint');

const router = useRouter();
const sprintLoader = ref(false);

const sprintStore = useSprintStore();
const utilsStore = useUtilsStore();

const {
  sprint,
  isGroupingEnabled,
  isKanbanEnabled,
  isGanttDiagramm,
  issuesLoader,
  sprintProps,
} = storeToRefs(sprintStore);

const { ny } = storeToRefs(utilsStore);

const { refreshIssues } = storeToRefs(useIssuesStore());

const load = async () => {
  issuesLoader.value = true;

  if (isGroupingEnabled.value === false) {
    await onRequest();
  } else if (isGroupingEnabled.value === true) {
    await getGroupedIssues();
  }

  issuesLoader.value = false;
};

const updateSprint = async () => {
  sprintLoader.value = true;
  issuesLoader.value = true;
  sprint.value = await getSprint(
    router.currentRoute.value.params.workspace as string,
    router.currentRoute.value.params.sprint as string,
  );
  sprintLoader.value = false;
  await load();
};

onMounted(async () => {
  issuesLoader.value = true;
  sprintLoader.value = true;
  sprintStore.refreshSprintData = false;
  await sprintStore.getMyViewProps();
  await updateSprint();
});

watch(
  () => sprintStore.refreshSprintData,
  async (v) => {
    if (v) {
      issuesLoader.value = true;
      sprintLoader.value = true;
      await updateSprint();
      sprintStore.refreshSprintData = false;
    }
  },
);

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
    () => import('src/modules/issue-list/components/DefaultIssueList.vue'),
  ),
  GroupedIssueList: defineAsyncComponent(
    () => import('src/modules/issue-list/components/GroupedIssueList.vue'),
  ),

  GanttView: defineAsyncComponent(
    () => import('src/modules/sprints/ui/gantt-view/ui/GanttView.vue'),
  ),

  TableListSkeleton: defineAsyncComponent(
    () =>
      import(
        'src/modules/issue-list//components/skeletons/TableListSkeleton.vue'
      ),
  ),
  BoardListSkeleton: defineAsyncComponent(
    () =>
      import(
        'src/modules/issue-list/components/skeletons/BoardListSkeleton.vue'
      ),
  ),
};

const currentIssueList = shallowRef();

watchEffect(() => {
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
