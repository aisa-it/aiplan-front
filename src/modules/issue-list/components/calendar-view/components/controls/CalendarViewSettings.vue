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
        v-model="filters.authors"
        :label="'Авторы'"
        :searched-options="authorsSelect.searched.value"
        :options="authorsSelect.list.value"
        :search="authorsSelect.search.value"
        @search="authorsSelect.handleSearch"
      />
      <SelectMembersFilter
        ref="selectAssigneesFilterRef"
        v-model="filters.assignees"
        :label="'Исполнители'"
        :searched-options="assigneesSelect.searched.value"
        :options="assigneesSelect.list.value"
        :search="assigneesSelect.search.value"
        @search="assigneesSelect.handleSearch"
      />
      <SelectMembersFilter
        v-model="filters.watchers"
        ref="selectWatchersFilterRef"
        :label="'Наблюдатели'"
        :searched-options="watchersSelect.searched.value"
        :options="watchersSelect.list.value"
        :search="watchersSelect.search.value"
        @search="watchersSelect.handleSearch"
      />
      <SelectLabelsFilter
        ref="selectLabelsFilterRef"
        v-model="filters.labels"
        label="Теги"
        :options="labelsSelect.list.value"
        :searched-options="labelsSelect.searched.value"
        :search="labelsSelect.search.value"
        :projects="[project]"
        unavailable-text="Тег недоступен"
        @search="labelsSelect.handleSearch"
      />
      <SelectStatesFilter
        ref="selectStatesFilterRef"
        v-model="filters.states"
        :options="statesSelect.list.value"
        :searched-options="statesSelect.searched.value"
        :projects="[project]"
        label="Статусы"
        :search="statesSelect.search.value"
        :only-active="filters.only_active"
        unavailableText="Статус недоступен"
        @search="statesSelect.handleSearch"
        @setOnlyActive="setOnlyActive"
      />
      <q-select
        v-model="filters.priorities"
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
              filters.priorities = e.map((el: any) => (el.id ? el.id : el));
            else return (filters.priorities = []);
          }
        "
      >
      </q-select>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';

import { PROJECT_VIEWS } from 'src/constants/constants';
import { useProjectFilters } from 'src/modules/issue-list/composables/useProjectFilters';

import SelectMembersFilter from 'src/modules/search-issues/filter-list/ui/add-filter/selects/SelectMembersFilter.vue';
import SelectLabelsFilter from 'src/modules/search-issues/filter-list/ui/add-filter/selects/SelectLabelsFilter.vue';
import SelectStatesFilter from 'src/modules/search-issues/filter-list/ui/add-filter/selects/SelectStatesFilter.vue';

import {
  getFilterMembers,
  getFilterLabels,
  getFilterStates,
} from 'src/modules/search-issues/filter-list/services/api';

import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useCalendarFiltersStore } from '../../store/filters-store';

import type {
  DtoLabelLight,
  DtoStateLight,
  DtoUser,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import { useRemoteSelect } from '../../composables/useRemoteSelect';

const q = useQuasar();
const isMobile = computed(() => q.platform.is.mobile);

const viewsOptionsFiltered = computed(() =>
  isMobile.value
    ? PROJECT_VIEWS.filter((el) => !el.hideInMobile)
    : PROJECT_VIEWS,
);

const { viewForm, updateIssueView } = useProjectFilters();

type CalendarFilters = {
  only_active: boolean;
  states: string[];
  labels: string[];
  authors: string[];
  assignees: string[];
  watchers: string[];
  priorities: string[];
};

const filters = ref<CalendarFilters>({
  only_active: false,
  states: [],
  labels: [],
  authors: [],
  assignees: [],
  watchers: [],
  priorities: [],
});

const emit = defineEmits<{
  (e: 'update:filters', value: CalendarFilters): void;
}>();

watch(
  filters,
  (newFilters) => {
    calendarFiltersStore.filters = {
      workspaces: [workspaceId.value],
      projects: [projectId.value],
      ...newFilters,
    };
  },
  { deep: true },
);

const { project } = storeToRefs(useProjectStore());
const { workspaceInfo } = useWorkspaceStore();
const calendarFiltersStore = useCalendarFiltersStore();

const workspaceId = computed(() => workspaceInfo?.id ?? '');
const projectId = computed(() => project.value?.id ?? '');

const priorities = [
  { id: 'low', name: 'Низкий' },
  { id: 'medium', name: 'Средний' },
  { id: 'high', name: 'Высокий' },
  { id: 'urgent', name: 'Критический' },
] as const;

const createMembersSelect = () =>
  useRemoteSelect<DtoUser>({
    fetch: async (search?: string) => {
      const { data } = await getFilterMembers({
        workspace_ids: [workspaceId.value],
        project_ids: [projectId.value],
        search_query: search,
      });
      return data.result;
    },
  });

const authorsSelect = createMembersSelect();
const assigneesSelect = createMembersSelect();
const watchersSelect = createMembersSelect();

const labelsSelect = useRemoteSelect<DtoLabelLight>({
  fetch: async (search?: string) => {
    const { data } = await getFilterLabels({
      workspace_ids: [workspaceId.value],
      project_ids: [projectId.value],
      search_query: search,
    });
    return data.result;
  },
});

const statesSelect = useRemoteSelect<DtoStateLight>({
  fetch: async (search?: string) => {
    const { data } = await getFilterStates({
      workspace_ids: [workspaceId.value],
      project_ids: [projectId.value],
      search_query: search,
    });

    if (!data.result) return [];

    return data.result.map((s: DtoStateLight) => ({
      id: s.id,
      name: s.name,
      color: s.color,
      project: s.project,
    }));
  },
});

const setOnlyActive = (value: boolean, resetStates = false) => {
  if (value || resetStates) filters.value.states = [];
  filters.value.only_active = value;
};

onMounted(async () => {
  calendarFiltersStore.filters = {
    workspaces: [workspaceId.value],
    projects: [projectId.value],
  };

  authorsSelect.load();
  assigneesSelect.load();
  watchersSelect.load();

  labelsSelect.load();
  statesSelect.load();
});
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
