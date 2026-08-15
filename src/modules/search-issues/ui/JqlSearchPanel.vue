<template>
  <div class="jql-panel column">
    <div class="jql-panel__input row no-wrap items-start q-pa-sm">
      <div class="jql-input-wrap relative-position full-w">
        <q-input
          v-model="query"
          class="base-input jql-input"
          dense
          autogrow
          type="textarea"
          label="JQL-запрос"
          :error="!!errorText"
          @keydown.enter.prevent="run"
        >
          <template v-slot:append>
            <q-btn flat dense round icon="help_outline" size="10px">
              <q-popup-proxy class="jql-help-popup">
                <div class="jql-help">
                  <div class="text-subtitle2 q-mb-xs">Синтаксис JQL</div>
                  <div class="q-mb-xs text-caption">Поля: project, status, priority, assignee, author, watcher, label, sprint, created, updated, start, target, text</div>
                  <div class="q-mb-xs text-caption">Операторы: =&nbsp;!=&nbsp;~&nbsp;&gt;&nbsp;&lt;&nbsp;&gt;=&nbsp;&lt;=&nbsp;IN&nbsp;NOT IN&nbsp;IS EMPTY&nbsp;IS NOT EMPTY</div>
                  <div class="q-mb-xs text-caption">Связки: AND, OR, NOT; даты: 2026-01-01 или -7d (-2w, -1m); currentUser()</div>
                  <div class="text-caption">Пример: project = "PRJ" AND updated &gt; -7d ORDER BY priority DESC</div>
                </div>
              </q-popup-proxy>
            </q-btn>
          </template>
        </q-input>
      </div>
      <q-btn
        no-caps
        class="primary-btn q-ml-sm"
        :loading="loading"
        @click="run"
        >Найти</q-btn
      >
      <q-btn
        no-caps
        no-wrap
        class="secondary-btn q-ml-xs jql-save-btn"
        :disable="!hasResults"
        @click="saveDialogOpen = true"
        >Сохранить запрос</q-btn
      >
    </div>

    <div v-if="errorText" class="jql-panel__error q-px-md q-pb-sm text-negative text-caption">
      {{ errorText }}
    </div>

    <div v-if="query && !loading && !errorText && hasResults" class="jql-panel__hint q-px-md text-caption text-grey-7">
      Всего задач: {{ total }}
    </div>

    <div class="jql-panel__results col q-px-sm">
      <IssuesTableUI
        v-if="!loading && rows.length"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        pagination-inside-mode
        :pagination-rows-number="total"
        @request="onTableRequest"
      />
      <div
        v-show="loading || rows.length === 0"
        class="centered-horisontally justify-center"
        style="height: 60vh"
      >
        <DefaultLoader v-if="loading" />
        <div v-else-if="query && !errorText" class="text-center">
          <h6>Задачи не найдены</h6>
          <div class="text-caption text-grey-7">
            Попробуйте изменить запрос или проверьте синтаксис
          </div>
        </div>
        <div v-else-if="!query" class="text-center">
          <h6>Введите JQL-запрос</h6>
          <div class="text-caption text-grey-7">
            Например: project = "PRJ" AND assignee = currentUser()
          </div>
        </div>
      </div>
    </div>

    <q-dialog v-model="saveDialogOpen">
      <q-card style="min-width: 400px; border-radius: 16px">
        <q-card-section>
          <div class="text-h6">Сохранить запрос</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <q-input
            ref="saveNameRef"
            v-model="saveName"
            dense
            label="Название"
            class="base-input q-mb-sm"
            :rules="[(v) => (v && v.length > 0) || 'Необходимо ввести название']"
          />
          <q-input
            v-model="saveDescription"
            dense
            type="textarea"
            label="Описание"
            class="base-input"
            autogrow
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn no-caps flat label="Отмена" v-close-popup class="text-grey-8" />
          <q-btn
            no-caps
            class="primary-btn"
            label="Сохранить"
            :loading="saving"
            @click="saveFilter"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// stores
import { useNotificationStore } from 'src/stores/notification-store';

// services
import { jqlSearch } from 'src/modules/search-issues/services/api';
import { createSearchFilter } from 'src/modules/search-issues/filter-list/services/api';

// components
import IssuesTableUI from './IssuesTableUI.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

// utils
import { formatDateTime } from 'src/utils/time';

const emits = defineEmits<{
  (e: 'saved'): void;
}>();

const { setNotificationView } = useNotificationStore();

// ---------------------------------------------------------------------------
// Состояние
// ---------------------------------------------------------------------------
const query = ref('');
const rows = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const errorText = ref('');
const hasResults = ref(false);

const pagination = ref({
  sortBy: null as string | null,
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0,
});

