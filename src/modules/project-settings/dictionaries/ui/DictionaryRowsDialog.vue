<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emits('update:modelValue', $event)"
  >
    <q-card style="width: min(900px, 95vw); border-radius: 12px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Строки справочника: {{ dictionary?.name }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="row items-center q-mb-sm q-gutter-sm wrap">
          <q-input
            v-model="searchQuery"
            label="Поиск"
            dense
            class="base-input"
            style="width: 300px; max-width: 100%"
            @update:model-value="handleSearch"
          >
            <template v-slot:prepend>
              <SearchIcon />
            </template>
          </q-input>
          <q-checkbox
            v-model="includeArchived"
            label="Показывать архивные"
            dense
            @update:model-value="onRequest({ pagination: pagination })"
          />
          <q-space />
          <q-btn
            flat
            dense
            no-caps
            class="secondary-btn"
            icon="upload"
            label="Импорт"
            @click="showImportDialog = true"
          />
          <q-btn
            flat
            dense
            no-caps
            class="primary-btn"
            icon="add"
            label="Добавить строку"
            @click="openCreateRow"
          />
        </div>

        <!-- горизонтальный скролл таблицы на узких экранах -->
        <div style="overflow-x: auto">
          <q-table
            flat
            :columns="columns"
            :rows="rows"
            row-key="id"
            :hide-no-data="!loading"
            :loading="loading"
            loading-label="Загружается..."
            :rows-per-page-options="[10, 25, 50, 100]"
            v-model:pagination="pagination"
            @request="onRequest"
            style="max-height: 60vh"
          >
          <template #pagination>
            <PaginationDefault
              v-model:selected-page="pagination.page"
              :rows-number="pagination.rowsNumber"
              :rows-per-page="pagination.rowsPerPage"
              @update:selectedPage="() => onRequest({ pagination })"
            />
          </template>

          <template v-slot:body-cell-value="props">
            <q-td :props="props">
              <span :class="{ 'text-grey': props.row.archived }">
                {{ props.row.value }}
              </span>
            </q-td>
          </template>

          <template v-slot:body-cell-archived="props">
            <q-td :props="props">
              <q-badge v-if="props.row.archived" color="grey-6">В архиве</q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="q-gutter-x-xs">
              <q-btn dense flat @click="editRow(props.row)">
                <EditIcon />
                <HintTooltip> Редактировать </HintTooltip>
              </q-btn>

              <q-btn dense flat @click="toggleArchive(props.row)">
                <q-icon
                  :name="props.row.archived ? 'unarchive' : 'archive'"
                  size="20px"
                  color="grey"
                />
                <HintTooltip>
                  {{ props.row.archived ? 'Восстановить' : 'Архивировать' }}
                </HintTooltip>
              </q-btn>

              <q-btn dense flat @click="confirmDeleteRow(props.row)">
                <BinIcon color="#DC3E3E" />
                <HintTooltip> Удалить </HintTooltip>
              </q-btn>
            </q-td>
          </template>
          </q-table>
        </div>
      </q-card-section>
    </q-card>

    <DictionaryRowEditModal
      v-model="showRowEditModal"
      :edit-item="rowToEdit"
      @submit="handleRowSubmit"
    />

    <DictionaryImportDialog
      v-model="showImportDialog"
      :dictionary-id="dictionary?.id"
      @imported="handleImported"
    />

    <!-- подтверждение удаления строки -->
    <q-dialog v-model="showRowDeleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">Удалить строку?</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Строка «{{ rowToDelete?.value }}» будет удалена.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Отмена"
            class="secondary-btn"
            style="width: 100px"
            v-close-popup
            no-caps
          />
          <q-btn
            flat
            label="Удалить"
            class="delete-btn"
            style="width: 100px"
            :loading="isDeletingRow"
            @click="deleteRow"
            v-close-popup
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- на строку ссылаются задачи — предложить архивировать -->
    <q-dialog v-model="showArchiveSuggestion" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <div class="text-h6">На строку ссылаются задачи</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          Строку «{{ rowToArchive?.value }}» удалить нельзя — она используется
          в значениях задач. Строку можно заархивировать: она перестанет
          выбираться, но её значение в задачах сохранится.
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Отмена"
            class="secondary-btn"
            style="width: 110px"
            v-close-popup
            no-caps
          />
          <q-btn
            flat
            label="Архивировать"
            class="primary-btn"
            style="width: 130px"
            :loading="isArchivingRow"
            @click="archiveRowFromSuggestion"
            v-close-popup
            no-caps
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
//core
import { ref, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { debounce } from 'quasar';

//stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

//components
import DictionaryRowEditModal from './DictionaryRowEditModal.vue';
import DictionaryImportDialog from './DictionaryImportDialog.vue';
import PaginationDefault from 'components/pagination/PaginationDefault.vue';
import SearchIcon from 'src/components/icons/SearchIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import HintTooltip from 'src/components/HintTooltip.vue';

//services
import {
  Dictionary,
  DictionaryRow,
  getDictionaryRows,
  createDictionaryRow,
  updateDictionaryRow,
  deleteDictionaryRow,
  ROW_IN_USE_ERROR_CODE,
} from '../services/api';

//interfaces
import { IQuasarPaginationValues } from 'src/interfaces/issues';

const props = defineProps<{
  modelValue: boolean;
  dictionary: Dictionary | null;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'changed'): void;
}>();

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const rows = ref<DictionaryRow[]>([]);
const loading = ref(false);
const searchQuery = ref('');
const includeArchived = ref(false);

