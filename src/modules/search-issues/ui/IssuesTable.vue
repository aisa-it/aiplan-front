<template>
  <div style="height: 100%; padding: 0 10px 0 0">
    <div
      class="row no-wrap q-mb-sm sticky-fix top"
      :class="isAql ? 'items-start' : 'items-center'"
      :style="!isCreateSprint ? { padding: '20px 0 0' } : {}"
    >
      <q-btn
        flat
        dense
        round
        aria-label="Menu"
        style="height: 30px; width: 30px"
        class="q-ml-sm"
        :class="{ 'q-mr-sm': isCreateSprint, 'aql-top-control': isAql }"
        @click="emits('toggle')"
      >
        <MenuIcon />
      </q-btn>
      <!-- у значка меню свои поля: без внешнего отступа до кнопки те же 8px, что после неё -->
      <q-btn
        v-if="!isCreateSprint"
        no-caps
        label="AQL"
        :aria-pressed="isAql"
        class="aql-toggle q-mr-sm"
        :class="isAql ? 'primary-btn' : 'secondary-btn'"
        @click="isAql = !isAql"
      />
      <q-input
        v-if="!isAql"
        v-model="searchQuery"
        class="base-input full-w"
        dense
        label="Поиск"
        @update:model-value="handleSearchIssues"
      ></q-input>
      <AqlSearchBar
        v-else
        ref="aqlSearchBarRef"
        v-model:columns-to-show="columnsToShow"
        :model-value="aqlQuery"
        :error="aqlError"
        :loading="aqlLoading"
        :total="aqlTotal"
        :refreshable="aqlExecuted !== null"
        :columns="allColumns"
        @update:model-value="onAqlInput"
        @search="startAqlSearch"
        @refresh="onPaginationRequest"
      />

      <q-btn
        flat
        dense
        round
        style="height: 30px; width: 30px"
        class="q-ml-sm"
        v-if="!isCreateSprint && !isAql"
      >
        <FileZIPIcon />
        <q-tooltip>Скачать задачи архивом</q-tooltip>
        <q-popup-proxy ref="exportPopupRef">
          <q-card style="min-width: 300px">
            <q-card-section class="q-pa-md">
              <q-checkbox
                v-model="includeProperties"
                label="Выгружать дополнительные параметры"
              />
            </q-card-section>
            <q-card-actions align="right" class="q-px-md q-pb-md">
              <q-btn
                flat
                no-caps
                color="primary"
                label="Скачать"
                @click="downloadZip(pagination)"
              />
            </q-card-actions>
          </q-card>
        </q-popup-proxy>
      </q-btn>
      <q-btn
        v-if="!isAql"
        flat
        dense
        round
        style="height: 30px; width: 30px"
        class="q-ml-sm"
        @click="onRequest(pagination)"
      >
        <RefreshIcon />
        <q-tooltip>Обновить результаты поиска</q-tooltip>
      </q-btn>
      <q-btn
        v-if="!isAql"
        flat
        dense
        round
        style="height: 30px; width: 30px"
        class="q-ml-sm"
      >
        <Filterv2Icon />
        <q-tooltip>Настроить отображение</q-tooltip>
        <q-popup-proxy class="hide-scrollbar">
          <q-list style="width: 320px">
            <q-item class="row">
              <FilterColumnsOptions
                v-model:columns-to-show="columnsToShow"
                :columns="allColumns"
              />
            </q-item>
            <q-item class="row">
              <FilterGroupsOptions
                v-model:group_by="group_by"
                :options-group="SPRINT_GROUP_BY_OPTIONS"
                @update:group_by="onRequest(pagination)"
              />
            </q-item>
          </q-list>
        </q-popup-proxy>
      </q-btn>

      <q-btn
        v-if="isCreateSprint && !isMobile"
        flat
        dense
        round
        aria-label="Menu"
        style="height: 30px; width: 30px"
        class="q-mr-sm q-ml-sm"
        @click="emits('toggle-right')"
      >
        <MenuIcon />
      </q-btn>
    </div>
    <div
      v-if="isScopedToWorkspace && !isAql"
      class="search-scope-hint q-mb-sm q-ml-sm"
    >
      Показываются задачи текущего пространства. Для расширенного поиска
      воспользуйтесь фильтрами.
    </div>
    <IssuesTableUI
      v-if="!viewLoading && viewRows?.length && !isGrouped"
      :rows="viewRows"
      :columns="visibleColumns"
      :loading="viewLoading"
      :pagination="viewPagination"
      :selection="selection"
      :selected-rows="checkedRows"
      :is-create-sprint="isCreateSprint"
      :class="{ 'table-search': !isCreateSprint, 'table-aql': isAql }"
      @update:selected-rows="(v) => (checkedRows = v)"
      @request="onTableRequest"
    />

    <GroupedTablesWrapper
      v-if="!loading && rows?.length && isGrouped"
      :groups="rows"
      :group-by="group_by"
    >
      <template #default="{ group, index }">
        <IssuesTableUI
          :rows="group.issues"
          :columns="visibleColumns"
          :loading="loading"
          :selection="selection"
          :selected-rows="checkedRows"
          @update:selected-rows="
            (v) => (checkedRows = [...(checkedRows ?? []), ...v])
          "
          @request="(p) => onRequestGroupTable(group, p)"
          pagination-inside-mode
          :pagination-rows-number="group.count"
          class="table-in-groups"
        />
      </template>
    </GroupedTablesWrapper>

    <div
      class="sticky-fix bottom"
      :style="!isCreateSprint ? { padding: '0 0 10px' } : {}"
      v-if="!isGrouped && !isAqlIdle"
    >
      <PaginationDefault
        v-model:selected-page="viewPagination.page"
        v-model:rows-per-page="viewPagination.rowsPerPage"
        :rows-number="viewPagination.rowsNumber"
        :rows-per-page-options="
          Screen.height > 720 ? [10, 25, 50] : [5, 10, 25, 50]
        "
        show-rows-per-page
        @request="onPaginationRequest"
        class="pagination"
      />
      <!-- в режиме AQL счётчик стоит в строке кнопок под запросом -->
      <div
        v-if="!isAql"
        class="q-mr-md"
        :class="isMobile ? 'text-center' : 'text-right'"
        v-show="!viewLoading"
      >
        Всего: {{ viewPagination.rowsNumber }}
      </div>
    </div>
    <div
      v-show="viewLoading || viewRows?.length === 0"
      :style="{ height: `calc(90vh - ${emptyBlockOffset}px)` }"
      class="centered-horisontally justify-center"
    >
      <DefaultLoader v-if="viewLoading" />
      <div v-else-if="isAqlIdle" class="aql-idle-hint">
        Введите запрос и нажмите «Поиск»
      </div>
      <h6 v-else-if="viewRows?.length === 0">
        {{
          isCreateSprint
            ? 'Не найдено задач в данном пространстве'
            : 'Нет задач'
        }}
      </h6>
    </div>
  </div>
