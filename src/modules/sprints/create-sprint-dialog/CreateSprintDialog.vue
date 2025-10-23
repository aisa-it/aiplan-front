<template>
  <q-dialog ref="dialogRef" @show="handleOpen" @hide="handleClose">
    <q-card class="sprint-dialog-card q-pa-lg" container>
      <q-card-section
        class="row items-center justify-between q-pb-lg"
        style="width: 100%"
      >
        <span class="text-h6">Создание спринта</span>
        <q-btn flat dense @click="dialogRef?.hide()">
          <q-icon name="close" dense size="18px" /> </q-btn
      ></q-card-section>
      <q-layout view="hHh LpR lff" container>
        <q-drawer
          v-model="leftDrawerOpen"
          show-if-above
          :width="defineDrawerWidth"
          :breakpoint="500"
          bordered
          class="no-wrap q-pr-lg"
        >
          <MyFilterList @update-filter="handleUpdateFilter" />
        </q-drawer>
        <q-page-container style="height: 100%">
          <IssuesTable
            v-model:checked-rows="checkedIssues"
            :class="{ 'q-ml-lg': leftDrawerOpen, 'q-mr-lg': rightDrawerOpen }"
            selection="multiple"
            style="padding: 0"
            @toggle="toggleLeftDrawer()"
            @toggle-right="toggleRightDrawer()"
            :current-filter="currentFilter"
            is-create-sprint
          />
        </q-page-container>
        <q-drawer
          v-model="rightDrawerOpen"
          side="right"
          show-if-above
          :width="420"
          :breakpoint="500"
          bordered
          class="no-wrap q-pl-lg"
        >
          <CreateSprintForm
            :issues="checkedIssues"
            @delete="deleteIssueById"
            @create="createSprintHandle"
            class="col no-wrap"
          />
        </q-drawer>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QDialog, Screen } from 'quasar';
import { computed, ref, watch } from 'vue';

import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  getFilters,
  getMyFilters,
} from 'src/modules/search-issues/services/api';

import CreateSprintForm from './components/CreateSprintForm.vue';
import { MyFilterList } from 'src/modules/search-issues/filter-list/ui';
import IssuesTable from 'src/modules/search-issues/ui/IssuesTable.vue';

import {
  createSprint,
  sprintIssuesUpdate,
  sprintWatchersUpdate,
} from '../services/api';

const emits = defineEmits<{ updateSprints: [] }>();

const filtersStore = useFiltersStore();
const workspaceStore = useWorkspaceStore();

const currentFilter = ref<TypesIssuesListFilters | undefined | null>({
  workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
  search_query: '',
});
const leftDrawerOpen = ref(true);
const rightDrawerOpen = ref(true);

const dialogRef = ref<InstanceType<typeof QDialog> | null>(null);

const checkedIssues = ref<any[]>([]);

const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

const defineDrawerWidth = computed(() => (Screen.width > 1280 ? 300 : 200));

const handleUpdateFilter = async (
  filter: TypesIssuesListFilters | undefined | null,
) => {
  currentFilter.value = {
    ...filter,
    workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
  };
  await refresh();
};

const refreshFilters = async () => {
  filtersStore.filterList = await getFilters();
};

const refreshMyFilters = async () => {
  filtersStore.myFilterList = await getMyFilters();
};

const handleOpen = async () => {
  checkedIssues.value = [];
  currentFilter.value = {
    workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
  };
  await refresh();
};

const deleteIssueById = (id: string) => {
  checkedIssues.value = checkedIssues.value.filter((el) => el.id !== id);
};

const handleClose = () => {
  filtersStore.resetColumns();
  currentFilter.value = {};
  checkedIssues.value = [];
};

const createSprintHandle = async (data: any) => {
  const res = await createSprint(
    workspaceStore.currentWorkspaceSlug ?? '',
    data.createSprintData,
  );
  await Promise.all([
    sprintIssuesUpdate(
      workspaceStore.currentWorkspaceSlug ?? '',
      res.id ?? '',
      data.issuesSprint,
    ),
    sprintWatchersUpdate(
      workspaceStore.currentWorkspaceSlug ?? '',
      res.id ?? '',
      data.membersSprint,
    ),
  ]);

  emits('updateSprints');
  dialogRef.value?.hide();
};

const refresh = async () => {
  for (const key in filtersStore.columnsToShow) {
    filtersStore.columnsToShow[key as keyof typeof filtersStore.columnsToShow] =
      ['sequence_id', 'name', 'priority', 'state'].includes(key);
  }
  await refreshFilters();
  await refreshMyFilters();
};

watch(
  () => workspaceStore.currentWorkspaceSlug,
  () => {
    currentFilter.value = {
      workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
    };
    refresh();
  },
);
</script>

<style scoped lang="scss">
.sprint-dialog-card {
  border-radius: 16px !important;
  overflow: hidden;
  height: 100%;
  width: 100%;
  min-width: 100%;
  display: flex;
  flex-direction: column;
}
.sprint-dialog__layout {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  gap: 24px;
}
.sprint-container {
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  gap: 24px;
}

:deep(.q-card__section--vert) {
  padding-left: 0;
  padding-top: 0;
  padding-right: 0;
}
</style>
