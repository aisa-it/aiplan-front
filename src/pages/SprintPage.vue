<template>
  <q-page>
    <q-card class="single-list relative" flat dense>
      <q-card-section
        class="row issue-list__header"
        :style="'padding: 12px 16px'"
      >
        <div
          class="q-table__title abbriviated-text"
          style="max-width: calc(100% - 60px); display: flex; gap: 16px"
        >
          <span>
            {{ sprint?.name }}
            {{
              getSprintDates(sprint?.start_date ?? '', sprint?.end_date ?? '')
            }}
          </span>
          <StatusLinearProgressBar
            style="max-width: 320px"
            :stats="sprint.stats ?? {}"
          />
        </div>
        <q-space />

        <SprintFiltersList
          v-if="is.object(sprintProps)"
          :columns="allSprintColumns"
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
import { DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { allSprintColumns } from 'src/modules/issue-list/constants/sprintTableColumns';

import SprintFiltersList from 'src/modules/issue-list/components/SprintFiltersList.vue';
import StatusLinearProgressBar from 'src/components/progress-bars/StatusLinearProgressBar.vue';

import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { storeToRefs } from 'pinia';
import { useDefaultIssues } from 'src/modules/issue-list//composables/useDefaultIssues';
import { useGroupedIssues } from 'src/modules/issue-list//composables/useGroupedIssues';
import { useIssuesStore } from 'src/stores/issues-store';
import { getSprintDates } from 'src/modules/sprints/helpres';

const { onRequest } = useDefaultIssues('sprint');
const { getGroupedIssues } = useGroupedIssues('sprint');

const router = useRouter();
const sprint = ref({} as DtoSprint);

const sprintStore = useSprintStore();

const {
  isGroupingEnabled,
  isKanbanEnabled,
  isGanttDiagramm,
  issuesLoader,
  sprintProps,
} = storeToRefs(sprintStore);

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
  sprint.value = await getSprint(
    router.currentRoute.value.params.workspace as string,
    router.currentRoute.value.params.sprint as string,
  );
  await load();
};

onMounted(async () => {
  sprintStore.refreshSprintData = false;
  await sprintStore.getMyViewProps();
  await updateSprint();
});

watch(
  () => sprintStore.refreshSprintData,
  async (v) => {
    if (v) {
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