const pagination = ref<IQuasarPaginationValues>({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
});

const showRowEditModal = ref(false);
const rowToEdit = ref<DictionaryRow | null>(null);

const showImportDialog = ref(false);

const showRowDeleteConfirm = ref(false);
const rowToDelete = ref<DictionaryRow | null>(null);
const isDeletingRow = ref(false);

const showArchiveSuggestion = ref(false);
const rowToArchive = ref<DictionaryRow | null>(null);
const isArchivingRow = ref(false);

//consts
const columns = [
  {
    name: 'value',
    label: 'Значение',
    field: 'value',
    align: 'left' as const,
    style: 'max-width: 300px; overflow: hidden; text-overflow: ellipsis',
  },
  {
    name: 'attrs',
    label: 'Атрибуты',
    field: 'attrs',
    align: 'left' as const,
    format: (val: any) => formatAttrs(val),
  },
  {
    name: 'archived',
    label: 'Статус',
    field: 'archived',
    align: 'left' as const,
  },
  {
    name: 'actions',
    label: '',
    field: 'id',
    align: 'left' as const,
  },
];

//methods
const formatAttrs = (attrs: any): string => {
  if (!attrs || Object.keys(attrs).length === 0) return '—';
  const text = JSON.stringify(attrs);
  return text.length > 60 ? `${text.slice(0, 60)}…` : text;
};

const dictionaryId = computed(() => props.dictionary?.id || '');

async function onRequest(p: { pagination: IQuasarPaginationValues }) {
  const { page, rowsPerPage, rowsNumber } = p.pagination;
  if (!dictionaryId.value) return;

  loading.value = true;
  try {
    const res = await getDictionaryRows(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      dictionaryId.value,
      {
        offset: (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage),
        limit: rowsPerPage == 0 ? rowsNumber || 10 : rowsPerPage,
        search_query: searchQuery.value || undefined,
        include_archived: includeArchived.value || undefined,
      },
    );
    pagination.value.rowsNumber = res.count ?? 0;
    pagination.value.page = page;
    pagination.value.rowsPerPage = res.limit || rowsPerPage;
    rows.value = res.result || [];
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка получения строк',
    });
  } finally {
    loading.value = false;
  }
}

const handleSearch = debounce(async () => {
  pagination.value.page = 1;
  await onRequest({ pagination: pagination.value });
}, 700);

const refresh = async () => {
  await onRequest({ pagination: pagination.value });
  emits('changed');
};

const openCreateRow = () => {
  rowToEdit.value = null;
  showRowEditModal.value = true;
};

const editRow = (row: DictionaryRow) => {
  rowToEdit.value = { ...row };
  showRowEditModal.value = true;
};

const handleRowSubmit = async (data: { value: string; attrs?: Record<string, any> }) => {
  try {
    if (rowToEdit.value?.id) {
      await updateDictionaryRow(
        currentWorkspaceSlug.value as string,
        currentProjectID.value,
        dictionaryId.value,
        rowToEdit.value.id,
        { ...data },
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Строка обновлена',
      });
    } else {
      await createDictionaryRow(
        currentWorkspaceSlug.value as string,
        currentProjectID.value,
        dictionaryId.value,
        data,
      );
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Строка добавлена',
      });
    }
    showRowEditModal.value = false;
    await refresh();
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка сохранения',
    });
  }
};

const toggleArchive = async (row: DictionaryRow) => {
  if (!row.id) return;
  try {
    await updateDictionaryRow(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      dictionaryId.value,
      row.id,
      { archived: !row.archived },
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: row.archived ? 'Строка восстановлена' : 'Строка архивирована',
    });
    await refresh();
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка архивации',
    });
  }
};

const confirmDeleteRow = (row: DictionaryRow) => {
  rowToDelete.value = row;
  showRowDeleteConfirm.value = true;
};

const deleteRow = async () => {
  if (!rowToDelete.value?.id) return;
  isDeletingRow.value = true;
  try {
    await deleteDictionaryRow(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      dictionaryId.value,
      rowToDelete.value.id,
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Строка удалена',
    });
    await refresh();
  } catch (e: any) {
    console.error(e);
    // 4514 — на строку ссылаются задачи, предложить архивировать
    if (e?.response?.data?.code === ROW_IN_USE_ERROR_CODE) {
      rowToArchive.value = rowToDelete.value;
      showArchiveSuggestion.value = true;
    } else {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: 'Ошибка удаления',
      });
    }
  } finally {
    isDeletingRow.value = false;
    rowToDelete.value = null;
  }
};

const archiveRowFromSuggestion = async () => {
  if (!rowToArchive.value?.id) return;
  isArchivingRow.value = true;
  try {
    await updateDictionaryRow(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      dictionaryId.value,
      rowToArchive.value.id,
      { archived: true },
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Строка архивирована',
    });
    await refresh();
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка архивации',
    });
  } finally {
    isArchivingRow.value = false;
    rowToArchive.value = null;
  }
};

const handleImported = () => {
  refresh();
};

//lifecycle hooks
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      searchQuery.value = '';
      includeArchived.value = false;
      pagination.value.page = 1;
      onRequest({ pagination: pagination.value });
    }
  },
);
</script>
