<template>
  <q-dialog ref="dialogRef" @show="handleOpen" @hide="handleClose">
    <q-card
      class="sprint-dialog-card"
      :class="isDesktop ? 'q-pa-lg' : 'q-pa-md'"
      :style="{ 'overflow: auto;': !isDesktop }"
      container
    >
      <q-card-section
        class="row items-center justify-between"
        :class="isDesktop ? 'q-pb-lg' : 'q-pb-md'"
        style="width: 100%"
      >
        <span class="text-h6" :class="{ 'mobile-title': !isDesktop }"
          >{{ sprintId ? 'Обновление' : 'Создание' }} спринта</span
        >
        <q-btn flat dense @click="dialogRef?.hide()">
          <q-icon name="close" dense size="18px" /> </q-btn
      ></q-card-section>
      <q-layout v-if="isDesktop" view="hHh LpR lff" container>
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
            :default-props="sprint"
            @delete="deleteIssueById"
            @create="createSprintHandle"
            @edit="updateSprintHandle"
            class="col no-wrap"
          />
        </q-drawer>
      </q-layout>

      <div v-else class="mobile-view" style="height: 100%">
        <q-tabs
          v-model="mobileTab"
          dense
          class="q-pb-md"
          active-color="primary"
          indicator-color="primary"
          align="justify"
        >
          <q-tab name="issues" label="Задачи" />
          <q-tab name="form" label="Параметры" />
        </q-tabs>
        <q-layout view="hHh LpR lff" container style="height: 100%">
          <q-drawer v-model="leftDrawerOpen" side="left" bordered :width="280">
            <div class="q-px-xs">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-h6">Фильтры</div>
                <q-btn
                  flat
                  dense
                  icon="close"
                  @click="leftDrawerOpen = false"
                />
              </div>
              <MyFilterList @update-filter="handleUpdateFilter" />
            </div>
          </q-drawer>
          <q-page-container>
            <q-tab-panels
              v-model="mobileTab"
              animated
              class="mobile-panels"
              keep-alive
            >
              <q-tab-panel name="issues" class="q-pa-none">
                <IssuesTable
                  v-model:checked-rows="checkedIssues"
                  selection="multiple"
                  :current-filter="currentFilter"
                  is-create-sprint
                  style="
                    padding: 0;
                    height: calc(100vh - 250px);
                    overflow-y: auto;
                  "
                  @toggle="toggleLeftDrawer()"
                  is-mobile
                />
              </q-tab-panel>

              <q-tab-panel name="form" class="q-pa-none">
                <div style="height: calc(100vh - 250px); overflow-y: auto">
                  <CreateSprintForm
                    :issues="checkedIssues"
                    :default-props="sprint"
                    @delete="deleteIssueById"
                    @create="createSprintHandle"
                    @edit="updateSprintHandle"
                    is-mobile
                  />
                </div>
              </q-tab-panel>
            </q-tab-panels>
          </q-page-container>
        </q-layout>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { QDialog, Screen, useQuasar } from 'quasar';
import { computed, nextTick, ref, watch } from 'vue';

import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

import {
  DtoSprint,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  getFilters,
  getMyFilters,
} from 'src/modules/search-issues/services/api';

import CreateSprintForm from './components/CreateSprintForm.vue';
import { MyFilterList } from 'src/modules/search-issues/filter-list/ui';
import IssuesTable from 'src/modules/search-issues/ui/IssuesTable.vue';

import {
  getSprint,
  createSprint,
  sprintUpdate,
  sprintIssuesUpdate,
  sprintWatchersUpdate,
} from '../services/api';
import { useSprintStore } from '../stores/sprint-store';

const emits = defineEmits<{
  updateSprints: [];
  reopen: [id: string];
}>();

const props = defineProps<{
  sprintId?: string;
}>();

const q = useQuasar();

const isDesktop = computed(() => q.platform.is?.desktop);

const mobileTab = ref('issues');

const filtersStore = useFiltersStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const sprintStore = useSprintStore();

const currentFilter = ref<TypesIssuesListFilters | undefined | null>({
  workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
  search_query: '',
});
const leftDrawerOpen = ref(isDesktop.value);
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

const sprint = ref<DtoSprint | null>();

