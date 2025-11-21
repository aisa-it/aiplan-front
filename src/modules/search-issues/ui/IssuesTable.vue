<template>
  <div style="height: 100%; padding: 10px 10px 10px 0">
    <div class="row no-wrap items-center q-mb-sm">
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
        @click="onRequest(pagination)"
      >
        <RefreshIcon />
      </q-btn>
      <q-btn flat dense round style="height: 30px; width: 30px" class="q-ml-sm">
        <Filterv2Icon />
        <q-menu style="width: 200px" :offset="[-10, 10]">
          <q-card class="column q-py-md q-pl-sm q-pr-md">
            <h6 style="margin: 4px 0 4px 8px !important">Колонки</h6>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.name"></q-checkbox>
              <span> Название </span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.priority"></q-checkbox>
              <span> Приоритет </span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.state"></q-checkbox>
              <span> Статус </span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.target_date"></q-checkbox>
              <span> Срок исполнения</span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.created_at"></q-checkbox>
              <span> Дата создания </span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.updated_at"></q-checkbox>
              <span>
                Последнее<br />
                изменение
              </span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.author"></q-checkbox>
              <span> Автор </span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.assignees"></q-checkbox>
              <span> Исполнитель </span>
            </div>
            <div class="row gap-x-sm centered-horisontally">
              <q-checkbox v-model="columnsToShow.labels"></q-checkbox>
              <span> Теги </span>
            </div>
          </q-card>
        </q-menu>
      </q-btn>
    </div>
    <q-table
      v-if="!loading"
      v-model:pagination="pagination"
      flat
      row-key="id"
      class="my-sticky-column-table search-filters-table table-bottom-reverse"
      :hide-no-data="true"
      :rows="rows"
      :columns="allColumns"
      :rows-per-page-options="
        Screen.height > 720 ? [10, 25, 50] : [5, 10, 25, 50]
      "
      @request="(e) => onRequest(e.pagination)"
      @row-click="(evt, row) => route(row)"
    >
      <template #bottom>
        <PaginationDefault
          v-model:selected-page="pagination.page"
          v-model:rows-per-page="pagination.rowsPerPage"
          :rows-number="pagination.rowsNumber"
          :rows-per-page-options="
            Screen.height > 720 ? [10, 25, 50] : [5, 10, 25, 50]
          "
          show-rows-per-page
          @request="onRequest(pagination)"
        />
      </template>

      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div style="text-overflow: ellipsis; overflow: hidden">
            <span v-html="parseBoldText(props.value)" />
            <HintTooltip>
              <span v-html="parseBoldText(props.value)"
            /></HintTooltip>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-state="props">
        <q-td :props="props">
          <div
            class="centered-horisontally"
            style="max-width: 190px; min-width: 100px"
          >
            <q-badge
              rounded
              class="q-mr-sm"
              :style="{ backgroundColor: props.value.color }"
              style="height: 12px; width: 12px"
            />
            <span class="abbriviated-text">
              {{ props.value.name }}
            </span>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-author="props">
        <q-td :props="props">
          <AvatarImage
            :key="props.value.name"
            :tooltip="aiplan.UserName(props.value).join(' ')"
            :text="
              [
                aiplan.UserName(props.value)[0]?.at(0),
                aiplan.UserName(props.value)[1]?.at(0),
              ].join(' ')
            "
            :image="props.value.avatar_id"
            :member="props.value"
          ></AvatarImage>
        </q-td>
      </template>

      <template v-slot:body-cell-assignees="props">
        <q-td :props="props" style="position: relative">
          <AvatarImage
            v-for="(l, n) in props.value"
            :style="{ zIndex: props.value.length - n }"
            class="overlapping"
            :key="l.name"
            :tooltip="aiplan.UserName(l).join(' ')"
            :text="
              [aiplan.UserName(l)[0]?.at(0), aiplan.UserName(l)[1]?.at(0)].join(
                ' ',
              )
            "
            :image="l.avatar_id"
            :member="l"
          ></AvatarImage>
        </q-td>
      </template>

      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <div
            v-if="props.value"
            class="centered-horisontally"
            style="max-width: 190px; min-width: 100px"
          >
            <PrioritySingleIcon :type="props.value" />
            <span class="q-ml-xs">{{ p[props.value] }}</span>
          </div>
          <div v-else>Не выбран</div>
        </q-td>
      </template>

      <template v-slot:body-cell-labels="props">
        <q-td :props="props">
          <div class="row no-wrap" style="gap: 4px">
            <q-badge
              v-for="l in props.value"
              :key="l?.name"
              class="q-ml-xs overflow-hidden"
              :style="['background-color: ' + l.color, 'max-width: 200px']"
            >
              <span class="abbriviated-text">
                {{ l?.name }}
                <HintTooltip>
                  {{ l?.name }}
                </HintTooltip>
              </span>
            </q-badge>
          </div>
        </q-td>
      </template>
    </q-table>
    <div class="text-right q-mr-md" v-show="!loading">
      Всего: {{ pagination.rowsNumber }}
    </div>
    <div
      v-show="loading || rows.length === 0"
      style="height: calc(90vh - 122px)"
      class="centered-horisontally justify-center"
    >
      <h6 v-if="!loading && rows.length === 0">Нет задач</h6>
      <DefaultLoader v-if="loading" />
    </div>
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { debounce, Screen } from 'quasar';
import { onMounted, ref, watch, computed } from 'vue';