</template>

<script setup lang="ts">
import { debounce, Screen } from 'quasar';
import { onMounted, ref, watch, computed, nextTick } from 'vue';
import { useRoute } from 'vue-router';

// stores
import { useIssuesStore } from 'src/stores/issues-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useAqlStore } from 'src/modules/search-issues/aql/stores/aql-store';

// utils
import { formatDateTime } from 'src/utils/time';
import {
  getOrderBy,
  setOrderBy,
} from 'src/modules/search-issues/aql/utils/order';

// services
import {
  AqlQueryError,
  searchIssuesByAql,
} from 'src/modules/search-issues/aql/services/api';

// components
import IssuesTableUI from './IssuesTableUI.vue';
import AqlSearchBar from 'src/modules/search-issues/aql/ui/AqlSearchBar.vue';
import MenuIcon from 'src/components/icons/MenuIcon.vue';
import FileZIPIcon from 'src/components/icons/FileZIPIcon.vue';
import Filterv2Icon from 'src/components/icons/Filterv2Icon.vue';
import RefreshIcon from 'src/components/icons/RefreshIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import PaginationDefault from 'components/pagination/PaginationDefault.vue';
import FilterColumnsOptions from 'src/components/FilterColumnsOptions.vue';
import FilterGroupsOptions from 'src/components/FilterGroupsOptions.vue';
import GroupedTablesWrapper from 'src/modules/issue-list/components/table-view/GroupedTablesWrapper.vue';