const loadSprintIssues = async (sprintId: string) => {
  const workspaceId = workspaceStore.workspaceInfo?.id;
  if (!workspaceId) {
    console.warn('Workspace ID не найден при загрузке issues');
    return [];
  }

  const allIssues: any[] = [];
  let offset = 0;
  let totalCount = 0;
  const ISSUES_LIMIT = 100;

  while (true) {
    const response = await sprintStore.getIssueList(
      workspaceId,
      sprintId,
      {},
      {
        limit: ISSUES_LIMIT,
        offset,
      },
    );

    const loadedIssues = response.data.issues ?? [];

    allIssues.push(...loadedIssues);

    if (offset === 0) totalCount = response.data.count ?? 0;

    const hasMoreData =
      loadedIssues.length === ISSUES_LIMIT && allIssues.length < totalCount;

    if (!hasMoreData) {
      break;
    }

    offset += ISSUES_LIMIT;
  }

  return allIssues;
};

const handleOpen = async () => {
  checkedIssues.value = [];
  sprint.value = null;

  if (props.sprintId) {
    try {
      sprint.value = await getSprint(
        workspaceStore.workspaceInfo?.id ?? '',
        props.sprintId,
      );

      checkedIssues.value = await loadSprintIssues(props.sprintId);
    } catch (error) {
      showNotification('error', 'Ошибка при загрузке данных спринта');
    }
  }

  currentFilter.value = {
    workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
  };
  await refresh();
};

const deleteIssueById = (id: string) => {
  checkedIssues.value = checkedIssues.value.filter((el) => el.id !== id);
};

const handleClose = () => {
  currentFilter.value = {};
  checkedIssues.value = [];
};

const updateIssueAndWatchers = async (id: string, data: any) => {
  return Promise.all([
    sprintIssuesUpdate(
      workspaceStore.currentWorkspaceSlug ?? '',
      id ?? '',
      data.issuesSprint,
    ).catch((err) => {
      showNotification('error', 'Ошибка при прекреплении задач');
      throw err;
    }),
    sprintWatchersUpdate(
      workspaceStore.currentWorkspaceSlug ?? '',
      id ?? '',
      data.membersSprint,
    ).catch((err) => {
      showNotification('error', 'Ошибка при прекреплении наблюдателей');
      throw err;
    }),
  ]);
};

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const updateSprintHandle = async (data: any) => {
  try {
    await sprintUpdate(
      workspaceStore.currentWorkspaceSlug ?? '',
      sprint.value?.id ?? '',
      data.createSprintData,
    );
  } catch {
    showNotification('error', 'Ошибка при обновлении данных спринта');
    return;
  }

  try {
    await updateIssueAndWatchers(sprint.value?.id ?? '', data);
  } catch {
    return;
  }

  if (sprintStore.sprint?.id && sprintStore.sprint.id === sprint.value?.id) {
    sprintStore.triggerSprintRefresh();
  }

  showNotification('success', 'Спринт обновлен');

  emits('updateSprints');
  dialogRef.value?.hide();
};

const createSprintHandle = async (data: any) => {
  let res = {} as DtoSprint;
  try {
    res = await createSprint(
      workspaceStore.currentWorkspaceSlug ?? '',
      data.createSprintData,
    );
  } catch {
    showNotification('error', 'Ошибка при создании спринта');
    return;
  }

  showNotification('success', 'Спринт создан');

  try {
    await updateIssueAndWatchers(res?.id ?? '', data);
  } catch {
    emits('reopen', res?.id ?? '');
    dialogRef.value?.hide();
    return;
  }

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

watch(
  () => mobileTab.value,
  async (newTab, oldTab) => {
    await nextTick();

    if (newTab === 'issues' && oldTab === 'form') {
      currentFilter.value = {
        workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
      };
      refresh();
    }
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

.mobile-title {
  font-size: 20px;
  font-weight: 500;
}

.mobile-view {
  :deep(.q-tab) {
    text-transform: none;
    min-height: auto;
    padding: 0;
  }

  :deep(.q-tabs__content--align-justify .q-tab) {
    flex: 0 0 auto;
  }

  :deep(.q-tab__label) {
    padding: 12px 14px;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0.5px;
  }

  :deep(.q-tab__content) {
    padding: 0;
  }

  :deep(.filters__list .q-item) {
    padding: 8px 0;
  }

  :deep(.filters__buttons) {
    padding: 8px 16px 8px 0;
  }
}
</style>
