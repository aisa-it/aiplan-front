<template>
  <q-dialog ref="dialogRef" @show="refresh">
    <q-card class="search-filters-card column scrollable-content">
      <div class="search-body relative-position">
        <q-layout view="hHh Lpr lff" container>
          <q-drawer
            v-model="leftDrawerOpen"
            show-if-above
            :width="defineDrawerWidth"
            :breakpoint="500"
            bordered
            class="no-wrap"
            style="padding: 10px"
          >
            <MyFilterList
              @update-filter="handleUpdateFilter"
              @select-filter="handleSelectFilter"
            />
          </q-drawer>
          <q-page-container class="issue-list-container">
            <IssuesTable
              @toggle="toggleDrawer()"
              :current-filter="currentFilter"
              :jql-query="jqlQuery"
            />
          </q-page-container>
        </q-layout>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { Screen } from 'quasar';
import { ref, computed } from 'vue';

// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

import IssuesTable from 'src/modules/search-issues/ui/IssuesTable.vue';

import { MyFilterList } from 'src/modules/search-issues/filter-list/ui';
import { getFilters, getMyFilters } from '../services/api';
import {
  DtoSearchFilterFull,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const filtersStore = useFiltersStore();

const currentFilter = ref<TypesIssuesListFilters | undefined | null>(null);
const leftDrawerOpen = ref(true);
const defineDrawerWidth = computed(() => (Screen.width > 1280 ? 300 : 200));

// JQL-запрос из сохраненного фильтра (передается в таблицу)
const jqlQuery = ref<string | null>(null);

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleUpdateFilter = async (
  filter: TypesIssuesListFilters | undefined | null,
) => {
  currentFilter.value = filter;
  await refresh();
};

// Выбор сохраненного фильтра: обычный — в таблицу,
// с JQL-запросом — включает режим JQL в строке поиска
const handleSelectFilter = async (filter: DtoSearchFilterFull) => {
  if (filter?.jql) {
    jqlQuery.value = filter.jql;
    currentFilter.value = null;
    return;
  }
  jqlQuery.value = null;
  currentFilter.value = filter?.filter;
  await refresh();
};

const refreshFilters = async () => {
  filtersStore.filterList = await getFilters();
};

const refreshMyFilters = async () => {
  filtersStore.myFilterList = await getMyFilters();
};

const refresh = async () => {
  await refreshFilters();
  await refreshMyFilters();
};
</script>

<style scoped lang="scss">
.search-filters-card {
  min-width: 90vw !important;
  border-radius: 16px !important;
  height: 90vh;
  flex-wrap: nowrap;
  @media screen and (max-width: 1280px) {
    min-width: 100% !important;
  }
}
.search-body {
  flex: 1 1 auto;
  min-height: 0;
}
.issue-list-container {
  height: 100%;
}
:deep(.absolute-full) {
  right: 0 !important;
}
</style>