import { SPRINT_GROUP_BY_OPTIONS } from 'src/constants/constants';
import { TypesIssuesListFilters } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  currentFilter: any;
  checkedRows?: any[];
  selection?: 'single' | 'multiple' | 'none';
  isCreateSprint?: boolean;
  isMobile?: boolean;
  aqlMode?: boolean;
}>();

const emits = defineEmits<{
  (event: 'toggle'): void;
  (event: 'toggle-right'): void;
  (event: 'update:checkedRows', checkedRows: any[]): void;
  (event: 'update:aqlMode', aqlMode: boolean): void;
}>();

const group_by = ref(SPRINT_GROUP_BY_OPTIONS[0].value);

const route = useRoute();

//stores
const { extendedSearchIssues, exportIssues } = useIssuesStore();
const { setNotificationView } = useNotificationStore();
const aqlStore = useAqlStore();

//state
const rows = ref([] as any);
const loading = ref(true);
const searchQuery = ref('');
const filter = ref();
const includeProperties = ref(false);
const exportPopupRef = ref();
const pagination = ref({
  sortBy: null,
  descending: true,
  page: 1,
  rowsPerPage: Screen.height > 720 ? 10 : 5,
  rowsNumber: 0,
});

// режим AQL: своё состояние, чтобы не затирать штатный поиск
const isAql = ref(!props.isCreateSprint && !!props.aqlMode);
const aqlSearchBarRef = ref<InstanceType<typeof AqlSearchBar> | null>(null);
const aqlQuery = ref('');
// последний успешно выполненный запрос: его повторяет пагинация
const aqlExecuted = ref<string | null>(null);
const aqlError = ref<AqlQueryError | null>(null);
const aqlRows = ref([] as any);
const aqlLoading = ref(false);
const aqlPagination = ref({
  sortBy: null as string | null,
  descending: false,
  page: 1,
  rowsPerPage: Screen.height > 720 ? 10 : 5,
  rowsNumber: 0,
});
let aqlRequestId = 0;

//computeds
const currentWorkspaceSlug = computed(
  () => route.params.workspace as string | undefined,
);

const canScopeToWorkspace = computed(
  () =>
    !props.isCreateSprint &&
    !!currentWorkspaceSlug.value &&
    !route.path.includes('admin-panel'),
);

const isScopedToWorkspace = computed(() => {
  const current = filter.value as TypesIssuesListFilters | undefined;
  return (
    canScopeToWorkspace.value &&
    !current?.workspaces?.length &&
    !current?.workspace_slugs?.length &&
    !current?.projects?.length
  );
});

const visibleColumns = computed(() => {
  return columnsToShow.value
    .map((name) => columns.find((c) => c.name === name))
    .filter(Boolean);
});

const allColumns = computed(() => {
  const inactive = columns.filter(
    (el) => !columnsToShow.value.includes(el.name),
  );
  return [...visibleColumns.value, ...inactive];
});

const checkedRows = computed({
  get: () => props.checkedRows,
  set: (val) => {
    if (val) emits('update:checkedRows', val);
  },
});

const isGrouped = computed(() => !isAql.value && group_by.value !== 'none');

