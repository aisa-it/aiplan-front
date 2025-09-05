<template>
  <q-dialog
    ref="dialogRef"
    @show="prepareFilterOptions"
    @hide="
      () => {
        emits('hide');
        filter = JSON.parse(JSON.stringify(INIT_FILTER));
      }
    "
  >
    <q-card class="add-filters-card row" style="height: 80vh; max-width: 60vw">
      <q-layout view="hHh Lpr lff" container>
        <q-drawer
          v-if="!currentFilter"
          v-model="leftDrawerOpen"
          show-if-above
          :width="200"
          :breakpoint="500"
          bordered
          class="no-wrap overflow-hidden"
          style="padding: 10px"
        >
          <AddFiltersList @set-filter="(value) => editFilter(value)" />
        </q-drawer>
        <q-page-container class="scrollable-content">
          <div
            v-show="globalLoading"
            class="row justify-center items-center"
            style="
              height: calc(93vh - 100px);
              margin-top: auto;
              margin-bottom: auto;
            "
          >
            <DefaultLoader />
          </div>
          <q-card-section v-show="!globalLoading" class="scrollable-content">
            <div
              class="row items-center justify-between centered-horisontally q-mb-sm"
            >
              <div class="no-wrap row centered-horisontally">
                <q-btn
                  v-if="!currentFilter"
                  flat
                  dense
                  round
                  style="height: 30px; width: 30px"
                  aria-label="Menu"
                  class="q-mr-sm"
                  @click="leftDrawerOpen = !leftDrawerOpen"
                >
                  <MenuIcon />
                </q-btn>
                <h6 style="font-weight: 600; margin: 0 !important">
                  {{
                    currentFilter ? 'Редактирование фильтра' : 'Новый фильтр'
                  }}
                </h6>
              </div>
              <q-btn flat dense v-close-popup><CloseIcon /></q-btn>
            </div>
            <q-input
              ref="nameRef"
              v-model="filter.name"
              label="Название"
              dense
              :rules="[
                (val) =>
                  (val && val.length > 0) || 'Необходимо ввести название',
              ]"
              class="base-input q-mb-sm"
            />
            <q-input
              v-model="filter.description"
              label="Описание"
              type="textarea"
              dense
              class="base-textarea q-mb-sm"
            />
            <SelectEntityFilter
              ref="selectWorkspacesFilterRef"
              v-model="filter.filter.workspaces"
              :label="'Пространство'"
              :searched-options="searchedWs"
              :options="userWs"
              :popup-content-style="selectWorkspacesFilterWidth"
              :loading="loading"
              :search="search.workspaces"
              unavailable-text="Пространство недоступно"
              @search="handleSearchWorkspaces"
              @update="(e) => updateProjectList(e)"
            />
            <SelectEntityFilter
              ref="selectProjectsFilterRef"
              v-model="filter.filter.projects"
              :label="'Проект'"
              :searched-options="searchedProjects"
              :options="projects"
              :popup-content-style="selectProjectsFilterWidth"
              :loading="loading"
              :search="search.projects"
              unavailable-text="Проект недоступен"
              @search="handleSearchProjects"
              @update="(e) => updateProjects(e)"
            />
            <SelectMembersFilter
              ref="selectAuthorsFilterRef"
              v-model="filter.filter.authors"
              :label="'Авторы'"
              :searched-options="searchedMembers.authors"
              :options="members.authors"
              :loading="loading"
              :popup-content-style="selectAuthorsFilterWidth"
              :search="search.authors"
              @search="(val) => handleSearchMembers(val, 'authors')"
            />
            <SelectMembersFilter
              ref="selectAssigneesFilterRef"
              v-model="filter.filter.assignees"
              :label="'Исполнители'"
              :searched-options="searchedMembers.assignees"
              :options="members.assignees"
              :loading="loading"
              :popup-content-style="selectAssigneesFilterWidth"
              :search="search.assignees"
              @search="(val) => handleSearchMembers(val, 'assignees')"
            />
            <SelectMembersFilter
              v-model="filter.filter.watchers"
              ref="selectWatchersFilterRef"
              :label="'Наблюдатели'"
              :searched-options="searchedMembers.watchers"
              :options="members.watchers"
              :loading="loading"
              :popup-content-style="selectWatchersFilterWidth"
              :search="search.watchers"
              @search="(val) => handleSearchMembers(val, 'watchers')"
            />
            <SelectLabelsFilter
              ref="selectLabelsFilterRef"
              v-model="filter.filter.labels"
              label="Теги"
              :options="userLabels"
              :searched-options="searchedLabels"
              :popup-content-style="selectLabelsFilterWidth"
              :loading="loading"
              :search="search.labels"
              :projects="projects"
              unavailable-text="Тег недоступен"
              @search="handleSearchLabels"
            />
            <SelectStatesFilter
              ref="selectStatesFilterRef"
              v-model="filter.filter.states"
              :options="userStates"
              :searched-options="searchedStates"
              :projects="projects"
              :loading="loading"
              :popup-content-style="selectStatesFilterWidth"
              label="Статусы"
              :search="search.states"
              :only-active="filter.filter.only_active"
              unavailableText="Статус недоступен"
              @search="handleSearchStates"
              @setOnlyActive="setOnlyActive"
            />
            <q-select
              ref="selectPrioritiesFilterRef"
              v-model="filter.filter.priorities"
              dense
              multiple
              clearable
              map-options
              emit-value
              label="Приоритеты"
              class="base-selector q-mb-sm"
              :popup-content-style="selectPrioritiesFilterWidth"
              option-value="id"
              option-label="name"
              :options="priorities"
              @update:model-value="
                (e) => {
                  if (e)
                    filter.filter.priorities = e.map((el: any) =>
                      el.id ? el.id : el,
                    );
                  else return (filter.filter.priorities = []);
                }
              "
            >
            </q-select>
            <div class="action-content">
              <div class="action-content_left">
                <q-checkbox v-model="filter.public" label="Публичный" />
                <q-btn
                  flat
                  no-caps
                  label="Сбросить"
                  class="delete-btn q-mx-sm q-mt-sm"
                  @click="clearAll"
                />
              </div>
              <q-card-actions
                align="right"
                class="action-content_right"
                style="padding: 8px 8px 0 !important"
              >
                <q-btn
                  v-if="!currentFilter"
                  no-caps
                  class="secondary-btn"
                  @click="emits('saveTempFilter', filter)"
                  v-close-popup
                  >Применить</q-btn
                >
                <q-btn no-caps class="primary-btn" @click="handleSaveFilter"
                  >Сохранить
                </q-btn></q-card-actions
              >
            </div>
          </q-card-section>
        </q-page-container>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { debounce } from 'quasar';
