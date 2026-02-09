<template>
  <div style="height: 100%; padding: 0 10px 0 0">
    <div
      class="row no-wrap items-center q-mb-sm sticky-fix top"
      :style="!isCreateSprint ? { padding: '10px 0 0' } : {}"
    >
      <q-btn
        flat
        dense
        round
        aria-label="Menu"
        style="height: 30px; width: 30px"
        class="q-mr-sm q-ml-sm"
        @click="emits('toggle')"
      >
        <MenuIcon />
      </q-btn>
      <q-input
        v-model="searchQuery"
        class="base-input full-w"
        dense
        label="Поиск"
        @update:model-value="handleSearchIssues"
      ></q-input>

      <q-btn
        flat
        dense
        round
        style="height: 30px; width: 30px"
        class="q-ml-sm"
        @click="downloadZip(pagination)"
        v-if="!isCreateSprint"
      >
        <FileZIPIcon />
        <q-tooltip>Скачать задачи архивом</q-tooltip>
      </q-btn>
      <q-btn
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
      <q-btn flat dense round style="height: 30px; width: 30px" class="q-ml-sm">
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
    <IssuesTableUI
      v-if="!loading && rows?.length && group_by === 'none'"
      :rows="rows"
      :columns="visibleColumns"
      :loading="loading"
      :pagination="pagination"
      :selection="selection"
      :selected-rows="checkedRows"
      :is-create-sprint="isCreateSprint"
      @update:selected-rows="(v) => (checkedRows = v)"
      @request="onRequest"
    />

    <GroupedTablesWrapper
      v-if="!loading && group_by !== 'none' && rows?.issues"
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
        />
      </template>
    </GroupedTablesWrapper>

    <div
      class="sticky-fix bottom"
      :style="!isCreateSprint ? { padding: '0 0 10px' } : {}"
      v-if="group_by === 'none'"
    >
      <PaginationDefault
        v-model:selected-page="pagination.page"
        v-model:rows-per-page="pagination.rowsPerPage"
        :rows-number="pagination.rowsNumber"
        :rows-per-page-options="
          Screen.height > 720 ? [10, 25, 50] : [5, 10, 25, 50]
        "
        show-rows-per-page
        @request="onRequest(pagination)"
        class="pagination"
      />
      <div
        class="q-mr-md"
        :class="isMobile ? 'text-center' : 'text-right'"
        v-show="!loading"
      >
        Всего: {{ pagination.rowsNumber }}
      </div>
    </div>
    <div
      v-show="loading || rows?.length === 0 || !rows?.issues"
      style="height: calc(90vh - 122px)"
      class="centered-horisontally justify-center"
    >
      <DefaultLoader v-if="loading" />
      <h6 v-else-if="rows?.length === 0 || !rows?.issues">
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
import { onMounted, ref, watch, computed } from 'vue';

// stores
import { useIssuesStore } from 'src/stores/issues-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import { formatDateTime } from 'src/utils/time';

// components
import IssuesTableUI from './IssuesTableUI.vue';
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
}>();

const emits = defineEmits<{
  (event: 'toggle'): void;
  (event: 'toggle-right'): void;
  (event: 'update:checkedRows', checkedRows: any[]): void;
}>();

const group_by = ref(SPRINT_GROUP_BY_OPTIONS[0].value);

//stores
const { extendedSearchIssues, exportIssues } = useIssuesStore();
const { setNotificationView } = useNotificationStore();

//state
const rows = ref([] as any);
const loading = ref(true);
const searchQuery = ref('');
const filter = ref();
const pagination = ref({
  sortBy: null,
  descending: true,
  page: 1,
  rowsPerPage: Screen.height > 720 ? 10 : 5,
  rowsNumber: 0,
});

//computeds
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

onMounted(() => {
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

const onRequestGroupTable = async (group, p) => {
  console.log(p);
  loading.value = true;

  let req = Object.assign((filter.value as any) ?? {}, {
    search_query: searchQuery.value,
  });
  req = { ...req, ...defineFiltersByEntity(group.entity) };
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
  loading.value = false;
};

const onRequest = async (p) => {
  if (props.isCreateSprint && !filter.value) return;
  loading.value = true;
  // TODO: удалять only_active из req, так как он будет отправляться в query
  let req = Object.assign((filter.value as any) ?? {}, {
    search_query: searchQuery.value,
  });
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
  rows.value = [];
  rows.value = issues;
  pagination.value.rowsNumber = count;
  pagination.value.rowsPerPage = limit;
  pagination.value.page = p.page;
  pagination.value.sortBy = p.sortBy;
  pagination.value.descending = p.descending;
  loading.value = false;
};

const downloadZip = async (p) => {
  try {
    let req = Object.assign((filter.value as any) ?? {}, {
      search_query: searchQuery.value,
    });

    const order_by = !p.sortBy && searchQuery.value ? 'search_rank' : p.sortBy;

    const pagination = {
      order_by: order_by,
      desc: p.descending,
      offset: (p.page - 1) * (p.rowsPerPage == 0 ? 10 : p.rowsPerPage),
      limit: p.rowsPerPage == 0 ? p.rowsNumber || 10 : p.rowsPerPage,
      light: true,
      only_active: filter.value?.only_active || false,
    };

    await exportIssues(req, pagination);

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
</style>