// в режиме AQL ещё ничего не найдено: запроса не было или он завершился ошибкой
// сколько от высоты окна занято шапкой и низом, когда вместо таблицы заглушка
const emptyBlockOffset = computed(() => {
  if (props.isCreateSprint) return 122;
  return isAql.value ? 172 : 132;
});

const isAqlIdle = computed(() => isAql.value && aqlExecuted.value === null);
const aqlTotal = computed(() =>
  aqlExecuted.value !== null && !aqlLoading.value
    ? aqlPagination.value.rowsNumber
    : null,
);

const viewRows = computed(() => (isAql.value ? aqlRows.value : rows.value));

const viewLoading = computed(() =>
  isAql.value ? aqlLoading.value : loading.value,
);

const viewPagination = computed(() =>
  isAql.value ? aqlPagination.value : pagination.value,
);

onMounted(() => {
  if (applyQueryFromRoute() || isAql.value) return;
  onRequest(pagination.value);
});

//methods
function defineFiltersByEntity(entity): TypesIssuesListFilters {
  if (!entity) return {};

  // простые соответствия
  const map: Record<string, keyof TypesIssuesListFilters> = {
    state: 'states',
    labels: 'labels',
    priority: 'priorities',
    watchers: 'watchers',
    assignees: 'assignees',
    author: 'authors',
    project: 'projects',
  };

  const filterKey = map[group_by.value];
  if (!filterKey) return {};

  const value = entity?.id ?? entity;
  return value ? { [filterKey]: [value] } : {};
}

const buildSearchRequest = (): TypesIssuesListFilters => {
  const req: TypesIssuesListFilters = {
    ...((filter.value as TypesIssuesListFilters) ?? {}),
    search_query: searchQuery.value,
  };

  if (isScopedToWorkspace.value) {
    req.workspace_slugs = [currentWorkspaceSlug.value as string];
  }

  return req;
};

const onRequestGroupTable = async (group, p) => {
  const req = {
    ...buildSearchRequest(),
    ...defineFiltersByEntity(group.entity),
  };
  const order_by = !p.sortBy && searchQuery.value ? 'search_rank' : p.sortBy;
  const { issues, count, limit } = await extendedSearchIssues(req as any, {
    order_by: order_by,
    desc: p.descending,
    offset: (p.page - 1) * (p.rowsPerPage == 0 ? 10 : p.rowsPerPage),
    limit: p.rowsPerPage == 0 ? p.rowsNumber || 10 : p.rowsPerPage,
    light: true,
    only_active: filter.value?.only_active || false,
  });

  group.issues = issues;
  group.count = count;
};

const onRequest = async (p) => {
  if (props.isCreateSprint && !filter.value) return;
  loading.value = true;
  // TODO: удалять only_active из req, так как он будет отправляться в query
  const req = buildSearchRequest();
  const order_by = !p.sortBy && searchQuery.value ? 'search_rank' : p.sortBy;
  // заменить на общий метод поиск задач
  const { issues, count, limit } = await extendedSearchIssues(req as any, {
    order_by: order_by,
    desc: p.descending,
    offset: (p.page - 1) * (p.rowsPerPage == 0 ? 10 : p.rowsPerPage),
    limit: p.rowsPerPage == 0 ? p.rowsNumber || 10 : p.rowsPerPage,
    light: true,
    only_active: filter.value?.only_active || false,
    group_by: group_by.value !== 'none' ? group_by.value : undefined,
  });
  let filteredIssues = issues;
  if (group_by.value !== 'none') {
    filteredIssues = issues.filter((el) => el.issues);
  }
  rows.value = [];
  rows.value = filteredIssues;
  pagination.value.rowsNumber = count;
  pagination.value.rowsPerPage = limit;
  pagination.value.page = p.page;
  pagination.value.sortBy = p.sortBy;
  pagination.value.descending = p.descending;
  loading.value = false;
};

