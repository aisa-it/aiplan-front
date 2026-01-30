<template>
  <q-dialog
    ref="dialogRef"
    class="prevent-click-issue-outside"
    @show="handleOpenDialog"
    @hide="handleCloseDialog"
  >
    <q-card :class="`dialog ${isDesktop ? 'q-pa-lg' : 'q-pa-md'}`">
      <header class="dialog__header">
        <h5 class="dialog__heading">Настройка таблицы задач</h5>
        <q-btn
          v-if="!$q.screen.lt.sm"
          flat
          dense
          rounded
          icon="close"
          @click="handleCloseDialog"
        />
      </header>

      <q-layout view="hHh LpR lff" class="table-issue" container>
        <q-drawer
          v-model="leftDrawerOpen"
          :width="drawerWidth"
          :breakpoint="500"
          class="no-wrap q-pr-lg q-pb-lg table-issue__drawer"
          side="left"
          show-if-above
          bordered
        >
          <MyFilterList single-workspace @update-filter="handleUpdateFilter" />
        </q-drawer>

        <q-page-container>
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
          :width="drawerWidth"
          :breakpoint="500"
          class="no-wrap q-pl-lg q-pb-lg table-issue__drawer"
          side="right"
          show-if-above
          bordered
        >
          <div class="table-issue__parameters">
            <q-select
              v-model="chosenTableColumns"
              :options="COLUMN_FILTERS_MAP"
              option-label="label"
              option-value="key"
              class="base-selector"
              label="Колонки"
              multiple
              dense
              @new-value="addChosenColumns"
              @filter="handleSelectFilter"
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

            <div class="table-issue__selected-issues">
              <p class="table-issue__selected-heading">
                <LinkIcon />
                <span class="q-ml-sm">Задачи</span>
              </p>

              <SelectSprintIssues
                v-if="checkedIssues.length > 0"
                :issues="checkedIssues"
                class="table-issue__selected-list visible-scroll issues-scroll"
                @delete="(id) => removeCheckedIssue(id)"
              />
            </div>

            <q-btn
              class="primary-btn full-w q-mb-md"
              flat
              dense
              no-caps
              @click="createIssueTable"
            >
              Создать/обновить таблицу задач
            </q-btn>
          </div>
        </q-drawer>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { QDialog, useQuasar } from 'quasar';
import { Editor } from '@tiptap/core';

import MyFilterList from 'src/modules/search-issues/filter-list/ui/MyFilterList.vue';
import IssuesTable from 'src/modules/search-issues/ui/IssuesTable.vue';
import SelectSprintIssues from 'src/modules/sprints/create-sprint-dialog/components/SelectSprintIssues.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';

import { useDialogDrawers } from '../composables/dialogs/useDialogDrawers';
import { useTableIssueDialog } from '../composables/dialogs/useTableIssueDialog';

import { COLUMN_FILTERS_MAP } from 'src/constants/tableFilters';

import { IIssueTableParams } from 'src/interfaces/tableIssue';

const props = defineProps<{
  editorInstance: Editor;
  savedTableData: { element: HTMLElement; params: IIssueTableParams } | null;
  classPrevent?: string;
}>();

const $q = useQuasar();
const isDesktop = computed<boolean>(() => $q.platform.is?.desktop);
const dialogRef = ref<QDialog | null>();

const {
  leftDrawerOpen,
  rightDrawerOpen,
  drawerWidth,
  toggleLeftDrawer,
  toggleRightDrawer,
} = useDialogDrawers(isDesktop.value, true);

const {
  currentFilter,
  checkedIssues,
  chosenTableColumns,
  additionalColumnsNumber,
  handleUpdateFilter,
  removeCheckedIssue,
  addChosenColumns,
  handleSelectFilter,
  createIssueTable,
  handleOpenDialog,
  handleCloseDialog,
} = useTableIssueDialog(props, dialogRef);
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

  &__issues {
    padding: 0 !important;

    &:deep(.sticky-fix) {
      padding: 0 !important;
    }

    &:deep(.pagination) {
      padding-bottom: 25px;
    }
  }

  &__parameters {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 24px;
  }

  &__selected-issues {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  &__selected-heading {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__selected-list {
    flex-grow: 1;
    overflow-y: auto;
  }
}
</style>
