<template>
  <div class="calendar-view-settings">
    <div class="calendar-view-settings__title">Отображение</div>
    <q-list>
      <q-item class="row q-pa-none">
        <q-select
          dense
          label="Вид"
          v-model="viewForm.issueView"
          map-options
          class="base-selector full-w"
          popup-content-class="fit-select-popup scrollable-content selector-option__wrapper"
          :options="viewsOptionsFiltered"
          @update:model-value="updateIssueView"
        >
          <template v-slot:option="{ itemProps, opt }">
            <q-item v-bind="itemProps" class="selector-option__wrapper">
              <q-item-section>
                <q-item-label>
                  {{ opt.label }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-item>
      <SelectMembersFilter
        v-model="filter.filter.authors"
        :label="'Авторы'"
        :searched-options="searchedMembers.authors"
        :options="members.authors"
        :loading="loading"
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
        :search="search.watchers"
        @search="(val) => handleSearchMembers(val, 'watchers')"
      />
      <SelectLabelsFilter
        ref="selectLabelsFilterRef"
        v-model="filter.filter.labels"
        label="Теги"
        :options="userLabels"
        :searched-options="searchedLabels"
        :loading="loading"
        :search="search.labels"
        :projects="[project]"
        unavailable-text="Тег недоступен"
        @search="handleSearchLabels"
      />
      <SelectStatesFilter
        ref="selectStatesFilterRef"
        v-model="filter.filter.states"
        :options="userStates"
        :searched-options="searchedStates"
        :projects="[project]"
        :loading="loading"
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
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { debounce, useQuasar } from 'quasar';
import { computed, ref, onMounted, watch } from 'vue';
import { PROJECT_VIEWS } from 'src/constants/constants';
import { useProjectFilters } from 'src/modules/issue-list/composables/useProjectFilters';
import { IFilter } from 'src/interfaces/filters';
import SelectMembersFilter from 'src/modules/search-issues/filter-list/ui/add-filter/selects/SelectMembersFilter.vue';
import SelectLabelsFilter from 'src/modules/search-issues/filter-list/ui/add-filter/selects/SelectLabelsFilter.vue';
import SelectStatesFilter from 'src/modules/search-issues/filter-list/ui/add-filter/selects/SelectStatesFilter.vue';

import {
  getFilterLabels,
  getFilterMembers,
  getFilterStates,
} from 'src/modules/search-issues/filter-list/services/api';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user-store';
import {
  DtoLabelLight,
  DtoUser,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

const q = useQuasar();

const isMobile = computed(() => q.platform.is.mobile);

const viewsOptionsFiltered = computed(() =>
  isMobile.value
    ? PROJECT_VIEWS.filter((el) => !el.hideInMobile)
    : PROJECT_VIEWS,
);

const { viewForm, updateIssueView } = useProjectFilters();

// -------------------------------------------------------
type Members = 'authors' | 'assignees' | 'watchers';

const loading = ref(false);

const searchedMembers = ref<Record<Members, any[] | null>>({
  authors: null,
  assignees: null,
  watchers: null,
});

const members = ref<Record<Members, any[]>>({
  authors: [],
  assignees: [],
  watchers: [],
});

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

const route = useRoute();
const { user } = storeToRefs(useUserStore());

const { project } = storeToRefs(useProjectStore());
const { workspaceInfo } = useWorkspaceStore();

const userLabels = ref<any>([]);
const searchedLabels = ref<any[] | null>(null);
const userStates = ref<{ name: string; id: string }[]>([]);
const searchedStates = ref<any[] | null>(null);

const searchStates = async (searchQuery?: string): Promise<any[]> => {
  const dataFiltered: any[] = [];
  await getFilterStates({
    workspace_ids: [workspaceInfo?.id ?? ''],
    project_ids: [project.value.id],
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

const searchLabels = async (searchQuery?: string): Promise<DtoLabelLight[]> => {
  let labels: DtoLabelLight[] = [];
  await getFilterLabels({
    workspace_ids: [workspaceInfo?.id ?? ''],
    project_ids: [project.value.id],
    search_query: searchQuery,
  })
    .then(({ data }) => {
      labels = data.result;
    })
    .catch(() => (labels = []));

  return labels;
};

const handleSearchLabels = debounce(async (search?: string) => {
  searchedLabels.value = !search ? null : await searchLabels(search);

  return;
}, 700);

const handleSearchStates = debounce(async (search?: string) => {
  searchedStates.value = !search ? null : await searchStates(search);
  return;
}, 700);

const setOnlyActive = (value: boolean, resetStates = false) => {
  if (value || resetStates) filter.value.filter.states = [];
  filter.value.filter.only_active = value;
};

const getMembers = async (filters?: any) => {
  return getFilterMembers({
    workspace_ids: filters?.workspaces,
    project_ids: filters?.projects,
    search_query: filters?.searchQuery,
  });
};

function fixCurrentUserInList(result: []) {
  return [
    ...result.filter((u: DtoUser) => u?.id === user.value.id),
    ...result.filter((u: DtoUser) => u?.id !== user.value.id),
  ];
}

const handleSearchMembers = debounce(
  async (search: string | undefined, type: Members) => {
    if (!search) searchedMembers.value[type] = null;
    await getMembers({
      workspaces: [workspaceInfo?.id],
      projects: [project.value.id],
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

onMounted(async () => {
  await getMembers({
    workspaces: [workspaceInfo?.id],
    projects: [project.value.id],
    searchQuery: null,
  }).then(({ data }) => {
    members.value.authors = data.result;
    members.value.assignees = data.result;
    members.value.watchers = data.result;
  });

  userLabels.value = await searchLabels();
  userStates.value = await searchStates();
});

watch(
  () => filter.value.filter,
  (newVal) => {
    console.log(newVal);
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.calendar-view-settings {
  padding: 0 16px;
}

.calendar-view-settings__title {
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0.15px;
  margin-bottom: 12px;
}
</style>
