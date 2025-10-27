<template>
  <div class="filters">
    <div class="filters__buttons">
      <q-btn
        no-caps
        class="primary-btn full-w q-mb-sm"
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
        class="secondary-btn full-w"
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
      v-if="!loading && myFilterList.length > 0"
      class="filters__list scrollable-content"
    >
      <q-list>
        <q-item v-for="filter in myFilterList" :key="filter.id" clickable>
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
            <span class="abbriviated-text">{{ filter?.name }}</span>
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
              <HintTooltip>Удалить фильтр</HintTooltip>

              <BinIcon color="#DC3E3E" :width="16" :height="16"></BinIcon>
            </q-btn>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
  <div
    v-if="loading || (!loading && myFilterList.length == 0)"
    class="column justify-center"
    style="height: 90%"
  >
    <DefaultLoader v-if="loading" class="self-center" :size="2" unit="em" />
    <div v-if="!loading && myFilterList.length == 0" class="self-center">
      <h6>Нет фильтров</h6>
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
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useFiltersStore } from 'src/modules/search-issues/stores/filters-store';

// interfaces
import {
  DtoSearchFilterFull,
  TypesIssuesListFilters,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

// components
import AddFilterDialog from './add-filter/AddFilterDialog.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import ConfirmDeleteFilterDialog from 'src/modules/search-issues/filter-list/ui/ConfirmDeleteFilterDialog.vue';

//services
import { getMyFilters, getFilterById } from '../../services/api';

const emits = defineEmits<{
  'update-filter': [value?: TypesIssuesListFilters];
}>();

// store
const filtersStore = useFiltersStore();

// store to refs
const { myFilterList } = storeToRefs(filtersStore);

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
    filterToEdit.value = await getFilterById(filtersStore.filterIdFromRoute);
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
  padding: 10px 10px 16px 10px;
  background-color: $bg-color;
  display: flex;
  flex-direction: column;
}

.filters__list {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 10px 10px 10px;
}

:deep(.q-item:nth-child(1)) {
  padding-top: 0;
}
</style>