// ---------------------------------------------------------------------------
// Поиск
// ---------------------------------------------------------------------------
const run = async () => {
  const q = query.value.trim();
  errorText.value = '';
  if (!q) {
    rows.value = [];
    total.value = 0;
    hasResults.value = false;
    return;
  }
  loading.value = true;
  try {
    const data = await jqlSearch(
      q,
      pagination.value.rowsPerPage,
      (pagination.value.page - 1) * pagination.value.rowsPerPage,
    );
    rows.value = data.issues ?? [];
    total.value = data.count ?? 0;
    hasResults.value = true;
    pagination.value.rowsNumber = total.value;
  } catch (e: any) {
    rows.value = [];
    total.value = 0;
    hasResults.value = false;
    errorText.value =
      e?.response?.data?.error ??
      'Не удалось выполнить запрос. Проверьте синтаксис.';
  } finally {
    loading.value = false;
  }
};

const onTableRequest = async (req: any) => {
  if (req?.page) pagination.value.page = req.page;
  if (req?.rowsPerPage) pagination.value.rowsPerPage = req.rowsPerPage;
  await run();
};

// ---------------------------------------------------------------------------
// Сохранение
// ---------------------------------------------------------------------------
const saveDialogOpen = ref(false);
const saving = ref(false);
const saveName = ref('');
const saveDescription = ref('');
const saveNameRef = ref();

const saveFilter = async () => {
  saveNameRef.value?.validate();
  if (saveNameRef.value?.hasError) return;
  saving.value = true;
  try {
    await createSearchFilter({
      name: saveName.value,
      description: saveDescription.value,
      public: false,
      jql: query.value.trim(),
    });
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'JQL-запрос сохранён в фильтры',
    });
    saveDialogOpen.value = false;
    saveName.value = '';
    saveDescription.value = '';
    emits('saved');
  } catch {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Не удалось сохранить запрос',
    });
  } finally {
    saving.value = false;
  }
};

// ---------------------------------------------------------------------------
// Внешнее управление
// ---------------------------------------------------------------------------
const runQuery = (q: string) => {
  query.value = q;
  pagination.value.page = 1;
  run();
};

defineExpose({ runQuery });

// ---------------------------------------------------------------------------
// Колонки таблицы (как в IssuesTable)
// ---------------------------------------------------------------------------
const columns = [
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'sequence_id',
    label: 'ID',
    align: 'left',
    field: (row: any) => {
      return `${row.project_detail?.identifier} - ${row.sequence_id}`;
    },
    sortable: false,
  },
  {
    style:
      'text-overflow: ellipsis; white-space: nowrap ;overflow: hidden; max-width: 250px; min-width: 250px',
    name: 'name',
    align: 'left',
    label: 'Название',
    field: (row: any) => {
      return row.name_highlighted || row.name;
    },
    sortable: false,
  },
  {
    style: 'width: 10px',
    name: 'priority',
    align: 'left',
    label: 'Приоритет',
    field: (row: any) => {
      return row.priority;
    },
    sortable: false,
  },
  {
    style: 'width: 10px',
    name: 'state',
    align: 'left',
    label: 'Статус',
    field: (row: any) => {
      return row.state_detail;
    },
    sortable: false,
  },
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'target_date',
    align: 'left',
    label: 'Срок исполнения',
    field: (row: any) => {
      return row.target_date ? formatDateTime(row.target_date) : '-';
    },
    sortable: false,
  },
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    sortable: false,
  },
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'updated_at',
    align: 'left',
    label: 'Последнее изменение',
    field: (row: any) => {
      return formatDateTime(row.updated_at);
    },
    sortable: false,
  },
  {
    style: 'width: 10px',
    name: 'author',
    align: 'left',
    label: 'Автор',
    field: (row: any) => {
      return row.author_detail;
    },
    sortable: false,
  },
  {
    style: 'width: 10px',
    name: 'assignees',
    align: 'center',
    label: 'Исполнитель',
    field: (row: any) => {
      return row.assignee_details;
    },
    sortable: false,
  },
  {
    style: 'width: 10px',
    name: 'labels',
    align: 'left',
    label: 'Теги',
    field: (row: any) => {
      return row.label_details;
    },
    sortable: false,
  },
];
</script>

<style scoped lang="scss">
.jql-panel {
  height: 100%;
  min-height: 0;
  position: relative;
}

.jql-panel__input {
  flex-shrink: 0;
  align-items: flex-start;
}

.jql-input-wrap {
  position: relative;
}

.jql-input {
  :deep(.q-field__native) {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 0.9rem;
  }
}

.jql-panel__results {
  min-height: 0;
  overflow: hidden;
}

.jql-save-btn {
  flex-shrink: 0;

  :deep(.q-btn__content) {
    white-space: nowrap;
  }
}

.jql-help {
  padding: 12px 14px;
  max-width: 380px;
  line-height: 1.5;
}

.jql-help-popup :deep(.q-menu) {
  background: #fff;
}
</style>