// stores
import { useIssuesStore } from 'src/stores/issues-store';
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDateTime } from 'src/utils/time';

// components
import MenuIcon from 'src/components/icons/MenuIcon.vue';
import AvatarImage from 'src/components/AvatarImage.vue';
import Filterv2Icon from 'src/components/icons/Filterv2Icon.vue';
import RefreshIcon from 'src/components/icons/RefreshIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import PaginationDefault from 'components/pagination/PaginationDefault.vue';
import PrioritySingleIcon from 'src/components/icons/PrioritySingleIcon.vue';
import { parseBoldText } from 'src/utils/helpers';

const props = defineProps<{
  currentFilter: any;
}>();

const emits = defineEmits<{
  toggle: [];
}>();

const { extendedSearchIssues } = useIssuesStore();
const filtersStore = useFiltersStore();
const { columnsToShow } = storeToRefs(filtersStore);
const router = useRouter();
const rows = ref([] as any);
const loading = ref(true);
const searchQuery = ref('');
const filter = ref();
const pagination = ref({
  sortBy: 'sequence_id',
  descending: true,
  page: 1,
  rowsPerPage: Screen.height > 720 ? 10 : 5,
  rowsNumber: 0,
});

const p = {
  urgent: 'Критический',
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  null: 'Нет',
};

onMounted(() => {
  onRequest(pagination.value);
});

const onRequest = async (p) => {
  loading.value = true;
  // TODO: удалять only_active из req, так как он будет отправляться в query
  let req = Object.assign((filter.value as any) ?? {}, {
    search_query: searchQuery.value,
  });

  // заменить на общий метод поиск задач
  const { issues, count, limit } = await extendedSearchIssues(req as any, {
    order_by: p.sortBy,
    desc: p.descending,
    offset: (p.page - 1) * (p.rowsPerPage == 0 ? 10 : p.rowsPerPage),
    limit: p.rowsPerPage == 0 ? p.rowsNumber || 10 : p.rowsPerPage,
    light: true,
    show_sub_issues: true,
    only_active: filter.value?.only_active || false,
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

const handleSearchIssues = debounce(() => {
  pagination.value = {
    sortBy: 'sequence_id',
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

const allColumns = computed(() => {
  return (
    columns.filter((col) => columnsToShow.value[col.name] == true) || columns
  );
  // columns.filter((col) => {
  //   if (!columnsToShow.value || columnsToShow.value.length == 0)
  //     return true;
  //   return columnsToShow.value.some((c: any) => c === col.name);
  // });
});

const columns = [
  {
    style: 'width: 10px',
    name: 'sequence_id',
    label: 'ID',
    align: 'left',
    field: (row: any) => {
      return `${row.project_detail.identifier} - ${row.sequence_id}`;
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
    style: 'width: 10px',
    name: 'target_date',
    align: 'left',
    label: 'Срок исполнения',
    field: (row: any) => {
      return row.target_date ? formatDateTime(row.target_date) : '-';
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
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

const route = (row) => {
  const routeData = router.resolve(
    `/${row.workspace_detail?.slug}/projects/${row.project_detail?.id}/issues/${row.id}`,
  );
  window.open(routeData.href, '_blank');
};
</script>

<style scoped lang="scss">
:deep(.q-table__progress) {
  display: none;
}
.my-sticky-column-table {
  ::-webkit-scrollbar {
    display: block;
  }
}
</style>
<style lang="scss">
.search-filters-table {
  max-height: 83vh;
  @media (max-width: 1366px) {
    max-height: 81vh;
  }
  @media (max-width: 768px) {
    max-height: 79vh;
  }
}
@supports (-moz-appearance: none) {
  .search-filters-table .q-table__middle {
    scrollbar-width: thin;
  }
}
</style>
