<template>
  <q-dialog ref="dialogRef" @before-show="aqlMode = false" @show="refresh">
    <q-card class="search-filters-card row scrollable-content">
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
          <div v-if="aqlMode" class="aql-menu">
            <AqlFilterList
              class="aql-menu__filters"
              :query="issuesTableRef?.aqlQuery ?? ''"
              @select="handleSelectAqlQuery"
            />
            <AqlHistoryList
              class="aql-menu__history"
              @select="handleSelectAqlQuery"
            />
          </div>
          <!-- v-show: выбранный фильтр переживает переключение режима -->
          <div v-show="!aqlMode" class="filter-list-wrapper">
            <MyFilterList @update-filter="handleUpdateFilter" />
          </div>
        </q-drawer>
        <q-page-container class="issue-list-container">
          <IssuesTable
            ref="issuesTableRef"
            v-model:aql-mode="aqlMode"
            @toggle="toggleDrawer()"
            :current-filter="currentFilter"
          />
        </q-page-container>
      </q-layout>
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
import AqlFilterList from 'src/modules/search-issues/aql/ui/AqlFilterList.vue';
import AqlHistoryList from 'src/modules/search-issues/aql/ui/AqlHistoryList.vue';
import { getFilters, getMyFilters } from '../services/api';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const filtersStore = useFiltersStore();

const currentFilter = ref<TypesIssuesListFilters | undefined | null>(null);
const leftDrawerOpen = ref(true);
const aqlMode = ref(false);
const issuesTableRef = ref<InstanceType<typeof IssuesTable> | null>(null);
const defineDrawerWidth = computed(() => (Screen.width > 1280 ? 300 : 200));

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleUpdateFilter = async (
  filter: TypesIssuesListFilters | undefined | null,
) => {
  currentFilter.value = filter;
  await refresh();
};

const handleSelectAqlQuery = (query: string) => {
  issuesTableRef.value?.searchAql(query);
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
  // поля по бокам те же, что сверху и снизу при высоте 90vh
  min-width: calc(100vw - 10vh) !important;
  border-radius: 16px !important;
  height: 90vh;
  @media screen and (max-width: 1280px) {
    min-width: 100% !important;
  }
}
.issue-list-container {
  height: 100%;
}
.filter-list-wrapper {
  height: 100%;
}
// фильтры занимают не больше половины меню, остальное — история
.aql-menu {
  height: 100%;
  display: flex;
  flex-direction: column;

  &__filters {
    flex: 0 1 auto;
    max-height: 50%;
  }

  &__history {
    flex: 1 1 0;
    min-height: 0;
  }
}
:deep(.absolute-full) {
  right: 0 !important;
}
</style>
