<template>
  <div class="filters">
    <div class="filters__buttons">
      <q-btn
        no-caps
        class="primary-btn full-w"
        @click="
          {
            isOpenAddingFilter = true;
          }
        "
        >Создать фильтр</q-btn
      >
      <q-btn
        v-if="currentFilter"
        no-caps
        class="secondary-btn full-w q-mt-sm"
        @click="
          () => {
            currentFilter = null;
            emits('update-filter', {});
          }
        "
      >
        Сбросить фильтр</q-btn
      >
    </div>
    <div
      v-if="!loading && shownFilters.length > 0"
      class="filters__list scrollable-content"
    >
      <q-list>
        <q-item
          v-for="filter in shownFilters"
          :key="filter.id"
          clickable
          class="filters__item"
        >
          <q-item-section class="no-wrap centered-horisontally">
            <q-radio
              dense
              v-model="currentFilter"
              :val="filter?.id"
              class="q-mr-sm"
              @click="
                () => {
                  if (cachedFilter && cachedFilter === currentFilter) {
                    currentFilter = null;
                    cachedFilter = ' ';
                    emits('update-filter', {});
                  } else {
                    cachedFilter = currentFilter;
                  }
                }
              "
              @update:model-value="
                (e) => {
                  emits(
                    'update-filter',
                    myFilterList.find(
                      (el: DtoSearchFilterFull) => el.id === currentFilter,
                    )?.filter,
                  );
                }
              "
            />
            <span class="abbriviated-text filters__name">{{
              filter?.name
            }}</span>
            <q-btn
              flat
              dense
              :disable="!filter.aql?.trim()"
              @click="copyAqlLink(filter.aql ?? '')"
            >
              <LinkIcon :width="16" :height="16" />
              <HintTooltip>Скопировать ссылку</HintTooltip>
            </q-btn>
            <q-btn
              flat
              dense
              @click="
                () => {
                  filterToEdit = filter;
                  isOpenAddingFilter = true;
                }
              "
            >
              <EditIcon :width="16" :height="16"></EditIcon>
              <HintTooltip>Редактировать фильтр</HintTooltip>
            </q-btn>
            <q-btn
              flat
              dense
              @click="
                () => {
                  isDeletingOpen = true;
                  filterToDelete = filter;
                }
              "
            >
              <HintTooltip>{{
                !filter?.author_id || filter.author_id === userStore.user?.id
                  ? 'Удалить фильтр'
                  : 'Убрать фильтр из своего списка'
              }}</HintTooltip>

              <BinIcon color="#DC3E3E" :width="16" :height="16"></BinIcon>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <div
      v-if="loading || (!loading && shownFilters.length == 0)"
      class="filters__empty column justify-center"
    >
      <DefaultLoader v-if="loading" class="self-center" :size="2" unit="em" />
      <div v-if="!loading && shownFilters.length == 0" class="self-center">
        <h6>Нет фильтров</h6>
      </div>
    </div>
  </div>
  <AddFilterDialog
    v-model="isOpenAddingFilter"
    :current-filter="filterToEdit"
    @save-temp-filter="
      (filter) => {
        emits('update-filter', filter?.filter);
        currentFilter = filter.filter;
      }
    "
    @refresh="
      async () => {
        await getUserFilters();
        myFilterList = filters;
        let filter = {} as DtoSearchFilterFull;
        if (filterToEdit?.id == currentFilter) {
          filter =
            filters.find((f) => f?.id === currentFilter) ||
            ({} as DtoSearchFilterFull);
          emits('update-filter', filter?.filter);
        }
      }
    "
    @hide="filterToEdit = null"
  />
  <ConfirmDeleteFilterDialog
    v-model="isDeletingOpen"
    :filter="filterToDelete"
    :current-filter="currentFilter"
    @reset-by-delete="
      () => {
        currentFilter = null;
        emits('update-filter', {});
      }
    "
  />
</template>

<script setup lang="ts">
// core
import { ref, computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';
import { useUserStore } from 'src/stores/user-store';
import { useAqlStore } from 'src/modules/search-issues/aql/stores/aql-store';

// interfaces
import {
  DtoSearchFilterFull,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

// components
import AddFilterDialog from './add-filter/AddFilterDialog.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import ConfirmDeleteFilterDialog from 'src/modules/search-issues/filter-list/ui/ConfirmDeleteFilterDialog.vue';

//services
import { getMyFilters, getFilterById } from '../../services/api';
import { AqlFilter } from 'src/modules/search-issues/aql/services/api';
import { useCopyAqlLink } from 'src/modules/search-issues/aql/utils/copyLink';
import { hasOldConditions } from '../utils/conditions';

const emits = defineEmits<{
  'update-filter': [value?: TypesIssuesListFilters];
}>();

// store
const filtersStore = useFiltersStore();
const userStore = useUserStore();

// store to refs
const { myFilterList } = storeToRefs(filtersStore);

// фильтр без старых условий сохранён запросом AQL: штатному поиску он пуст
const shownFilters = computed(() =>
  (myFilterList.value as AqlFilter[]).filter((filter) =>
    hasOldConditions(filter.filter),
  ),
);

const copyAqlLink = useCopyAqlLink();

// loader
const loading = ref(false);
// dialog vars
const isDeletingOpen = ref(false);
const isOpenAddingFilter = ref(false);
// vars
const filters = ref<DtoSearchFilterFull[]>([]);
const filterToEdit = ref<DtoSearchFilterFull | null>(null);
const currentFilter = ref();
const filterToDelete = ref<DtoSearchFilterFull>({});
const cachedFilter = ref('');
const getUserFilters = async () => {
  loading.value = true;
  filters.value = await getMyFilters();
  loading.value = false;
};

onMounted(async () => {
  if (!!filtersStore.filterIdFromRoute) {
    const filter: AqlFilter = await getFilterById(
      filtersStore.filterIdFromRoute,
    );

    // ссылка на фильтр, сохранённый запросом: его открывает режим AQL
    if (!hasOldConditions(filter.filter) && filter.aql?.trim()) {
      // список смонтирован не в одном месте: запрос отдаёт первый
      if (filtersStore.filterIdFromRoute) {
        filtersStore.setFilterId(null);
        useAqlStore().setQueryFromRoute(filter.aql);
      }
      return;
    }

    filterToEdit.value = filter;
    isOpenAddingFilter.value = true;
  }
});
</script>

<style scoped lang="scss">
.filters {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filters__buttons {
  flex-shrink: 0;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 10;
  padding: 10px 10px 8px 10px;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

// заглушка занимает остаток меню: отдельным блоком она добавляла ему прокрутку
.filters__empty {
  flex: 1 1 auto;
  min-height: 0;
}

.filters__list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 2px 6px 2px;
}

// размеры строки те же, что у списка фильтров в режиме AQL
.filters__item {
  min-height: 0;
  padding: 2px 4px 2px 8px;
  border-radius: 8px;
}

.filters__name {
  font-size: 13px;
}
</style>