const downloadZip = async (p) => {
  try {
    const req = buildSearchRequest();

    const order_by = !p.sortBy && searchQuery.value ? 'search_rank' : p.sortBy;

    const pagination = {
      order_by: order_by,
      desc: p.descending,
      offset: (p.page - 1) * (p.rowsPerPage == 0 ? 10 : p.rowsPerPage),
      limit: p.rowsPerPage == 0 ? p.rowsNumber || 10 : p.rowsPerPage,
      light: true,
      only_active: filter.value?.only_active || false,
      group_by: group_by.value !== 'none' ? group_by.value : undefined,
    };

    await exportIssues(req, pagination, includeProperties.value);

    exportPopupRef.value?.hide();
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Файл успешно скачан',
    });
  } catch {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Не удалось скачать файл',
    });
  }
};

// запрос AQL; true — ответ получен и показан
const requestAql = async (query: string, page: number) => {
  const id = ++aqlRequestId;
  aqlLoading.value = true;

  const limit = Math.min(aqlPagination.value.rowsPerPage || 10, 100);
  const res = await searchIssuesByAql(query, limit, (page - 1) * limit);

  // пока ждали, ушёл более новый запрос
  if (id !== aqlRequestId) return false;
  aqlLoading.value = false;

  if (!res.ok) {
    aqlRows.value = [];
    aqlExecuted.value = null;
    // позиции ошибки относятся к отправленному тексту
    if (res.queryError && query === aqlQuery.value) {
      aqlError.value = res.queryError;
    } else {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: res.queryError?.message || res.message,
      });
    }
    return false;
  }

  // индикатор сортировки в заголовке — по ORDER BY выполненного запроса
  const order = getOrderBy(query);
  aqlRows.value = res.issues;
  aqlExecuted.value = query;
  aqlPagination.value = {
    sortBy: order?.column ?? null,
    descending: order?.desc ?? false,
    page,
    rowsPerPage: limit,
    rowsNumber: res.count,
  };
  return true;
};

// новый поиск по тексту в поле, с первой страницы
const startAqlSearch = async (toHistory = true) => {
  const query = aqlQuery.value;
  if (!query.trim()) return;

  aqlError.value = null;
  const found = await requestAql(query, 1);
  if (found && toHistory) aqlStore.addToHistory(query.trim());
};

const onAqlInput = (value: string) => {
  aqlQuery.value = value;
  // позиции ошибки устарели
  aqlError.value = null;
};

// подставить запрос в поле и выполнить: история запросов, ссылка
const searchAql = (query: string) => {
  isAql.value = true;
  onAqlInput(query);
  startAqlSearch();
};

// клик по заголовку столбца переписывает ORDER BY в тексте запроса;
// в историю такой поиск не пишется, иначе её забивают варианты сортировки
const onAqlSort = (p) => {
  onAqlInput(setOrderBy(aqlQuery.value, p.sortBy ?? null, !!p.descending));
  if (aqlQuery.value.trim()) {
    startAqlSearch(false);
    return;
  }

  // от запроса ничего не осталось — искать нечего
  aqlRequestId++;
  aqlLoading.value = false;
  aqlRows.value = [];
  aqlExecuted.value = null;
};

// запрос из ссылки /s/?aql=...
const applyQueryFromRoute = () => {
  const query = aqlStore.queryFromRoute;
  if (props.isCreateSprint || query == null) return false;

  aqlStore.setQueryFromRoute(null);
  searchAql(query);
  return true;
};

const onTableRequest = (p) => (isAql.value ? onAqlSort(p) : onRequest(p));

const onPaginationRequest = () => {
  if (!isAql.value) return onRequest(pagination.value);
  if (aqlExecuted.value !== null)
    requestAql(aqlExecuted.value, aqlPagination.value.page);
};

const handleSearchIssues = debounce(() => {
  pagination.value = {
    sortBy: null,
    descending: true,
    page: 1,
    rowsPerPage: pagination.value.rowsPerPage,
    rowsNumber: 0,
  };

  onRequest(pagination.value);
}, 700);

