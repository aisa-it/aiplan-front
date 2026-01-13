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
              :options="columnOptionsMap"
              option-label="label"
              option-value="key"
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

            <q-btn
              class="primary-btn full-w q-mb-sm"
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

import { formatDateTime } from 'src/utils/time';

import {
  DtoIssue,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Editor } from '@tiptap/core';

const workspaceStore = useWorkspaceStore();
const filtersStore = useFiltersStore();

const $q = useQuasar();
const isDesktop = computed<boolean>(() => $q.platform.is?.desktop);
const dialogRef = ref<QDialog | null>();

const props = defineProps<{
  editorInstance: Editor;
  classPrevent?: string;
}>();

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
const checkedIssues = ref<DtoIssue[]>([]);

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

// Взято с IssuesTable, тоже в constants
const priorities = {
  urgent: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  null: 'Нет',
};

// TODO вынести в constants, для всех фильтров подойдет
const columnOptionsMap: { label: string; key: string }[] = [
  { label: 'Название', key: 'name' },
  { label: 'Приоритет', key: 'priority' },
  { label: 'Статус', key: 'state' },
  { label: 'Срок исполнения', key: 'target_date' },
  { label: 'Дата создания', key: 'created_at' },
  { label: 'Последнее изменение', key: 'updated_at' },
  { label: 'Автор', key: 'author' },
  { label: 'Исполнитель', key: 'assignees' },
  { label: 'Теги', key: 'labels' },
];
const chosenTableColumns = ref<typeof columnOptionsMap>([]);
const restTableColumns = ref<typeof columnOptionsMap>([]);

function addChosenColumns(
  val: string,
  done: (val?: string | null) => void,
): void {
  if (!val?.trim()) {
    done(null);
    return;
  }

  const labels = val
    .split(/[,;|]+/)
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  const currentKeys = new Set(chosenTableColumns.value.map((col) => col.key));
  const newSelection = [...chosenTableColumns.value];

  labels.forEach((label) => {
    const found = columnOptionsMap.find((col) => col.label === label);
    if (found && !currentKeys.has(found.key)) {
      newSelection.push(found);
      currentKeys.add(found.key);
    }
  });

  chosenTableColumns.value = newSelection;
  done(null);
}

function filterFn(val: string, update: (fn: () => void) => void): void {
  update(() => {
    if (!val) {
      restTableColumns.value = columnOptionsMap;
    } else {
      restTableColumns.value = columnOptionsMap.filter((col) =>
        col.label.toLowerCase().includes(val.toLowerCase()),
      );
    }
  });
}

function closeDialog(): void {
  dialogRef.value?.hide();
}
// TODO в helpers
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const createIssueTable = (): void => {
  const cols = chosenTableColumns.value;
  const extraCols = Math.max(0, additionalColumnsNumber.value || 0);

  // Заголовки
  const headerCells = cols.map((col) => {
    const text = col.label.trim();
    const safeText = text === '' ? '&nbsp;' : escapeHtml(text);
    return `<th>${safeText}</th>`;
  });
  for (let i = 0; i < extraCols; i++) {
    headerCells.push('<th>&nbsp;</th>');
  }
  const thead = `<thead><tr>${headerCells.join('')}</tr></thead>`;

  // Строки данных
  const bodyRows = checkedIssues.value
    .map((issue) => {
      const cells = cols.map((col) => {
        let displayValue: string;

        switch (col.key) {
          case 'name':
            displayValue = issue.name || '-';
            break;

          case 'sequence_id':
            displayValue = String(issue.sequence_id || '-');
            break;

          case 'priority':
            displayValue =
              priorities[issue.priority as keyof typeof priorities] ||
              issue.priority ||
              '-';
            break;

          case 'state':
            displayValue = issue.state_detail?.name || '-';
            break;

          case 'author':
            displayValue =
              issue.author_detail?.username ||
              issue.author_detail?.email ||
              '-';
            break;

          case 'assignees':
            if (Array.isArray(issue.assignee_details)) {
              displayValue =
                issue.assignee_details
                  .map((a: any) => a.username || a.email || '')
                  .filter(Boolean)
                  .join(', ') || '-';
            } else {
              displayValue = '-';
            }
            break;

          case 'labels':
            if (Array.isArray(issue.label_details)) {
              displayValue =
                issue.label_details
                  .map((l: any) => l.name || '')
                  .filter(Boolean)
                  .join(', ') || '-';
            } else {
              displayValue = '-';
            }
            break;

          case 'target_date':
          case 'created_at':
          case 'updated_at':
            displayValue = issue[col.key]
              ? formatDateTime(issue[col.key])
              : '-';
            break;

          default:
            displayValue =
              issue[col.key] !== null ? String(issue[col.key]) : '-';
        }

        let text = String(displayValue).trim();
        // text = text === '-' || text === '' ? '&nbsp;' : escapeHtml(text); - убирать прочерки
        text = text === '' ? '&nbsp;' : escapeHtml(text);
        return `<td>${text}</td>`;
      });

      for (let i = 0; i < extraCols; i++) {
        cells.push('<td>&nbsp;</td>');
      }

      return `<tr>${cells.join('')}</tr>`;
    })
    .join('');

  const tbody = bodyRows ? `<tbody>${bodyRows}</tbody>` : '';
  const tableHtml = `<table>${thead}${tbody}</table>`.trim();

  props.editorInstance.chain().focus().insertContent(tableHtml).run();
  closeDialog();
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
