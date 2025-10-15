<template>
  <q-dialog
    ref="dialogRef"
    @show="refresh"
    @hide="() => filtersStore.resetColumns()"
  >
    <q-card class="sprint-dialog-card" container>
      <q-card-section
        class="row items-center justify-between"
        style="width: 100%"
      >
        <span class="text-h6">Создание спринта</span>
        <q-btn flat dense @click="dialogRef?.hide()">
          <q-icon name="close" dense size="18px" /> </q-btn
      ></q-card-section>
      <q-card-section class="row sprint-dialog__layout" container>
        <MyFilterList
          class="col-3"
          @update-filter="handleUpdateFilter"
          style="display: flex; flex-direction: column; max-height: 100%"
        />
        <div class="fit col row sprint-container">
          <IssuesTable
            v-model:checked-rows="checkedIssues"
            class="col-7"
            selection="multiple"
            style="padding: 0"
            @toggle="toggleDrawer()"
            :current-filter="currentFilter"
          />

          <CreateSprintForm
            v-model:issues="checkedIssues"
            class="col no-wrap"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { QDialog } from 'quasar';
import { ref } from 'vue';
// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
//utils
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  getFilters,
  getMyFilters,
} from 'src/modules/search-issues/services/api';
//components
import CreateSprintForm from './components/CreateSprintForm.vue';
import { MyFilterList } from 'src/modules/search-issues/filter-list/ui';
import IssuesTable from 'src/modules/search-issues/ui/IssuesTable.vue';

const filtersStore = useFiltersStore();

const currentFilter = ref<TypesIssuesListFilters | undefined | null>(null);
const leftDrawerOpen = ref(true);

const dialogRef = ref<InstanceType<typeof QDialog> | null>(null);

const checkedIssues = ref<any[]>([]);

const toggleDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};

const handleUpdateFilter = async (
  filter: TypesIssuesListFilters | undefined | null,
) => {
  currentFilter.value = filter;
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
</style>