import { storeToRefs } from 'pinia';
import { ref, watch } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// interfaces
import { IFilter } from 'src/interfaces/filters';
import {
  DtoLabelLight,
  DtoSearchFilterFull,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

// components
import AddFiltersList from './AddFiltersList.vue';
import MenuIcon from 'src/components/icons/MenuIcon.vue';
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
import {
  SelectMembersFilter,
  SelectEntityFilter,
  SelectStatesFilter,
  SelectLabelsFilter,
} from './selects';
import { getFilters } from 'src/modules/search-issues/services/api';

// services
import {
  createSearchFilter,
  getFilterLabels,
  getFilterMembers,
  getFilterStates,
  updateFilter,
} from '../../services/api';
import { url } from 'inspector';

type Members = 'authors' | 'assignees' | 'watchers';

const props = defineProps<{
  currentFilter?: DtoSearchFilterFull | null;
}>();

const emits = defineEmits<{
  refresh: [];
  hide: [];
  saveTempFilter: [filter: IFilter];
}>();

// stores
const userStore = useUserStore();
const filterStore = useFiltersStore();
const workspaceStore = useWorkspaceStore();
// store to refs
const { userWorkspaces, userProjects, user } = storeToRefs(userStore);
// loaders
const loading = ref(false);
const globalLoading = ref(false);

// drawer toggle
const leftDrawerOpen = ref(false);
// select vars
const userStates = ref<{ name: string; id: string }[]>([]);
const userLabels = ref<any>([]);
const userWs = ref<any>(userWorkspaces.value);

// search vars
const searchedMembers = ref<Record<Members, any[] | null>>({
  authors: null,
  assignees: null,
  watchers: null,
});
const searchedLabels = ref<any[] | null>(null);
const searchedStates = ref<any[] | null>(null);
const searchedWs = ref<any[] | null>(null);
const searchedProjects = ref<any[] | null>(null);

const members = ref<Record<Members, any[]>>({
  authors: [],
  assignees: [],
  watchers: [],
});
// vars
const nameRef = ref();
const dialogRef = ref();

const refreshFilters = async () => {
  filterStore.filterList = await getFilters();
};

const search = ref({
  workspaces: '',
  projects: '',
  authors: '',
  assignees: '',
  watchers: '',
  labels: '',
  states: '',
});

const priorities = [
  {
    id: 'low',
    name: 'Низкий',
  },
  {
    id: 'medium',
    name: 'Средний',
  },
  {
    id: 'high',
    name: 'Высокий',
  },
  {
    id: 'urgent',
    name: 'Критический',
  },
];

const INIT_FILTER = {
  name: '',
  description: '',
  public: false,
  filter: {
    only_active: false,
    states: [],
    labels: [],
    authors: [],
    projects: [],
    watchers: [],
    assignees: [],
    workspaces: [],
    priorities: [],
  },
} as IFilter;

const filter = ref<IFilter>(JSON.parse(JSON.stringify(INIT_FILTER)));
const projects = ref(userProjects.value);

// select width
const selectLabelsFilterRef = ref();
const selectStatesFilterRef = ref();
const selectAuthorsFilterRef = ref();
const selectProjectsFilterRef = ref();
const selectWatchersFilterRef = ref();
const selectAssigneesFilterRef = ref();
const selectWorkspacesFilterRef = ref();
const selectPrioritiesFilterRef = ref();

const { getWidthStyle: selectLabelsFilterWidth } = useResizeObserverSelect(
  selectLabelsFilterRef,
);
const { getWidthStyle: selectStatesFilterWidth } = useResizeObserverSelect(
  selectStatesFilterRef,
);
const { getWidthStyle: selectAuthorsFilterWidth } = useResizeObserverSelect(
  selectAuthorsFilterRef,
);
const { getWidthStyle: selectProjectsFilterWidth } = useResizeObserverSelect(
  selectProjectsFilterRef,
);
const { getWidthStyle: selectWatchersFilterWidth } = useResizeObserverSelect(
  selectWatchersFilterRef,
);
const { getWidthStyle: selectAssigneesFilterWidth } = useResizeObserverSelect(
  selectAssigneesFilterRef,
);
const { getWidthStyle: selectPrioritiesFilterWidth } = useResizeObserverSelect(
  selectPrioritiesFilterRef,
);
const { getWidthStyle: selectWorkspacesFilterWidth } = useResizeObserverSelect(
  selectWorkspacesFilterRef,
);

// ---------------------- Updating ----------------------

function fixCurrentUserInList(result: []) {
  return [
    ...result.filter((u) => u?.id === user.value.id),
    ...result.filter((u) => u?.id !== user.value.id),
  ];
}

const updateProjects = async (projects: any) => {
  loading.value = true;
  searchedProjects.value = null;
  if (projects)
    filter.value.filter.projects = projects.map((el: any) =>
      el.id ? el.id : el,
    );
  else filter.value.filter.projects = [];

  await updateLabels();
  await updateStates();
  search.value.states = '';
  search.value.labels = '';

  searchedMembers.value.assignees = null;
  searchedMembers.value.watchers = null;
  searchedMembers.value.authors = null;
  await getMembers({
    workspaces: filter.value.filter.workspaces as [],
    projects: filter.value.filter.projects as [],
  }).then(({ data }) => {
    members.value.authors = fixCurrentUserInList(data.result);
    members.value.assignees = fixCurrentUserInList(data.result);
    members.value.watchers = fixCurrentUserInList(data.result);
    search.value.assignees = '';
    search.value.authors = '';
    search.value.watchers = '';
  });
  filterMember();

  loading.value = false;
};

const updateProjectList = async (workspaces: any) => {
  loading.value = true;

  projects.value = [];

  if (workspaces && workspaces.length > 0)
    projects.value = await searchFilterProjectsList(workspaces);
  else projects.value = userProjects.value;

  filterProjects();

  search.value.projects = '';
  await updateProjects(filter.value.filter.projects);
  loading.value = false;
};

const getMembers = async (filters?: any) => {
  return getFilterMembers({
    workspace_ids: filters?.workspaces,
    project_ids: filters?.projects,
    search_query: filters?.searchQuery,
  });
};

const updateLabels = async () => {
  loading.value = true;
  searchedLabels.value = null;
  userLabels.value = await searchLabels();

  // фильтруем теги при смене проекта, чтобы оставить только подходящие
  let filteredLabels: string[] = [];

  if (filter.value.filter.labels.length !== 0) {
    filter.value.filter.labels.forEach((label) => {
      let overlappedLabel = userLabels.value.find(
        (userLabel: any) => userLabel?.id === label,
      )?.id;
      if (overlappedLabel) filteredLabels.push(overlappedLabel);
    });

    filter.value.filter.labels = filteredLabels;
  }
  loading.value = false;
};

const updateStates = async () => {
  loading.value = true;
  searchedStates.value = null;
  userStates.value = await searchStates();

  let filteredStates: string[] = [];

  if (filter.value.filter.states.length !== 0) {
    filter.value.filter.states.forEach((state) => {
      let overlappedState = userStates.value.find(
        (userState: any) => userState.id === state,
      )?.id;
      if (overlappedState) filteredStates.push(overlappedState);
    });
    filter.value.filter.states = filteredStates;
  }
  loading.value = false;
};

// ---------------------- Filtering & Sorting ----------------------
const filterProjects = () => {
  let filteredProjects: string[] = [];
  if (filter.value.filter.projects.length !== 0) {
    filter.value.filter.projects.forEach((project) => {
      let overlappedProject = projects.value.find(
        (userProject: any) => userProject?.id === project,
      )?.id;
      if (overlappedProject) filteredProjects.push(overlappedProject);
    });

    filter.value.filter.projects = filteredProjects;
  }
};

const filterMember = () => {
  const memberTypes = ['authors', 'assignees', 'watchers'] as const;
  memberTypes.forEach((type) => {
    let filteredMembers = [] as string[];
    filter.value.filter[type]?.forEach((m: string) => {
      let overlappedMember = members.value[type].find(
        (member: any) => member?.id == m,
      )?.id;
      if (overlappedMember) filteredMembers.push(overlappedMember);
    });
    filter.value.filter[type] = filteredMembers;
  });
};

// ---------------------- Saving & Editing ----------------------

const handleSaveFilter = async () => {
  nameRef.value.validate();
  if (nameRef.value.hasError) return;

  if (props.currentFilter && props.currentFilter?.id) {
    let filterBody = {
      name: filter.value.name,
      description: filter.value.description,
      filter: filter.value.filter,
      public: filter.value.public,
    };
    await updateFilter(props.currentFilter?.id, filterBody).then(() => {
      refreshFilters();
      emits('refresh');
      dialogRef.value.hide();
    });
  } else {
    await createSearchFilter(filter.value).then(() => {
      refreshFilters();
      emits('refresh');
      dialogRef.value.hide();
    });
  }
};

const editFilter = async (f: any) => {
  globalLoading.value = true;
  filter.value.filter = JSON.parse(JSON.stringify(f.filter));
  filter.value.name = JSON.parse(JSON.stringify(f.name));
  filter.value.description = JSON.parse(JSON.stringify(f.description));
  filter.value.public = JSON.parse(JSON.stringify(f.public));
  await updateProjectList(f?.filter.workspaces);
  filter.value.filter = JSON.parse(JSON.stringify(f.filter));
  globalLoading.value = globalLoading.value ? false : true;
};

// ---------------------- Clearing & Removing ----------------------

const clearAll = () => {
  if (props.currentFilter) {
    editFilter(props.currentFilter);
  } else {
    filter.value = JSON.parse(JSON.stringify(INIT_FILTER));
  }
};

// Search
const handleSearchProjects = debounce(async (search?: string) => {
  if (!search) {
    searchedProjects.value = null;
    return;
  }
  if (filter.value.filter.workspaces && filter.value.filter.workspaces.length) {
    searchedProjects.value = await searchFilterProjectsList(
      filter.value.filter.workspaces,
      search,
    );
  } else
    await userStore.getUserProjects({ search_query: search }).then((data) => {
      search ? (searchedProjects.value = data) : (projects.value = data);
    });
}, 700);

const handleSearchWorkspaces = debounce(async (search?: string) => {
  if (!search) {
    searchedWs.value = null;
    return;
  }
  userStore.getUserWorkspaces({ search_query: search }, true).then((data) => {
    search ? (searchedWs.value = data) : (userWs.value = data);
  });
}, 700);

const handleSearchMembers = debounce(
  async (search: string | undefined, type: Members) => {
    if (!search) searchedMembers.value[type] = null;
    await getMembers({
      workspaces: filter.value.filter.workspaces as [],
      projects: filter.value.filter.projects as [],
      searchQuery: search,
    }).then(({ data }) => {
      search
        ? (searchedMembers.value[type] = data.result)
        : (members.value[type] = data.result);
    });
    return;
  },
  700,
);

const handleSearchLabels = debounce(async (search?: string) => {
  searchedLabels.value = !search ? null : await searchLabels(search);

  return;
}, 700);

const handleSearchStates = debounce(async (search?: string) => {
  searchedStates.value = !search ? null : await searchStates(search);
  return;
}, 700);

const prepareFilterOptions = async () => {
  if (!props.currentFilter) {
    await getMembers().then(({ data }) => {
      members.value.authors = fixCurrentUserInList(data.result);
      members.value.assignees = fixCurrentUserInList(data.result);
      members.value.watchers = fixCurrentUserInList(data.result);
    });
    await updateLabels();
    await updateStates();
  }
};

const searchStates = async (searchQuery?: string): Promise<any[]> => {
  const dataFiltered: any[] = [];
  await getFilterStates({
    workspace_ids: filter.value.filter.workspaces,
    project_ids: filter.value.filter.projects,
    search_query: searchQuery,
  }).then(({ data }) => {
    for (let el in data.result)
      dataFiltered.push({
        color: data.result[el].color,
        id: data.result[el].id,
        name: data.result[el].name,
        project: data.result[el].project,
      });
  });
  return dataFiltered;
};

const searchFilterProjectsList = async (
  workspaces: any,
  searchQuery?: string,
): Promise<any[]> => {
  let filteredProjectsList: any = [];
  const requests = workspaces.map((ws: string) =>
    workspaceStore.getWsProjects(
      userWorkspaces.value?.find((el) => el.id === ws)?.slug as string,
      { search_query: searchQuery },
    ),
  );

  await Promise.all(requests).then(
    (res) =>
      (filteredProjectsList = res.flat().filter((pr) => {
        if (!pr) return;
        if (pr?.current_user_membership?.role > 5 || user.value.is_superuser) {
          return pr;
        } else
          return {
            id: pr.id,
            name: pr.name,
            workspace: pr.workspace,
            identifier: pr.identifier,
            current_user_membership: pr.current_user_membership,
            url: pr.url,
            cover_image: pr.cover_image,
            indetifier: pr.indetifier,
          };
      })),
  );
  return filteredProjectsList;
};

const searchLabels = async (searchQuery?: string): Promise<DtoLabelLight[]> => {
  let labels: DtoLabelLight[] = [];
  await getFilterLabels({
    workspace_ids: filter.value.filter.workspaces,
    project_ids: filter.value.filter.projects,
    search_query: searchQuery,
  })
    .then(({ data }) => {
      labels = data.result;
    })
    .catch(() => (labels = []));

  return labels;
};

const setOnlyActive = (value: boolean, resetStates = false) => {
  if (value || resetStates) filter.value.filter.states = [];
  filter.value.filter.only_active = value;
};

watch(
  () => props.currentFilter,
  () => {
    if (props.currentFilter) editFilter(props.currentFilter);
  },
);
</script>

<style scoped lang="scss">
.add-filters-card {
  min-width: 60% !important;
  border-radius: 16px !important;
  @media (max-width: 760px) {
    min-width: 95% !important;
  }
}

:deep(.q-textarea) {
  .q-field__control {
    padding: 0 6px 3px 12px;
  }
}
:deep(.absolute-full) {
  right: 0 !important;
}
:deep(.menu-item-header:hover) {
  background-color: transparent !important;
  cursor: default;
}
.action-content {
  display: flex;
  justify-content: space-between;
  &_left {
    display: flex;
    flex-direction: column;
  }
  &_right {
    align-self: flex-end;
  }
}
@media screen and (max-width: 760px) {
  .action-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    &_left {
      flex-direction: row;
      justify-content: space-between;
      margin-bottom: 8px;
    }
  }
}
</style>
