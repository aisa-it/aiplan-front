<template>
  <q-dialog ref="dialogRef">
    <q-card :class="`dialog ${isDesktop ? 'q-pa-lg' : 'q-pa-md'}`">
      <header class="dialog__header">
        <h5 class="dialog__heading">Настройка таблицы задач</h5>
        <q-btn
          v-if="!$q.screen.lt.sm"
          flat
          dense
          rounded
          icon="close"
          @click="closeDialog"
        />
      </header>

      <q-layout view="lhr lpR lfr" class="table-issue">
        <q-drawer
          v-model="leftDrawerOpen"
          :width="defineDrawerWidth"
          :breakpoint="500"
          class="no-wrap q-pr-lg table-issue__drawer"
          side="left"
          show-if-above
          bordered
        >
          <MyFilterList @update-filter="handleUpdateFilter" />
        </q-drawer>

        <q-page-container style="height: 100%">
          <IssuesTable
            v-model:checked-rows="checkedIssues"
            :class="[
              'table-issue__issues',
              { 'q-ml-lg': leftDrawerOpen, 'q-mr-lg': rightDrawerOpen },
            ]"
            :current-filter="currentFilter"
            selection="multiple"
            is-table-issues
            @toggle="toggleLeftDrawer()"
            @toggle-right="toggleRightDrawer()"
          />
        </q-page-container>

        <q-drawer
          v-model="rightDrawerOpen"
          :width="defineDrawerWidth"
          :breakpoint="500"
          class="no-wrap q-pl-lg table-issue__drawer"
          side="right"
          show-if-above
          bordered
        >
          <div class="table-issue__parameters">
            <q-select
              v-model="chosenTableColumns"
              :options="tableColumns"
              class="base-selector"
              label="Колонки"
              use-input
              multiple
              dense
              @new-value="addChosenColumns"
              @filter="filterFn"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    Не выбрано
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input
              v-model="additionalColumnsNumber"
              class="base-input"
              label="Количество дополнительных колонок"
              dense
            />

            <div class="table-issue__selected-issues col">
              <p class="centered-horisontally">
                <LinkIcon />
                <span class="q-ml-sm">Задачи</span>
              </p>

              <SelectSprintIssues
                v-if="checkedIssues.length > 0"
                :issues="checkedIssues"
                class="visible-scroll issues-scroll"
                @delete="(id) => deleteIssueById(id)"
              />
            </div>

            <q-btn class="primary-btn full-w q-mb-sm" flat dense no-caps>
              Создать/обновить таблицу задач
            </q-btn>
          </div>
        </q-drawer>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { QDialog, useQuasar } from 'quasar';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

import {
  getFilters,
  getMyFilters,
} from 'src/modules/search-issues/services/api';
import MyFilterList from 'src/modules/search-issues/filter-list/ui/MyFilterList.vue';
import IssuesTable from 'src/modules/search-issues/ui/IssuesTable.vue';
import SelectSprintIssues from 'src/modules/sprints/create-sprint-dialog/components/SelectSprintIssues.vue';
import LinkIcon from '../icons/LinkIcon.vue';

import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const workspaceStore = useWorkspaceStore();
const filtersStore = useFiltersStore();

const $q = useQuasar();
const isDesktop = computed(() => $q.platform.is?.desktop);
const dialogRef = ref<QDialog | null>();

// 1 столбец
const currentFilter = ref<TypesIssuesListFilters | undefined | null>({
  workspaces: [workspaceStore.workspaceInfo?.id ?? ''],
  search_query: '',
});

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

const refresh = async () => {
  for (const key in filtersStore.columnsToShow) {
    filtersStore.columnsToShow[key as keyof typeof filtersStore.columnsToShow] =
      ['sequence_id', 'name', 'priority', 'state'].includes(key);
  }
  await refreshFilters();
  await refreshMyFilters();
};

// 2 столбец
const checkedIssues = ref<any[]>([]);

// Сворачивание боковинок
const leftDrawerOpen = ref(isDesktop.value);
const rightDrawerOpen = ref(true);
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value;
};
const toggleRightDrawer = () => {
  rightDrawerOpen.value = !rightDrawerOpen.value;
};

const defineDrawerWidth = computed(() => ($q.screen.width > 1280 ? 300 : 200));

const deleteIssueById = (id: string) => {
  checkedIssues.value = checkedIssues.value.filter((el) => el.id !== id);
};

// 3 столбец
const additionalColumnsNumber = ref<number | undefined>(2);

const chosenTableColumns = ref<string[] | null>(null);
const tableColumns: string[] = ['Название', 'Приоритет', 'Статус']; // TODO Полный список колонок получать
const restTableColumns = ref<string[]>(tableColumns);

function addChosenColumns(val, done): void {
  if (val.length > 0) {
    const modelValue: string[] = (chosenTableColumns.value || []).slice();

    val
      .split(/[,;|]+/)
      .map((v: string) => v.trim())
      .filter((v: string) => v.length > 0)
      .forEach((v: string) => {
        if (tableColumns.includes(v) === false) {
          tableColumns.push(v);
        }
        if (modelValue.includes(v) === false) {
          modelValue.push(v);
        }
      });

    done(null);
    chosenTableColumns.value = modelValue;
  }
}

function filterFn(val, update): void {
  update(() => {
    if (val === '') {
      restTableColumns.value = tableColumns;
    } else {
      const needle = val.toLowerCase();
      restTableColumns.value = tableColumns.filter(
        (v) => v.toLowerCase().indexOf(needle) > -1,
      );
    }
  });
}

// Диалоговое окно
function closeDialog(): void {
  dialogRef.value?.hide();
}

function createTableIssue(): void {
  closeDialog();
}

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
.dialog {
  width: 100%;
  max-width: 80vw;
  height: 90vh;
  border-radius: 16px;
  overflow: hidden;

  &__header {
    display: flex;
    width: 100%;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  &__heading {
    margin: 0;
  }
}

.table-issue {
  margin-top: 16px;

  &:deep(.q-drawer) {
    position: absolute;
  }

  &__issues {
    padding: 0 !important;

    &:deep(.sticky-fix) {
      padding: 0 !important;
      bottom: -10px;
    }
  }

  &__parameters {
    display: flex;
    flex-direction: column;
    gap: 24px;
    min-height: 80%;
  }
}
</style>