watch(
  () => props.currentFilter,
  () => {
    filter.value = props.currentFilter ? props.currentFilter : {};
    onRequest(pagination.value);
  },
  { deep: true },
);

watch(
  () => props.aqlMode,
  (value) => {
    isAql.value = !props.isCreateSprint && !!value;
  },
);

watch(isAql, (value) => {
  emits('update:aqlMode', value);
  if (value) nextTick(() => aqlSearchBarRef.value?.focus());
  // результаты штатного поиска могли устареть
  else onRequest(pagination.value);
});

watch(() => aqlStore.queryFromRoute, applyQueryFromRoute);

defineExpose({ searchAql, aqlQuery });

const columns = [
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'sequence_id',
    label: 'ID',
    align: 'left',
    field: (row: any) => {
      return `${row.project_detail?.identifier} - ${row.sequence_id}`;
    },
    sortable: true,
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
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'priority',
    align: 'left',
    label: 'Приоритет',
    field: (row: any) => {
      return row.priority;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'state',
    align: 'left',
    label: 'Статус',
    field: (row: any) => {
      return row.state_detail;
    },
    sortable: true,
  },
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'target_date',
    align: 'left',
    label: 'Срок исполнения',
    field: (row: any) => {
      return row.target_date ? formatDateTime(row.target_date) : '-';
    },
    sortable: true,
  },
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px; white-space: nowrap',
    name: 'updated_at',
    align: 'left',
    label: 'Последнее изменение',
    field: (row: any) => {
      return formatDateTime(row.updated_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'author',
    align: 'left',
    label: 'Автор',
    field: (row: any) => {
      return row.author_detail;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'assignees',
    align: 'center',
    label: 'Исполнитель',
    field: (row: any) => {
      return row.assignee_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'watchers',
    align: 'center',
    label: 'Наблюдатели',
    field: (row: any) => {
      return row.watcher_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'labels',
    align: 'left',
    label: 'Теги',
    field: (row: any) => {
      return row.label_details;
    },
    sortable: true,
  },
];

const columnsToShow = ref(columns.map((el) => el.name));
</script>

<style scoped lang="scss">
.search-scope-hint {
  font-size: 12px;
  color: var(--sub-text-color);
}

// строка запроса AQL растёт вниз: меню остаётся у первой строки
.aql-top-control {
  margin-top: 3px;
}

.aql-toggle {
  flex-shrink: 0;
}

.aql-idle-hint {
  color: var(--sub-text-color);
}

// шапка окна поиска опущена на 10px, до уровня кнопки «Создать фильтр»
.table-search.search-filters-table {
  max-height: calc(76vh - 10px);
  @media (max-width: 768px) {
    max-height: calc(72vh - 10px);
  }
  @media (max-width: 500px) {
    max-height: calc(66vh - 10px);
  }
}

// шапка в режиме AQL выше ещё на ряд кнопок, зато внизу нет строки счётчика
.table-aql.search-filters-table {
  max-height: calc(76vh - 29px);
  @media (max-width: 768px) {
    max-height: calc(72vh - 29px);
  }
  @media (max-width: 500px) {
    max-height: calc(66vh - 29px);
  }
}

.sticky-fix {
  position: sticky;
  z-index: 110;
  background-color: var(--bg-color);
}

.sticky-fix.top {
  top: 0;
}

.sticky-fix.bottom {
  bottom: 0;
}

.pagination {
  display: flex;
  justify-content: end;
  width: 100%;
  padding-top: 10px;
}

:deep(.q-table__bottom) {
  min-height: 0;
}

.table-in-groups :deep(.q-table__middle) {
  overflow: hidden;
}

:deep(.new-year-scroll-container),
:deep(.scroll-container) {
  height: calc(100vh - 200px);
}
</style>
